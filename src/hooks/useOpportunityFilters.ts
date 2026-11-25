import { useMemo, useState } from 'react';
import { Opportunity, OpportunityCategoryId, OpportunityFilters, WorkMode } from '@/src/types/opportunity';

const DEFAULT_FILTERS: OpportunityFilters = {
  search: '',
  category: 'all',
  location: 'All Locations',
  workMode: 'all',
};

export function useOpportunityFilters(opportunities: Opportunity[]) {
  const [filters, setFilters] = useState<OpportunityFilters>(DEFAULT_FILTERS);

  const filteredOpportunities = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return opportunities.filter((item) => {
      if (filters.category !== 'all' && item.categoryId !== filters.category) {
        return false;
      }

      if (filters.location !== 'All Locations' && item.location !== filters.location) {
        return false;
      }

      if (filters.workMode !== 'all' && item.workMode !== filters.workMode) {
        return false;
      }

      if (query.length > 0) {
        const searchableText = [
          item.title,
          item.description,
          item.categoryLabel,
          item.location,
          item.creatorName,
          ...item.requiredSkills,
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(query);
      }

      return true;
    });
  }, [opportunities, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.category !== 'all') count += 1;
    if (filters.location !== 'All Locations') count += 1;
    if (filters.workMode !== 'all') count += 1;
    return count;
  }, [filters]);

  const setSearch = (search: string) =>
    setFilters((prev) => ({ ...prev, search }));

  const setCategory = (category: OpportunityCategoryId | 'all') =>
    setFilters((prev) => ({ ...prev, category }));

  const setLocation = (location: string) =>
    setFilters((prev) => ({ ...prev, location }));

  const setWorkMode = (workMode: WorkMode | 'all') =>
    setFilters((prev) => ({ ...prev, workMode }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    filters,
    filteredOpportunities,
    activeFilterCount,
    setSearch,
    setCategory,
    setLocation,
    setWorkMode,
    resetFilters,
  };
}
