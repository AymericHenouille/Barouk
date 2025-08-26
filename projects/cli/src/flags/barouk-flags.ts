import { Flags } from '@oclif/core';
import { resolve } from 'path';
import { homedir } from 'os';

/**
 * Options used to configure barouk.
 */
export interface BaroukOptions {
  /**
   * The path to the barouk config file.
   */
  'barouk-config': string;
  /**
   * The path to the barouk session file.
   */
  'session-file': string;
  /**
   * Set to true to return json result.
   */
  'json': boolean | undefined;
}

/**
 * Default flags used on every barouk commands.
 */
export const BAROUK_FLAGS = {
  /**
   * The path to the barouk config file.
   * default value is set to ~/.config/barouk/barouk-config.json
   */
  'barouk-config': Flags.file({
    description: 'The path to the barouk config file.',
    aliases: ['config'],
    char: 'c',
    default: resolve(
      homedir(),
      '.config',
      'barouk',
      'barouk-config.json',
    ),
  }),
  /**
   * The path to the barouk session file.
   */
  'session-file': Flags.file({
    description: 'The path to the barouk session file.',
    default: resolve(
      homedir(),
      '.config',
      'barouk',
      '.session',
    ),
  }),
};
