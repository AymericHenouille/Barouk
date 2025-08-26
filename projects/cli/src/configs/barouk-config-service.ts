import type { BaroukOptions } from '../flags/barouk-flags.js';
import { DEFAULT_BAROUK_CONFIG, type BaroukConfig } from './barouk-config.js';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { createSpinner } from '../logger/spinner.js';

/**
 * Barouk config service.
 * This service is used to create a barouk config object.
 */
export class BaroukConfigService {
  /**
   * List of config keys used.
   */
  public static CONFIG_KEY: string[] = [
    'lang',
    'speech.meetingDay',
  ];

  /**
   * The barouk configuration.
   */
  private _config!: BaroukConfig;

  /**
   * Config file in a map.
   */
  // eslint-disable-next-line
  private _configMap!: Map<string, any>

  /**
   * Create a new barouk config service instance.
   * @param {BaroukOptions} baroukOptions - The options used by the user at program start up.
   */
  public constructor(
    private readonly baroukOptions: BaroukOptions,
  ) { }

  /**
   * Get the barouk config.
   * The config info is lazy loaded when the program request it.
   * If the config doesn't exist this function will create it.
   * @returns {Promise<BaroukConfig>} The loaded config.
   */
  public async getConfig(): Promise<BaroukConfig> {
    return this._config ??= await this.loadConfig();
  }

  /**
   * Get the config in map.
   * @returns {Promise<Map<string, any>>} The config in a map.
   */
  public async getConfigMap(): Promise<Map<string, any>> {
    return this._configMap ??= await (async () => {
      function assignKeyInMap(object: object): [string, any][] {
        return Object.entries(object).map(([key, value]) => {
          if (typeof value === 'object') 
            return assignKeyInMap(value).map(([subKey, subValue]) => [
              `${key}.${subKey}`,
              subValue,
            ]) as [string, any][];
          return [[key, value]] as [string, any][];
        }).flat(1);
      }

      const config = await this.getConfig();
      const entries = assignKeyInMap(config);
      return new Map(entries);
    })();
  }

  /**
   * Parse a map to a config object.
   * @param {Map<string, any>} map - The map to parse.
   * @returns {BaroukConfig} The parsed config.
   */
  public parseMapToConfig(map: Map<string, any>): BaroukConfig {
    return {
      lang: map.get('lang') ?? DEFAULT_BAROUK_CONFIG.lang,
      server: map.get('server') ?? DEFAULT_BAROUK_CONFIG.server,
      speech: {
        meetingDay: Number(map.get('speech.meetingDay') ?? DEFAULT_BAROUK_CONFIG.speech.meetingDay),
      },
    };
  }

  /**
   * Save the given config inside the barouk-config file path.
   * @param {BaroukConfig} config - The config to save.
   * @returns {Promise<void>} Resolve when the file is saved.
   */
  public async saveConfig(config: BaroukConfig): Promise<void> {
    return createSpinner('Save barouk config', async () => {
      const configPath = this.baroukOptions['barouk-config'];
      const configDir = dirname(configPath);
      if (!existsSync(configDir)) await mkdir(configDir, { recursive: true });
      const configContent = JSON.stringify(config, null, 2);
      return writeFile(configPath, configContent, { encoding: 'utf-8' });
    }, this.baroukOptions);
  }

  /**
   * Load the barouk config.
   * @returns {Promise<BaroukConfig>} The loaded barouk config. 
   */
  private loadConfig(): Promise<BaroukConfig> {
    return createSpinner('Load barouk config', async () => {
      const configPath = this.baroukOptions['barouk-config'];
      if (!existsSync(configPath)) await this.saveConfig(DEFAULT_BAROUK_CONFIG);
      const configContent = await readFile(configPath, { encoding: 'utf-8' });
      return JSON.parse(configContent);
    }, this.baroukOptions);
  }
}
