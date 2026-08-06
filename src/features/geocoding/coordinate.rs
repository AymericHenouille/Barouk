use std::fmt::Display;

#[derive(serde::Deserialize)]
pub struct GeocodingResponse {
    pub features: Vec<Feature>,
}

#[derive(serde::Deserialize)]
pub struct Feature {
    pub geometry: Geometry,
}

#[derive(serde::Deserialize)]
pub struct Geometry {
    pub coordinates: [f64; 2],
}

#[derive(Clone, Copy)]
pub struct Latitude(pub f64);

#[derive(Clone, Copy)]
pub struct Longitude(pub f64);

impl From<Latitude> for f64 {
    fn from(value: Latitude) -> Self {
       value.0 
    }
}

impl From<Longitude> for f64 {
    fn from(value: Longitude) -> Self {
       value.0 
    }
}

#[derive(Clone, Copy)]
pub struct Coordinate(pub Latitude, pub Longitude);

impl Coordinate {
    pub fn latitude(&self) -> f64 {
        f64::from(self.0)
    }

    pub fn longitude(&self) -> f64 {
        f64::from(self.1)
    }
}

impl Display for Coordinate {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let latitude = self.latitude();
        let longitude = self.longitude();
        write!(f, "({}, {})", latitude, longitude)
    }
}

impl GeocodingResponse {
    pub fn coordinate(&self) -> Option<Coordinate> {
        self.features.first().map(|feature| {
            let [longitude, latitude] = feature.geometry.coordinates;
            Coordinate(
                Latitude(latitude),
                Longitude(longitude),
            )
        })
    }
}
