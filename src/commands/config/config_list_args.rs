use clap::Args;

use crate::features::{
    config::barouk_config::BaroukConfigManager,
    resolver::Resolver,
};

#[derive(Args)]
pub struct ConfigListArgs {
    /// Display the config in a toml file format
    #[arg(long)]
    toml: bool,
}

impl Resolver for ConfigListArgs {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        let config = config_manager.load().unwrap_or_default();
        if self.toml && let Ok(content) = toml::to_string(&config) {
            println!("{}", content);
        } else {
            println!("{}", config); 
        } 
        Ok(())
    }
}
