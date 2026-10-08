# Records what visitors do, server-side, into Visit and VisitEvent.
#
# Every successful HTML page is a page view. Controllers add the other
# events themselves: GoController a click, BookingsController a booking.
# Austin's own requests while signed in to the admin are not counted, and
# recording never breaks a page: a failure is logged and the page still
# renders.
module VisitTracking
  extend ActiveSupport::Concern

  SKIPPED_PATHS = %w[/admin /sidekiq /up /gpu_health /go /rails].freeze

  included do
    after_action :record_page_view
  end

  private

  def record_page_view
    return unless trackable_page_view?

    current_visit&.record("page_view", path: request.path, referrer_path: referrer_path)
  rescue StandardError => e
    Rails.logger.error("VisitTracking: #{e.class}: #{e.message}")
  end

  def record_visit_event(name, label: nil, href: nil)
    current_visit&.record(name, path: referrer_path || request.path, label: label, href: href)
  rescue StandardError => e
    Rails.logger.error("VisitTracking: #{e.class}: #{e.message}")
  end

  def trackable_page_view?
    request.get? && !request.xhr? && response.status == 200 && response.media_type == "text/html" &&
      SKIPPED_PATHS.none? { |prefix| request.path.start_with?(prefix) }
  end

  def current_visit
    return @current_visit if defined?(@current_visit)

    @current_visit = Visit.for_request(request, admin: admin_signed_in?)
  end

  # The page on this site the visitor came from, if that is where they were.
  def referrer_path
    referrer = URI.parse(request.referer.to_s)
    referrer.path.presence if referrer.host == request.host
  rescue URI::InvalidURIError
    nil
  end
end
