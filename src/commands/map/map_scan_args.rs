use std::path::PathBuf;

use clap::Args;
use csv::ReaderBuilder;

use crate::features::{
    config::barouk_config::BaroukConfigManager,
    resolver::Resolver,
    geocoding::geocoding_manager::GeocodingManager,
};

const TEMPLATE: &str = "
<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
    <title>Barouk Map</title>
    <link
        rel=\"stylesheet\"
        href=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css\"
        crossorigin=\"\">

    <script
        src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"
        crossorigin=\"\">
    </script>

    <script id=\"barouk-points\" type=\"application/json\">
      __BAROUK_POINTS__
    </script>

    <style>
        html, body, #map {
            height: 100%;
            margin: 0;
        }

        .leaflet-popup-content div {
          display: flex;
          flex-direction: column;
        }
    </style>
  </head>
  <body>
    <div id=\"map\"></div>

    <script>
      const map = L.map('map').setView([50.64, 3.11], 13);
      const pointsElement = document.getElementById('barouk-points');
      const points = JSON.parse(pointsElement.textContent);
      const markers = points.map((point, _, array) => {
        const names = array
          .filter(({ address }) => address === point.address)
          .map(({ name }) => name)
        return { ...point, names };
      }).filter((point, index, array) => {
        return array.findIndex(({ address }) => point.address === address) === index;
      }).map((point) => {
        const popup = document.createElement('div');
        const titles = point.names.map((name) => {
          const title = document.createElement('strong')
          title.textContent = name;
          return title;
        });
        const address = document.createElement('div');

        address.textContent = point.address;
        popup.append(...titles, address);
        return L.marker([point.latitude, point.longitude])
          .addTo(map)
          .bindPopup(popup);
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), {
          padding: [30, 30],
          maxZoom: 16,
        });
      }

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    </script>
  </body>
</html>
";

#[derive(Args, Clone)]
pub struct MapScanArgs {
    /// The csv file used to load the addresses
    #[arg(short, long)]
    pub input_file: PathBuf,
    /// The html file that render the interactive map
    #[arg(short, long, default_value = "index.html")]
    pub output_file: PathBuf,
    #[arg(short, long)]
    pub verbose: bool,
}

#[derive(serde::Deserialize, Debug)]
struct Address {
    #[serde(rename = "DisplayName")]
    display_name: String,
    #[serde(rename = "Address")]
    address: String,
}

#[derive(serde::Serialize, Debug)]
struct MapPoint {
    name: String,
    address: String,
    latitude: f64,
    longitude: f64,
}

impl Resolver for MapScanArgs {
    async fn resolve(&self, config_manager: &mut BaroukConfigManager) -> Result<(), Box<dyn std::error::Error>> {
        if !self.input_file.exists() { 
            let message = format!("The input file: \"{}\" is not found", self.input_file.display()); 
            return Err(message.into());
        }

        if !self.input_file.is_file() { 
            let message = format!("The input file: \"{}\" is not a regular file", self.input_file.display());
            return Err(message.into());
        }

        let config = config_manager.load().unwrap_or_default();
        let mut geocoding_manager = GeocodingManager::from_config(config)?;

        let mut founded = Vec::new();
        let mut not_founded = Vec::new();
        let mut reader = ReaderBuilder::new()
            .delimiter(b';')
            .from_path(&self.input_file)?;
        for result in reader.deserialize() {
            let address: Address = result?;
            if !address.display_name.is_empty() && !address.address.is_empty() {
                if let Ok(coordinate) = geocoding_manager.get_coordinates(&address.address).await {
                    if self.verbose {
                        println!("{}: {}", address.display_name, coordinate);
                    }
                    founded.push(MapPoint {
                        name: address.display_name,
                        address: address.address,
                        latitude: coordinate.latitude(),
                        longitude: coordinate.longitude(),
                    });
                } else {
                    not_founded.push(address);
                }
            }
        }
        
        if !not_founded.is_empty() && self.verbose {
            println!("\n=========================");
            println!("Address not founded for:\n");
            for address in &not_founded {
                println!("{}: {}", address.display_name, address.address);
            }
        }

        geocoding_manager.save()?;

        let map_points = serde_json::to_string(&founded)?;
        let html = TEMPLATE.replace("__BAROUK_POINTS__", &map_points);
        std::fs::write(self.output_file.as_path(), html)?;
        Ok(())
    }
}
