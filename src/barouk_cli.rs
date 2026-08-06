use std::path::PathBuf;
use clap::{Parser, Subcommand};

use crate::commands::config::config_args::ConfigArgs;
use crate::commands::map::map_args::MapArgs;
use crate::features::config::barouk_config::{BaroukConfigManager};
use crate::features::resolver::Resolver;

#[derive(Subcommand)]
pub enum BaroukCommand {
    Config(ConfigArgs),
    Map(MapArgs)
}

#[derive(Parser)]
#[command(version)]
#[command(author = "Aymeric Hénouille")]
pub struct BaroukCli {
    /// Path to the barouk configuration file
    #[arg(long, global = true)]
    pub config_file: Option<PathBuf>,
    /// Action to execute.
    #[command(subcommand)]
    pub command: BaroukCommand,
}

impl Resolver for BaroukCli {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        match &self.command {
            BaroukCommand::Config(args) => args.resolve(config_manager).await, 
            BaroukCommand::Map(args) => args.resolve(config_manager).await,
        }
    }
}
