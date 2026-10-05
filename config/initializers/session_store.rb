# Keep the session cookie for 30 days so "remember this device" on the admin
# login survives browser restarts. How long an admin sign-in is honored is
# decided server-side by AdminSession (12 hours, or 30 days when remembered).
Rails.application.config.session_store :cookie_store, key: "_austn_session", expire_after: 30.days
