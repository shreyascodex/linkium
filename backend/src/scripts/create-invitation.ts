import 'dotenv/config';
import { z } from 'zod';
import { disconnectDatabase, prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { generateSecureToken, hashToken, normalizeEmail } from '../utils/crypto.js';

const cliArgsSchema = z.object({
  email: z.string().trim().email('Please pass a valid email address.'),
  note: z.string().trim().max(255).optional(),
  confirmProduction: z.boolean().default(false),
});

function parseCliArgs(argv: string[]): {
  email: string;
  note?: string;
  confirmProduction: boolean;
} {
  let email = '';
  let note: string | undefined;
  let confirmProduction = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--email' && argv[i + 1]) {
      email = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--email=')) {
      email = arg.slice('--email='.length);
    } else if (arg === '--note' && argv[i + 1]) {
      note = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--note=')) {
      note = arg.slice('--note='.length);
    } else if (arg === '--confirm-production') {
      confirmProduction = true;
    } else if (!arg.startsWith('-') && !email) {
      email = arg;
    }
  }

  return cliArgsSchema.parse({ email, note, confirmProduction });
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  if (env.NODE_ENV === 'production' && !args.confirmProduction) {
    throw new Error(
      'In production, pass --confirm-production to create a live beta invitation.'
    );
  }
  const normalizedEmail = normalizeEmail(args.email);
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  const invitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      tokenHash,
      note: args.note ?? null,
      expiresAt,
    },
    select: {
      id: true,
      email: true,
      expiresAt: true,
    },
  });

  const invitationUrl = `${env.APP_BASE_URL}/register?invitation=${encodeURIComponent(rawToken)}`;

  process.stdout.write('\nLINKIUM Invitation Created\n');
  process.stdout.write(`  Invitation ID : ${invitation.id}\n`);
  process.stdout.write(`  Email         : ${invitation.email}\n`);
  process.stdout.write(`  Expires At    : ${invitation.expiresAt.toISOString()}\n`);
  process.stdout.write(`  Invitation URL: ${invitationUrl}\n\n`);
  process.stdout.write('Copy this URL now — the raw token is not stored and will not be displayed again.\n');
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : 'Failed to create invitation.';
    process.stderr.write(`Error: ${message}\n`);
    process.stderr.write(
      'Usage: npm run invite:create -- --email user@example.com [--note "Kathmandu cohort"] [--confirm-production]\n'
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
