type ConfigKey<T extends object> = {
  [K in keyof T & string]:
    T[K] extends object
      ? `${K}.${ConfigKey<T[K]>}`
      : K
}[keyof T & string];

/**
 * Configuration object used for barouk application.
 */
export interface BaroukConfig {
  /**
   * The lang use to manipulate the date.
   */
  lang: string;
  /**
   * The Barouk server address.
   */
  server: string;
  /**
   * Speech config section.
   */
  speech: {
    /**
     * The default day use in the week.
     */
    meetingDay: number; 
  },
}

/**
 * The key used for the barouk config.
 */
export type BaroukConfigKey = ConfigKey<BaroukConfig>;

/**
 * The default value used to initialize a barouk config file.
 */
export const DEFAULT_BAROUK_CONFIG: BaroukConfig = {
  lang: 'en',
  server: 'http://localhost:3000',
  speech: {
    meetingDay: 0,
  },
};

function extractKeys<T extends object>(obj: T, prefix = ''): ConfigKey<T>[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v))
      return [...extractKeys(v as object, key)];
    return [key as ConfigKey<T>];
  }) as ConfigKey<T>[];
}

/**
 * The list of keys used to configure barouk.
 */
export const BAROUK_CONFIG_KEYS: BaroukConfigKey[] = extractKeys(DEFAULT_BAROUK_CONFIG);
