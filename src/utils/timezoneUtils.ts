// utils/timezoneUtils.ts

export interface USStateTimezone {
  state: string;
  timezone: string;
  abbreviation: string;
}

// US State to Timezone mapping
export const US_STATE_TIMEZONES: Record<string, USStateTimezone> = {
  // Eastern Time Zone
  'AL': { state: 'Alabama', timezone: 'America/Chicago', abbreviation: 'CT' }, // Most of AL is Central, small eastern part is Eastern
  'CT': { state: 'Connecticut', timezone: 'America/New_York', abbreviation: 'ET' },
  'DE': { state: 'Delaware', timezone: 'America/New_York', abbreviation: 'ET' },
  'FL': { state: 'Florida', timezone: 'America/New_York', abbreviation: 'ET' }, // Most of FL is Eastern, panhandle is Central
  'GA': { state: 'Georgia', timezone: 'America/New_York', abbreviation: 'ET' },
  'IN': { state: 'Indiana', timezone: 'America/New_York', abbreviation: 'ET' }, // Most of IN is Eastern, northwest/southwest is Central
  'KY': { state: 'Kentucky', timezone: 'America/New_York', abbreviation: 'ET' }, // Eastern KY is Eastern, Western KY is Central
  'ME': { state: 'Maine', timezone: 'America/New_York', abbreviation: 'ET' },
  'MD': { state: 'Maryland', timezone: 'America/New_York', abbreviation: 'ET' },
  'MA': { state: 'Massachusetts', timezone: 'America/New_York', abbreviation: 'ET' },
  'MI': { state: 'Michigan', timezone: 'America/New_York', abbreviation: 'ET' }, // Most of MI is Eastern, Upper Peninsula counties are Central
  'NH': { state: 'New Hampshire', timezone: 'America/New_York', abbreviation: 'ET' },
  'NJ': { state: 'New Jersey', timezone: 'America/New_York', abbreviation: 'ET' },
  'NY': { state: 'New York', timezone: 'America/New_York', abbreviation: 'ET' },
  'NC': { state: 'North Carolina', timezone: 'America/New_York', abbreviation: 'ET' },
  'OH': { state: 'Ohio', timezone: 'America/New_York', abbreviation: 'ET' },
  'PA': { state: 'Pennsylvania', timezone: 'America/New_York', abbreviation: 'ET' },
  'RI': { state: 'Rhode Island', timezone: 'America/New_York', abbreviation: 'ET' },
  'SC': { state: 'South Carolina', timezone: 'America/New_York', abbreviation: 'ET' },
  'TN': { state: 'Tennessee', timezone: 'America/New_York', abbreviation: 'ET' }, // Eastern TN is Eastern, Central/Western TN is Central
  'VT': { state: 'Vermont', timezone: 'America/New_York', abbreviation: 'ET' },
  'VA': { state: 'Virginia', timezone: 'America/New_York', abbreviation: 'ET' },
  'WV': { state: 'West Virginia', timezone: 'America/New_York', abbreviation: 'ET' },

  // Central Time Zone
  'AR': { state: 'Arkansas', timezone: 'America/Chicago', abbreviation: 'CT' },
  'IL': { state: 'Illinois', timezone: 'America/Chicago', abbreviation: 'CT' },
  'IA': { state: 'Iowa', timezone: 'America/Chicago', abbreviation: 'CT' },
  'KS': { state: 'Kansas', timezone: 'America/Chicago', abbreviation: 'CT' }, // Most of KS is Central, western counties are Mountain
  'LA': { state: 'Louisiana', timezone: 'America/Chicago', abbreviation: 'CT' },
  'MN': { state: 'Minnesota', timezone: 'America/Chicago', abbreviation: 'CT' },
  'MS': { state: 'Mississippi', timezone: 'America/Chicago', abbreviation: 'CT' },
  'MO': { state: 'Missouri', timezone: 'America/Chicago', abbreviation: 'CT' },
  'NE': { state: 'Nebraska', timezone: 'America/Chicago', abbreviation: 'CT' }, // Eastern NE is Central, western counties are Mountain
  'ND': { state: 'North Dakota', timezone: 'America/Chicago', abbreviation: 'CT' }, // Eastern ND is Central, southwestern counties are Mountain
  'OK': { state: 'Oklahoma', timezone: 'America/Chicago', abbreviation: 'CT' },
  'SD': { state: 'South Dakota', timezone: 'America/Chicago', abbreviation: 'CT' }, // Eastern SD is Central, western counties are Mountain
  'TX': { state: 'Texas', timezone: 'America/Chicago', abbreviation: 'CT' }, // Most of TX is Central, far western counties are Mountain
  'WI': { state: 'Wisconsin', timezone: 'America/Chicago', abbreviation: 'CT' },

  // Mountain Time Zone
  'AZ': { state: 'Arizona', timezone: 'America/Phoenix', abbreviation: 'MST' }, // Arizona doesn't observe DST (except Navajo Nation)
  'CO': { state: 'Colorado', timezone: 'America/Denver', abbreviation: 'MT' },
  'ID': { state: 'Idaho', timezone: 'America/Denver', abbreviation: 'MT' }, // Southern ID is Mountain, northern panhandle is Pacific
  'MT': { state: 'Montana', timezone: 'America/Denver', abbreviation: 'MT' },
  'NV': { state: 'Nevada', timezone: 'America/Los_Angeles', abbreviation: 'PT' }, // Most of NV is Pacific, one eastern county is Mountain
  'NM': { state: 'New Mexico', timezone: 'America/Denver', abbreviation: 'MT' },
  'UT': { state: 'Utah', timezone: 'America/Denver', abbreviation: 'MT' },
  'WY': { state: 'Wyoming', timezone: 'America/Denver', abbreviation: 'MT' },

  // Pacific Time Zone
  'CA': { state: 'California', timezone: 'America/Los_Angeles', abbreviation: 'PT' },
  'OR': { state: 'Oregon', timezone: 'America/Los_Angeles', abbreviation: 'PT' }, // Most of OR is Pacific, eastern counties are Mountain
  'WA': { state: 'Washington', timezone: 'America/Los_Angeles', abbreviation: 'PT' },

  // Alaska Time Zone
  'AK': { state: 'Alaska', timezone: 'America/Anchorage', abbreviation: 'AKST' },

  // Hawaii-Aleutian Time Zone
  'HI': { state: 'Hawaii', timezone: 'Pacific/Honolulu', abbreviation: 'HST' },
};

