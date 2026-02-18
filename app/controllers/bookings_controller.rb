class BookingsController < ApplicationController
  # Public booking pages - no auth required

  # GET /book - Calendar view showing available dates
  def new
    @current_month = if params[:month].present?
      Date.parse("#{params[:month]}-01")
    else
      Date.current.beginning_of_month
    end

    @available_dates = Availability.active
      .where(date: @current_month..@current_month.end_of_month)
      .where("date >= ?", Date.current)
      .pluck(:date)
      .uniq
  end

  # GET /book/:date - Show available time slots for a date
  def slots
    @date = Date.parse(params[:date])
    @availabilities = Availability.active.for_date(@date).order(:start_time)
    @slots = @availabilities.flat_map do |avail|
      avail.available_slots_for_date(@date).map do |slot|
        slot.merge(availability_id: avail.id, title: avail.title)
      end
    end.sort_by { |s| s[:start_time] }

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  # POST /bookings - Create a new booking
  def create
    availability = Availability.active.find(params[:availability_id])
    slot_start = Time.zone.parse(params[:start_time])
    slot_end = Time.zone.parse(params[:end_time])

    @booking = Booking.new(
      availability: availability,
      booked_date: params[:booked_date],
      start_time: slot_start,
      end_time: slot_end,
      first_name: params[:first_name],
      email: params[:email],
      phone_number: params[:phone_number],
      notes: params[:notes]
    )

    # Use a transaction with locking to prevent double-booking
    Booking.transaction do
      # Lock the availability row to prevent race conditions
      availability.lock!

      if @booking.save
        # Send emails
        BookingMailer.confirmation(@booking).deliver_later
        BookingMailer.admin_notification(@booking).deliver_later

        # Broadcast real-time notification to admin
        ActionCable.server.broadcast("booking_notifications", {
          type: "new_booking",
          booking: {
            id: @booking.id,
            first_name: @booking.first_name,
            date: @booking.formatted_date_short,
            time: @booking.formatted_start_time
          }
        })

        redirect_to confirmation_booking_path(@booking.confirmation_token)
      else
        @date = Date.parse(params[:booked_date])
        @availabilities = Availability.active.for_date(@date).order(:start_time)
        @slots = @availabilities.flat_map do |avail|
          avail.available_slots_for_date(@date).map do |slot|
            slot.merge(availability_id: avail.id, title: avail.title)
          end
        end.sort_by { |s| s[:start_time] }

        flash.now[:alert] = @booking.errors.full_messages.join(", ")
        render :slots, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::RecordNotFound
    redirect_to book_path, alert: "That availability is no longer available."
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

      BookingMailer.cancellation(@booking).deliver_later
      BookingMailer.admin_cancellation(@booking).deliver_later

      ActionCable.server.broadcast("booking_notifications", {
        type: "cancellation",
        booking: {
          id: @booking.id,
          first_name: @booking.first_name,
          date: @booking.formatted_date_short,
          time: @booking.formatted_start_time
        }
      })

      redirect_to book_path, notice: "Your booking has been cancelled."
    else
      redirect_to book_path, alert: "This booking has already been cancelled."
    end
  end
end
