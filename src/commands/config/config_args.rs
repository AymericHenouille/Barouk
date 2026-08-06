use clap::{Args,Subcommand};

use crate::{
    commands::config::{
        config_get_args::ConfigGetArgs, config_list_args::ConfigListArgs, config_set_args::ConfigSetArgs,
    },
    features::{
        config::barouk_config::BaroukConfigManager,
        resolver::Resolver,
    },
};

#[derive(Subcommand)]
pub enum ConfigCommand {
    Get(ConfigGetArgs),
    Set(ConfigSetArgs),
    List(ConfigListArgs),
}

#[derive(Args)]
pub struct ConfigArgs {
    #[command(subcommand)]
    pub command: ConfigCommand,
}

impl Resolver for ConfigArgs {
    async fn resolve(&self, config: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        match &self.command {
            ConfigCommand::Get(args)  => args.resolve(config).await,
            ConfigCommand::Set(args)  => args.resolve(config).await,
            ConfigCommand::List(args) => args.resolve(config).await,
        }
    }
}
