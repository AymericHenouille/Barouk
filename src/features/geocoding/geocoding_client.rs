use reqwest::Client;

use crate::features::geocoding::coordinate::{Coordinate, GeocodingResponse};

const GEOCODAGE_API: &str = "https://data.geopf.fr/geocodage/search";

pub struct GeocodingClient {
    client: Client,
}

impl GeocodingClient {
    pub fn new() -> Self {
        Self {
            client: Client::new()
        }
    }

    pub async fn get_coordinates(&self, address: &str) -> Result<Coordinate, Box<dyn std::error::Error>> {
        let response = self.client
            .get(GEOCODAGE_API)
            .query(&[
                ("q", address),
                ("limit", "1"),
            ])
            .send()
            .await?
            .error_for_status()?;
        let body = response.json::<GeocodingResponse>().await?;
        match body.coordinate() {
            Some(coordinate) => Ok(coordinate),
            None => Err(format!("No coordinate found for address \"{}\"", address).into())
        }
    }
}
