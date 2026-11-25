import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, RefreshCw, RotateCcw } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from '@/src/data/categories';
import { DEMO_OPPORTUNITIES, OPPORTUNITY_LOCATIONS } from '@/src/data/opportunities';
import { useOpportunityFilters } from '@/src/hooks/useOpportunityFilters';
import { Opportunity, OpportunityCategoryId, WorkMode } from '@/src/types/opportunity';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { SearchBar } from '@/src/components/ui/SearchBar';
import { FilterDropdown } from '@/src/components/ui/FilterDropdown';
import { Button } from '@/src/components/ui/Button';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { OpportunityCard } from '@/src/components/opportunities/OpportunityCard';
import { OpportunityDetailModal } from '@/src/components/opportunities/OpportunityDetailModal';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...OPPORTUNITY_CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
  })),
];

const LOCATION_OPTIONS = OPPORTUNITY_LOCATIONS.map((loc) => ({
  value: loc,
  label: loc,
}));

const WORK_MODE_OPTIONS: Array<{ value: WorkMode | 'all'; label: string }> = [
  { value: 'all', label: 'All Formats' },
  { value: 'Remote', label: 'Remote' },
  { value: 'On-site', label: 'On-site' },
  { value: 'Hybrid', label: 'Hybrid' },
];

export function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    filters,
    filteredOpportunities,
    activeFilterCount,
    setSearch,
    setCategory,
    setLocation,
    setWorkMode,
    resetFilters,
  } = useOpportunityFilters(DEMO_OPPORTUNITIES);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (
      categoryParam &&
      OPPORTUNITY_CATEGORIES.some((cat) => cat.id === categoryParam)
    ) {
      setCategory(categoryParam as OpportunityCategoryId);
    }
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    const nextCategory = value as OpportunityCategoryId | 'all';
    setCategory(nextCategory);
    if (nextCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', nextCategory);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleReset = () => {
    resetFilters();
    if (searchParams.has('category')) {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer className="py-10 sm:py-14">
          <div className="flex flex-col gap-4 max-w-3xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              Public Discovery Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              Explore Opportunities
            </h1>
            <p className="text-base text-[#64748B] leading-relaxed">
              Search and filter sample projects, internships, competitions, learning circles, and events across Nepal.
            </p>
          </div>

          <div className="mt-6 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#64748B]">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-[#0F172A]">Demonstration Data Notice:</strong> The listings below are sample records for beta preview and are not live open postings.
            </span>
          </div>
        </PageContainer>
      </section>

      {/* Search, Filters & Results */}
      <section className="py-10 sm:py-12 bg-[#F8FAFC]">
        <PageContainer>
          {/* Filter Controls Bar */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 sm:p-6 mb-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-5 flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#64748B]">
                  Search Keywords
                </span>
                <SearchBar value={filters.search} onChange={setSearch} />
              </div>

              <div className="lg:col-span-3">
                <FilterDropdown
                  id="category-filter"
                  label="Category"
                  value={filters.category}
                  onChange={handleCategoryChange}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div className="lg:col-span-2">
                <FilterDropdown
                  id="location-filter"
                  label="Location"
                  value={filters.location}
                  onChange={setLocation}
                  options={LOCATION_OPTIONS}
                />
              </div>

              <div className="lg:col-span-2">
                <FilterDropdown
                  id="workmode-filter"
                  label="Format"
                  value={filters.workMode}
                  onChange={(val) => setWorkMode(val as WorkMode | 'all')}
                  options={WORK_MODE_OPTIONS}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[#64748B]">
                Showing{' '}
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  {filteredOpportunities.length}
                </span>{' '}
                of{' '}
                <span className="tabular-nums">{DEMO_OPPORTUNITIES.length}</span>{' '}
                demonstration opportunities
              </p>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset Filters ({activeFilterCount})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  Refresh Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {isRefreshing ? (
            <LoadingState count={4} />
          ) : filteredOpportunities.length === 0 ? (
            <EmptyState
              title="No matching demonstration opportunities"
              description="Try adjusting your search keywords, changing the selected city, or resetting the active filters to view all sample listings."
              actionLabel="Clear All Filters"
              onAction={handleReset}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSelect={setSelectedOpportunity}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
}
