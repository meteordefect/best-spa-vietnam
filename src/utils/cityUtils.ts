// List of two-tier cities (City → Wards)
const twoTierCities = [
  'vung-tau',
  'dalat',
  'nha-trang',
  'quy-nhon',
  'hue',
  'thai-binh',
  'ca-mau',
  'soc-trang',
  'phan-thiet',
  'tuy-hoa',
  'my-tho',
  'rach-gia',
  'tam-ky',
  'dong-hoi',
  'bac-giang',
  'bac-ninh'
];

// City information database
const cityInfoDatabase: { [key: string]: CityInfo } = {
  'hanoi': {
    name: 'Hanoi',
    description: 'The capital city of Vietnam, known for its authentic northern-style pho with wider noodles and a clearer broth.'
  },
  'ho-chi-minh-city': {
    name: 'Ho Chi Minh City',
    description: 'The southern metropolis where pho takes on a sweeter taste with more herbs and garnishes.'
  },
  'da-nang': {
    name: 'Da Nang',
    description: 'A coastal city offering unique central Vietnamese interpretations of pho with local spices and preparations.'
  },
  // Add more cities as needed
};

export interface CityInfo {
  name: string;
  description: string;
}

export interface AdminDivisionInfo {
  name: string;
  description: string;
  type: 'district' | 'ward';
}

/**
 * Get information about a city
 * @param {string} citySlug - The city slug
 * @returns {CityInfo} City information
 */
export function getCityInfo(citySlug: string): CityInfo {
  // Default city info in case the city is not in the database
  const defaultInfo: CityInfo = {
    name: citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `Explore the unique pho offerings in ${citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}.`
  };

  return cityInfoDatabase[citySlug] || defaultInfo;
}

/**
 * Check if a city uses two-tier administrative structure (City → Wards)
 * @param {string} citySlug - The city slug
 * @returns {boolean} True if the city is two-tier, false if three-tier
 */
export function isTwoTierCity(citySlug: string): boolean {
  return twoTierCities.includes(citySlug);
}
