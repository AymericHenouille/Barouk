use clap::Args;

use crate::{
    commands::config::config_key::ConfigKey,
    features::{
        config::barouk_config::BaroukConfigManager, 
        resolver::Resolver,
    },
};

#[derive(Args)]
pub struct ConfigGetArgs {
    /// The key of the config attribute to read
    #[arg(value_enum)]
    pub key: ConfigKey,
}

impl Resolver for ConfigGetArgs {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        let config = config_manager.load().unwrap_or_default();
        let value = match &self.key {
            ConfigKey::ProfileFirstName => config.profile.first_name,
            ConfigKey::ProfileLastName => config.profile.last_name,
            ConfigKey::MapCoordinateCache => config.map.coordinate_cache.to_str().unwrap().to_string(),
        };
        println!("{}", value);
        Ok(())
    }
}
