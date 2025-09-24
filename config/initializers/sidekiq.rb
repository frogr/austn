require 'sidekiq'

redis_config = Rails.application.config_for(:redis)

Sidekiq.configure_server do |config|
  config.redis = { url: redis_config['url'] }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_config['url'] }
end