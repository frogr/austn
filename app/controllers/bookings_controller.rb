class BookingsController < ApplicationController
  include SitePage

  # Public booking pages - no auth required

  # GET /book - Calendar view showing available dates
  def new
    @current_month = requested_month
    @available_dates = schedule.open_dates(@current_month.all_month)
    @nothing_open = @available_dates.empty? && !schedule.any_open?
  end

  # GET /book/:date - Show available time slots for a date
  def slots
    @date = Date.iso8601(params[:date])
    @slots = schedule.open_slots_on(@date)
  rescue Date::Error
    @date = Date.current
    @slots = []
    @slot_error = "Something went wrong loading time slots. Please try again."
  end

  # POST /bookings - Create a new booking
  def create
    @booking = Booking.reserve(booking_params)

    if @booking.persisted?
      notify_booking(@booking)
      redirect_to confirmation_booking_path(@booking.confirmation_token)
    else
      @date = @booking.booked_date || Date.current
      @slots = schedule.open_slots_on(@date)
      flash.now[:alert] = @booking.errors.full_messages.join(", ")
      render :slots, status: :unprocessable_entity
    end
  end

  # GET /bookings/:confirmation_token/confirmation
  def confirmation
    @booking = Booking.find_by!(confirmation_token: params[:confirmation_token])
  end

  # GET /bookings/:confirmation_token/cancel
  def cancel_confirm
    @booking = Booking.find_by!(confirmation_token: params[:confirmation_token])
    redirect_to book_path, alert: "This booking has already been cancelled." if @booking.cancelled?
  end

  # DELETE /bookings/:confirmation_token/cancel
  def cancel
    @booking = Booking.find_by!(confirmation_token: params[:confirmation_token])

    if @booking.confirmed?
      @booking.cancel!

      begin
        BookingMailer.cancellation(@booking).deliver_later
        BookingMailer.admin_cancellation(@booking).deliver_later
      rescue => e
        Rails.logger.error("BookingMailer cancellation error: #{e.class}: #{e.message}")
      end

      begin
        ActionCable.server.broadcast("booking_notifications", {
          type: "cancellation",
          booking: {
            id: @booking.id,
            first_name: @booking.first_name,
            date: @booking.formatted_date_short,
            time: @booking.formatted_start_time
          }
        })
      rescue => e
        Rails.logger.error("ActionCable broadcast error: #{e.class}: #{e.message}")
      end

      redirect_to book_path, notice: "Your booking has been cancelled."
    else
      redirect_to book_path, alert: "This booking has already been cancelled."
    end
  end

  private

  def schedule
    @schedule ||= BookingSchedule.new
  end

  # ?month=YYYY-MM, falling back to this month for anything else.
  def requested_month
    Date.strptime(params[:month].to_s, "%Y-%m")
  rescue Date::Error
    Date.current.beginning_of_month
  end

  # end_time and availability come from the chosen slot, not the client.
  def booking_params
    params.permit(:booked_date, :start_time, :first_name, :email, :phone_number, :notes)
  end

  def notify_booking(booking)
    begin
      BookingMailer.confirmation(booking).deliver_later
      BookingMailer.admin_notification(booking).deliver_later
    rescue => e
      Rails.logger.error("BookingMailer error: #{e.class}: #{e.message}")
    end

    begin
      ActionCable.server.broadcast("booking_notifications", {
        type: "new_booking",
        booking: {
          id: booking.id,
          first_name: booking.first_name,
          date: booking.formatted_date_short,
          time: booking.formatted_start_time
        }
      })
    rescue => e
      Rails.logger.error("ActionCable broadcast error: #{e.class}: #{e.message}")
    end
  end
end
