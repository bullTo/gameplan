// Utility functions for team logos
import React from 'react';

/**
 * Cache for team logos to avoid repeated API calls
 * Format: { 'Team Name-SPORT': 'logo_url' }
 */
const logoCache = {};

/**
 * Get a team logo URL
 * @param {string} teamName - The name of the team
 * @param {string} sport - The sport (NBA, NFL, NHL, MLB, CFL, MLS)
 * @returns {Promise<string>} The logo URL
 */
export async function getTeamLogo(teamName, sport) {
  if (!teamName || !sport) {
    console.warn('Team name and sport are required to get a logo');
    return getDefaultLogo(sport);
  }
  
  // Check cache first
  const cacheKey = `${teamName}-${sport}`;
  if (logoCache[cacheKey]) {
    return logoCache[cacheKey];
  }
  
  // For now, just use default logos
  const defaultLogo = getDefaultLogo(sport);
  logoCache[cacheKey] = defaultLogo;
  return defaultLogo;
}

/**
 * Get a default logo for a sport
 * @param {string} sport - The sport (NBA, NFL, NHL, MLB, CFL, MLS)
 * @returns {string} The default logo URL
 */
export function getDefaultLogo(sport) {
  switch (sport) {
    case 'NBA':
      return '/home/badges/NBA Teams.png';
    case 'NFL':
      return '/home/badges/NFL Teams.png';
    case 'NHL':
      return '/home/badges/NHL Teams.png';
    case 'MLB':
      return '/home/badges/MLB Teams.png';
    case 'CFL':
      return '/home/badges/CFL Teams.png';
    case 'MLS':
      return '/home/badges/MLS Teams.png';
    default:
      return '/home/badges/NBA Teams.png';
  }
}

/**
 * Extract team name from a string that might contain "vs" or other text
 * @param {string} teamString - The string containing team name(s)
 * @returns {string} The extracted team name
 */
export function extractTeamName(teamString) {
  if (!teamString) return '';
  
  // If it contains "vs", take the first part
  if (teamString.includes(' vs ')) {
    return teamString.split(' vs ')[0].trim();
  }
  
  // Otherwise return as is
  return teamString.trim();
}

/**
 * React hook to get a team logo
 * @param {string} teamName - The name of the team
 * @param {string} sport - The sport (NBA, NFL, NHL, MLB, CFL, MLS)
 * @returns {string} The logo URL
 */
export function useTeamLogo(teamName, sport) {
  const [logoUrl, setLogoUrl] = React.useState(getDefaultLogo(sport));
  
  React.useEffect(() => {
    if (!teamName || !sport) {
      setLogoUrl(getDefaultLogo(sport));
      return;
    }
    
    const fetchLogo = async () => {
      const url = await getTeamLogo(teamName, sport);
      setLogoUrl(url);
    };
    
    fetchLogo();
  }, [teamName, sport]);
  
  return logoUrl;
}

/**
 * Team logo component
 * @param {Object} props - Component props
 * @param {string} props.teamName - The name of the team
 * @param {string} props.sport - The sport (NBA, NFL, NHL, MLB, CFL, MLS)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The team logo component
 */
export function TeamLogo({ teamName, sport, className = '', ...props }) {
  const logoUrl = useTeamLogo(extractTeamName(teamName), sport);
  
  return (
    <img
      src={logoUrl}
      alt={`${teamName} Logo`}
      className={`team-logo ${className}`}
      {...props}
    />
  );
}
