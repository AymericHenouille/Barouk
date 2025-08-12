import { Args, Command, Flags } from '@oclif/core';

export default class Config extends Command {
  public static override args = {
    file: Args.string({description: 'file to read'}),
  };
  public static override description = 'describe the command here';
  public static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];
  public static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Config);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from /home/aymerichenouille/Documents/Projects/perso/cli/barouk/projects/cli/src/commands/config.ts`);
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }
  }
}
