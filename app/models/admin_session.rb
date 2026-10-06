# Austin's signed-in admin state, kept in the Rails session cookie.
#
# Controllers (AdminAuthenticatable), the /sidekiq route constraint and
# Action Cable connections all read it, so they agree on what "signed in"
# means and when it expires.
class AdminSession
  SESSION_KEY = "admin_expires_at".freeze
  TTL = 12.hours
  REMEMBERED_TTL = 30.days

  # Credentials come from ENV. Missing values mean nobody can sign in.
  def self.valid_credentials?(username, password)
    expected_username = ENV["ADMIN_USER_NAME"]
    expected_password = ENV["ADMIN_PASSWORD"]
    return false if expected_username.blank? || expected_password.blank?

    username_matches = ActiveSupport::SecurityUtils.secure_compare(username.to_s, expected_username)
    password_matches = ActiveSupport::SecurityUtils.secure_compare(password.to_s, expected_password)
    username_matches && password_matches
  end

  def initialize(session)
    @session = session
  end

  def active?
    expires_at = @session[SESSION_KEY]
    expires_at.present? && Time.current.to_i < expires_at.to_i
  end

  def sign_in(remember: false)
    ttl = remember ? REMEMBERED_TTL : TTL
    # Counted in seconds, not calendar days, so a clock change doesn't move it.
    @session[SESSION_KEY] = Time.current.to_i + ttl.to_i
  end
end
