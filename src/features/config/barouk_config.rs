use std::fmt::Display;
use std::fs;
use std::error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

use crate::{
    barouk_cli::BaroukCli,
    features::config::{
        barouk_config_profile::BaroukConfigProfile,
        barouk_config_map::BaroukConfigMap,
    },
};

#[derive(Deserialize, Serialize, Clone, Default)]
pub struct BaroukConfig {
    pub profile: BaroukConfigProfile,
    pub map: BaroukConfigMap,
}

impl Display for BaroukConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{}", self.profile)
    }
}

pub struct BaroukConfigManager {
    path: PathBuf,
    config: Option<BaroukConfig>,
}

impl BaroukConfigManager {
    fn read(&mut self) -> Result<&mut Self, Box<dyn error::Error>> {
        let path = self.path.as_path();
        let content = fs::read_to_string(path)?;
        let config = toml::from_str(&content)?;
        self.config = Some(config);
        Ok(self)
    } 
}

impl BaroukConfigManager {
    pub fn load(&mut self) -> Result<BaroukConfig, Box<dyn error::Error>> {
        match self.config.clone() {
            Some(config) => Ok(config),
            None => self.read()
                .map(|manager| manager.config.clone())
                .map(|config| config.expect("The config should to be loaded"))
                .map(Ok)?
        }
    }

    pub fn save(&mut self, config: &BaroukConfig) -> Result<(), Box<dyn error::Error>> {
        let path = self.path.as_path();

        if !path.exists() && let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        } 

        let config = config.clone();
        let content = toml::to_string_pretty(&config)?;
        fs::write(path, content)?;
        self.config = Some(config);
        Ok(())
    }
}

impl BaroukConfigManager {
    pub fn from_path(path: PathBuf) -> Self {
        Self { path, config: None }
    }
}

impl BaroukConfigManager {
    pub fn from_cli(cli: &BaroukCli) -> Self {
        let path = cli.config_file.clone().unwrap_or_else(|| {
            dirs::config_dir()
                .expect("No config dir found")
                .join("barouk")
                .join("config.toml")
        });
        Self::from_path(path)
    }
}

