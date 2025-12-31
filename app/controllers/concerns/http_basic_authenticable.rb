module HttpBasicAuthenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_admin!, if: :admin_authentication_required?
  end

  private

  def authenticate_admin!
    authenticate_or_request_with_http_basic("Admin Area") do |username, password|
      expected_username = ENV.fetch("ADMIN_USER_NAME", "admin")
      expected_password = ENV.fetch("ADMIN_PASSWORD", "changeme123")

      ActiveSupport::SecurityUtils.secure_compare(username, expected_username) &&
        ActiveSupport::SecurityUtils.secure_compare(password, expected_password)
    end
  end

  def admin_authentication_required?
    true
  end
end
