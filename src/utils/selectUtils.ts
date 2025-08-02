// utils/selectUtils.ts

/**
 * Creates unique select options from an array, removing duplicates
 */
export function createUniqueSelectOptions<T extends string>(
  items: T[],
  labelFn?: (item: T) => string
): Array<{ value: T; label: string }> {
  // Remove duplicates using Set
  const uniqueItems = Array.from(new Set(items));
  
  return uniqueItems.map(item => ({
    value: item,
    label: labelFn ? labelFn(item) : item
  }));
}

/**
 * Creates select options from objects with ID and name/title
 */
export function createSelectOptionsFromObjects<T extends { [K: string]: any }>(
  items: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  fallbackLabel: string = 'Unknown'
): Array<{ value: string; label: string }> {
  return items
    .filter(item => item[valueKey] != null)
    .map(item => ({
      value: String(item[valueKey]),
      label: String(item[labelKey] || fallbackLabel)
    }));
}

/**
 * Creates select options with a default "All" option
 */
export function createSelectOptionsWithAll<T extends string>(
  items: T[],
  allLabel: string = 'All',
  labelFn?: (item: T) => string
): Array<{ value: string; label: string }> {
  const uniqueOptions = createUniqueSelectOptions(items, labelFn);
  
  return [
    { value: 'ALL', label: allLabel },
    ...uniqueOptions
  ];
}