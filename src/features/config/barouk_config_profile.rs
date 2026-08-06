use std::fmt::{Display};

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
pub struct BaroukConfigProfile {
    pub first_name: String,
    pub last_name: String,
}    

impl Default for BaroukConfigProfile {
    fn default() -> Self {
        let full_name = whoami::realname().unwrap_or_default();
        let mut parts = full_name.split_whitespace();
        
        let first_name = parts.next().unwrap_or_default().to_owned();
        let last_name = parts.collect::<Vec<_>>().join(" ");

        Self { first_name, last_name }
    }
}

impl Display for BaroukConfigProfile {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "profile.first_name = {}", self.first_name)?;
        writeln!(f, "profile.last_name = {}", self.last_name)?;
        Ok(())
    }
}
