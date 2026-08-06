mod barouk_cli;
mod features;
mod commands;

use barouk_cli::BaroukCli;
use features::config::barouk_config::BaroukConfigManager;
use features::resolver::Resolver;

use clap::Parser;

#[tokio::main]
async fn main() {
    let args = BaroukCli::parse(); 
    let mut config_manager = BaroukConfigManager::from_cli(&args);
    if let Err(error) = args.resolve(&mut config_manager).await {
        println!("Error: {}", error);
    }
}
