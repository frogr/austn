ENV["RAILS_ENV"] ||= "test"
ENV["ADMIN_USER_NAME"] ||= "admin"
ENV["ADMIN_PASSWORD"] ||= "password"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"

# Throttle counters must not leak between tests (or into the shared Redis).
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    setup do
      Rails.cache.clear
      Rack::Attack.reset!
    end

    private

    # Sets ENV vars for the duration of the block (nil unsets), then restores them.
    def with_env(vars)
      previous = vars.keys.index_with { |key| ENV[key] }
      vars.each { |key, value| ENV[key] = value }
      yield
    ensure
      previous.each { |key, value| ENV[key] = value }
    end
  end
end

class ActionDispatch::IntegrationTest
  private

  def sign_in_as_admin(remember: false)
    post admin_login_path, params: {
      username: ENV.fetch("ADMIN_USER_NAME"),
      password: ENV.fetch("ADMIN_PASSWORD"),
      remember_me: remember ? "1" : "0"
    }
  end
end
