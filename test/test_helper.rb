ENV["RAILS_ENV"] ||= "test"
ENV["ADMIN_USER_NAME"] ||= "admin"
ENV["ADMIN_PASSWORD"] ||= "password"
require_relative "../config/environment"
require "rails/test_help"

# Throttle counters must not leak between tests (or into the shared Redis).
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    setup { Rack::Attack.reset! }
  end
end
