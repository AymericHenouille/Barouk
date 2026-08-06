use std::{fmt::Display, path::PathBuf};

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
pub struct BaroukConfigMap {
    pub coordinate_cache: PathBuf,
}

impl Default for BaroukConfigMap {
    fn default() -> Self {
        Self {
            coordinate_cache: dirs::data_dir()
                .expect("")
                .join("barouk")
                .join("coordinate.csv")
        }
    }
}

impl Display for BaroukConfigMap {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "map.coordinate_cache = {}", self.coordinate_cache.display())
    }
}
