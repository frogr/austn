module Admin
  class DashboardController < BaseController
    def index
      @todays_bookings = Booking.confirmed.today.order(:start_time)
      @this_weeks_bookings = Booking.confirmed.this_week.order(:booked_date, :start_time)
      @monthly_count = Booking.this_month.count
      @upcoming_count = Booking.confirmed.upcoming.count
    end
  end
end
