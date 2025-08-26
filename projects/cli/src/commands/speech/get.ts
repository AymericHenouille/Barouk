import { Command, Flags } from '@oclif/core';
import { BAROUK_FLAGS } from '../../flags/barouk-flags.js';
import type { SpeechOptions } from '../../speeches/speech-options.js';
import { BaroukConfigService } from '../../configs/barouk-config-service.js';
import { AuthService } from '../../auth/auth-service.js';
import { SpeechesService } from '../../speeches/speeches-service.js';

/**
 * Speech get command.
 * Get the details of speeches.
 */
export default class SpeechGet extends Command {
  public static override enableJsonFlag = true;
  public static override description = 'Get details about speeches';
  public static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  public static override args = {};
  public static override flags = {
    speeches: Flags.integer({
      aliases: ['id', 'ids'],
      char: 's',
      description: 'The list of speeches id to get',
      multiple: true,
      default: [],
    }),
    all: Flags.boolean({
      description: 'select all speeches',
      relationships: [
        {
          type: 'none',
          flags: ['speeches'],
        },
      ],
    }),
    ...BAROUK_FLAGS,
  };

  public async run(): Promise<SpeechOptions[]> {
    const { flags } = await this.parse(SpeechGet);
    
    const configService = new BaroukConfigService(flags);
    const authService = new AuthService(flags, configService);
    const speechService = new SpeechesService(configService, authService);
    
    const speeches = await speechService.getSpeechesByIds(flags.all
      ? 'all'
      : flags.speeches,
    );

    return speeches;
  }
}
