import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { validateContactForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('beta-access');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactForm({ name, email, topic, message });
    if (!result.isValid) {
      setErrors(result.errors as Record<string, string>);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <section className="py-14 sm:py-20 bg-[#F8FAFC]">
      <PageContainer size="narrow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              Contact
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Get in touch with the team
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Questions about the Nepal invite-only beta, university partnerships, or organization plans? Prepare your message below or email us directly.
            </p>

            <div className="pt-2 flex flex-col gap-3 text-sm text-[#475569]">
              <a
                href={`mailto:${BRAND_CONFIG.contactEmail}`}
                className="flex items-center gap-2.5 hover:text-[#4F46E5] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
                <span>{BRAND_CONFIG.contactEmail}</span>
              </a>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
                <span>Kathmandu, Nepal (Initial Beta Region)</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8">
            {submitted ? (
              <div className="py-6 flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Inquiry ready to send
                </h2>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Thank you, <span className="font-medium text-[#0F172A]">{name}</span>. Direct in-app inbox submission is not yet active—send your validated inquiry directly through your email client or reach us at{' '}
                  <a
                    href={`mailto:${BRAND_CONFIG.contactEmail}`}
                    className="font-medium text-[#4F46E5] hover:underline"
                  >
                    {BRAND_CONFIG.contactEmail}
                  </a>
                  .
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${BRAND_CONFIG.contactEmail}?subject=${encodeURIComponent(`[LINKIUM Beta] ${topic} — ${name}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`}
                    className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    Open in Email Client
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                  >
                    Draft Another Note
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <Input
                  id="contact-name"
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />

                <Input
                  id="contact-email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-topic" className="text-sm font-medium text-[#0F172A]">
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  >
                    <option value="beta-access">Nepal Invite-Only Beta</option>
                    <option value="organization">Organization / University Partnership</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-sm font-medium text-[#0F172A]">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Share how you hope to collaborate or partner..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    className="w-full p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                  {errors.message && (
                    <p className="text-xs text-[#DC2626]" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Prepare Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
