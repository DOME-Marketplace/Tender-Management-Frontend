export interface SearchOrganizationsFilters {
  categories: string[];
  countries: string[];
  complianceLevels: string[];
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const codeAliases: Record<string, string> = {
  EL: 'GR', // Greece
  UK: 'GB', // United Kingdom
};

export function countryName(code: string | null | undefined): string {
  if (!code) return '';
  const upper = code.toUpperCase();
  const normalized = codeAliases[upper] ?? upper;
  return regionNames.of(normalized) ?? upper;
}





