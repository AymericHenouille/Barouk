import { Command } from '@oclif/core';
import { BAROUK_FLAGS } from '../flags/barouk-flags.js';
import { BaroukConfigService } from '../configs/barouk-config-service.js';
import type { BaroukConfig } from '../configs/barouk-config.js';

export default class Config extends Command {
  public static override enableJsonFlag = true;
  public static override args = {};
  public static override description = 'describe the command here';
  public static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  public static override flags = {
    ...BAROUK_FLAGS,
  };

  public async run(): Promise<BaroukConfig> {
    const { flags } = await this.parse(Config);
    const baroukConfigService = new BaroukConfigService(flags);
    return baroukConfigService.getConfig();
  }
}
