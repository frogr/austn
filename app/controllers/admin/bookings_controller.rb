module Admin
  class BookingsController < BaseController
    before_action :set_booking, only: [ :show, :update, :destroy ]

    def index
      @filter = params[:filter] || "upcoming"
      @bookings = case @filter
      when "upcoming"
        Booking.confirmed.upcoming.order(:booked_date, :start_time)
      when "past"
        Booking.where("booked_date < ? OR status = ?", Date.current, "completed").order(booked_date: :desc)
      when "cancelled"
        Booking.cancelled.order(cancelled_at: :desc)
      else
        Booking.order(created_at: :desc)
      end
    end

    def show
    end

    def update
      case params[:booking_action]
      when "cancel"
        if @booking.confirmed?
          @booking.cancel!
          BookingMailer.cancellation(@booking).deliver_later
          BookingMailer.admin_cancellation(@booking).deliver_later
          redirect_to admin_bookings_path, notice: "Booking cancelled and notification sent."
        else
          redirect_to admin_bookings_path, alert: "Booking is not in a cancellable state."
        end
      when "complete"
        @booking.complete!
        redirect_to admin_bookings_path, notice: "Booking marked as completed."
      else
        redirect_to admin_bookings_path, alert: "Unknown action."
      end
    end

    def destroy
      if @booking.confirmed?
        @booking.cancel!
        BookingMailer.cancellation(@booking).deliver_later
        BookingMailer.admin_cancellation(@booking).deliver_later
        redirect_to admin_bookings_path, notice: "Booking cancelled."
      else
        redirect_to admin_bookings_path, alert: "Booking is already cancelled."
      end
    end

    private

    def set_booking
      @booking = Booking.find(params[:id])
    end
  end
end
