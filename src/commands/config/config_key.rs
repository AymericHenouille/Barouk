use clap::ValueEnum;

#[derive(ValueEnum, Clone)]
pub enum ConfigKey {
    #[value(name = "profile.first_name")]
    ProfileFirstName,
    #[value(name = "profile.last_name")]
    ProfileLastName,
    #[value(name = "map.coordinate_cache")]
    MapCoordinateCache,
}
