import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  FolderGit2,
  HeartHandshake,
  Trophy,
} from 'lucide-react';
import { OpportunityCategory } from '@/src/types/opportunity';

export interface CategoryCardProps {
  category: OpportunityCategory;
}

function CategoryIcon({ name }: { name: OpportunityCategory['iconName'] }) {
  const iconClass = 'w-5 h-5 text-[#4F46E5]';
  switch (name) {
    case 'FolderGit2':
      return <FolderGit2 className={iconClass} aria-hidden="true" />;
    case 'Briefcase':
      return <Briefcase className={iconClass} aria-hidden="true" />;
    case 'Trophy':
      return <Trophy className={iconClass} aria-hidden="true" />;
    case 'Calendar':
      return <Calendar className={iconClass} aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className={iconClass} aria-hidden="true" />;
    case 'HeartHandshake':
      return <HeartHandshake className={iconClass} aria-hidden="true" />;
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/opportunities?category=${category.id}`}
      className="group bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-5 transition-all duration-150 hover:border-[#CBD5E1] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
    >
      <div className="flex flex-col gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
          <CategoryIcon name={category.iconName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-medium text-[#64748B] group-hover:text-[#4F46E5] transition-colors">
        <span className="truncate">{category.exampleFocus}</span>
        <ArrowRight className="w-4 h-4 shrink-0 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
