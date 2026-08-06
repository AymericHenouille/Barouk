use clap::{Args, Subcommand};
use crate::{
    commands::map::{
        map_scan_args::MapScanArgs,
    },
    features::{
        resolver::Resolver,
        config::barouk_config::BaroukConfigManager,
    },
};

#[derive(Subcommand, Clone)]
pub enum MapCommand {
    Scan(MapScanArgs),
}

#[derive(Args, Clone)]
pub struct MapArgs {
    #[command(subcommand)]
   pub command: MapCommand,
}

impl Resolver for MapArgs {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        match &self.command {
            MapCommand::Scan(args) => args.resolve(config_manager).await,
        }
    }
}
