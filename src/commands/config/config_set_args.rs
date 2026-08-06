use std::path::PathBuf;

use clap::Args;

use crate::{
    commands::config::config_key::ConfigKey, 
    features::{
        config::barouk_config::BaroukConfigManager,
        resolver::Resolver,
    },
};

#[derive(Args)]
pub struct ConfigSetArgs {
    /// The key of the config attribute to read
    #[arg(value_enum)]
    pub key: ConfigKey,
    /// The value to set at the given key attribute
    pub value: String,
}


impl Resolver for ConfigSetArgs {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        let mut config = config_manager.load().unwrap_or_default();
        let value = self.value.clone();
        match &self.key {
            ConfigKey::ProfileFirstName => config.profile.first_name = value,
            ConfigKey::ProfileLastName => config.profile.last_name = value,
            ConfigKey::MapCoordinateCache => config.map.coordinate_cache = PathBuf::from(value),
        }
        config_manager.save(&config)
    }
}