/**
 * Get timezone information for a US state
 * @param stateCode Two-letter state code (e.g., 'CA', 'NY')
 * @returns Timezone information or null if state not found
 */
export const getTimezoneForState = (stateCode: string): USStateTimezone | null => {
  const upperStateCode = stateCode?.toUpperCase();
  return US_STATE_TIMEZONES[upperStateCode] || null;
};

/**
 * Get timezone string for a US state
 * @param stateCode Two-letter state code (e.g., 'CA', 'NY')
 * @returns Timezone string (e.g., 'America/Los_Angeles') or browser timezone as fallback
 */
export const getTimezoneStringForState = (stateCode: string): string => {
  const timezoneInfo = getTimezoneForState(stateCode);
  return timezoneInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get timezone abbreviation for a US state
 * @param stateCode Two-letter state code (e.g., 'CA', 'NY')
 * @returns Timezone abbreviation (e.g., 'PT', 'ET') or 'Local' as fallback
 */
export const getTimezoneAbbreviationForState = (stateCode: string): string => {
  const timezoneInfo = getTimezoneForState(stateCode);
  return timezoneInfo?.abbreviation || 'Local';
};

/**
 * Format current time for a specific state
 * @param stateCode Two-letter state code
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatTimeForState = (
  stateCode: string, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const timezone = getTimezoneStringForState(stateCode);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return new Date().toLocaleTimeString('en-US', defaultOptions);
};

/**
 * Get all available US timezones with state examples
 */
export const getUSTimezones = () => {
  const timezones = new Map<string, { timezone: string; abbreviation: string; states: string[] }>();
  
  Object.entries(US_STATE_TIMEZONES).forEach(([stateCode, info]) => {
    const key = info.timezone;
    if (!timezones.has(key)) {
      timezones.set(key, {
        timezone: info.timezone,
        abbreviation: info.abbreviation,
        states: []
      });
    }
    timezones.get(key)!.states.push(stateCode);
  });
  
  return Array.from(timezones.values()).map(tz => ({
    ...tz,
    label: `${tz.abbreviation} - ${tz.timezone} (${tz.states.join(', ')})`
  }));
};