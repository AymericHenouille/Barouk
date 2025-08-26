import { Args, Command } from '@oclif/core';
import { BAROUK_FLAGS } from '../../flags/barouk-flags.js';
import { BaroukConfigService } from '../../configs/barouk-config-service.js';
import { BAROUK_CONFIG_KEYS } from '../../configs/barouk-config.js';

export default class ConfigGet extends Command {
  public static override enableJsonFlag = true;
  public static override args = {
    key: Args.string({
      required: true,
      description: 'The config key',
      options: BAROUK_CONFIG_KEYS,
    }),
  };
  public static override description = 'describe the command here';
  public static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  public static override flags = {
    ...BAROUK_FLAGS,
  };

  public async run(): Promise<{ result: any }> {
    const { args, flags } = await this.parse(ConfigGet);
    const baroukConfigService = new BaroukConfigService(flags);
    const map = await baroukConfigService.getConfigMap();
    if (!map.has(args.key))
      this.error(`The key ${args.key} doesn't exist`);
    const result = map.get(args.key);
    this.log(`${args.key}=${result}`);
    return { result };
  }
}
