use crate::features::config::barouk_config::BaroukConfigManager;

pub trait Resolver {
    fn resolve(&self, config_manager: &mut BaroukConfigManager) -> impl Future<Output = Result<(), Box<dyn std::error::Error>>>;
}
