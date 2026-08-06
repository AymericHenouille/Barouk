use std::{collections::HashMap, fs};

use csv::{Reader, Writer};

use crate::features::{
    config::barouk_config::BaroukConfig, geocoding::{
        coordinate::{Coordinate, Latitude, Longitude},
        geocoding_client::GeocodingClient,
    },
};

pub struct GeocodingManager {
    config: BaroukConfig,
    addresses: HashMap<String, Coordinate>,
    client: GeocodingClient,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct GeocodingEntry {
    name: String,
    latitude: f64,
    longitude: f64,
}

impl GeocodingManager {
    pub fn new(config: BaroukConfig, addresses: HashMap<String, Coordinate>) -> Self {
        Self {
            config,
            addresses,
            client: GeocodingClient::new(),
        }
    }

    pub fn from_config(config: BaroukConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let mut addresses = HashMap::new();
        let coordinate_cache = config.clone().map.coordinate_cache;
        if coordinate_cache.is_file() {
            let mut reader = Reader::from_path(coordinate_cache)?;
            for result in reader.deserialize() {
                let entry: GeocodingEntry = result?; 
                let coordinate = Coordinate(
                    Latitude(entry.latitude),
                    Longitude(entry.longitude),
                );
                addresses.insert(entry.name, coordinate);
            }
        }
        Ok(Self::new(config, addresses))
    }

    pub async fn get_coordinates(&mut self, address: &str) -> Result<Coordinate, Box<dyn std::error::Error>> {
        let key = String::from(address);
        if let Some(coordinate) = self.addresses.get(&key) {
            Ok(*coordinate)
        } else {
            let coordinate = self.client.get_coordinates(address).await?;
            self.addresses.insert(key, coordinate); 
            Ok(coordinate)
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let coordinate_cache = self.config.map.coordinate_cache.clone();
        if let Some(parent) = coordinate_cache.parent() {
            fs::create_dir_all(parent)?;
        }

        let mut writer = Writer::from_path(coordinate_cache)?;
        for (address, coordinate) in self.addresses.clone() {
            let entry = GeocodingEntry {
                name: address,
                latitude: coordinate.latitude(),
                longitude: coordinate.longitude(),
            };
            writer.serialize(entry)?;
        }
        writer.flush()?;

        Ok(())
    }
}
