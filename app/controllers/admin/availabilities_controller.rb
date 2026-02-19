module Admin
  class AvailabilitiesController < BaseController
    before_action :set_availability, only: [ :edit, :update, :destroy ]

    def index
      @current_month = if params[:month].present?
        Date.parse("#{params[:month]}-01")
      else
        Date.current.beginning_of_month
      end

      month_range = @current_month..@current_month.end_of_month
      @month_availabilities = Availability.where(date: month_range).order(:date, :start_time)
      @existing_dates = @month_availabilities.pluck(:date).uniq
      @availabilities_by_date = @month_availabilities.group_by(&:date)
    end

    def new
      @availability = Availability.new(
        slot_duration_minutes: 30,
        max_bookings_per_slot: 1,
        is_active: true
      )
    end

    def create
      repeat_weeks = params[:repeat_weeks].to_i

      if repeat_weeks > 0
        create_recurring
      else
        @availability = Availability.new(availability_params)
        if @availability.save
          redirect_to admin_availabilities_path, notice: "Availability created."
        else
          render :new, status: :unprocessable_entity
        end
      end
    end

    def edit
    end

    def update
      if @availability.update(availability_params)
        redirect_to admin_availabilities_path, notice: "Availability updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      if @availability.has_bookings?
        redirect_to admin_availabilities_path, alert: "Cannot delete availability with confirmed bookings."
      else
        @availability.destroy
        redirect_to admin_availabilities_path, notice: "Availability deleted."
      end
    end

    def bulk_create
      dates = JSON.parse(params[:dates] || "[]")
      start_time = params[:start_time]
      end_time = params[:end_time]
      slot_duration = params[:slot_duration_minutes].to_i
      title = params[:title]

      if dates.empty? || start_time.blank? || end_time.blank?
        redirect_to admin_availabilities_path, alert: "Please select dates and a time range."
        return
      end

      created = 0
      dates.each do |date_str|
        avail = Availability.new(
          date: date_str,
          start_time: start_time,
          end_time: end_time,
          slot_duration_minutes: slot_duration,
          title: title,
          is_active: true,
          max_bookings_per_slot: 1
        )
        created += 1 if avail.save
      end

      redirect_to admin_availabilities_path, notice: "Created #{created} availability #{"block".pluralize(created)}."
    end

    private

    def set_availability
      @availability = Availability.find(params[:id])
    end

    def availability_params
      params.require(:availability).permit(
        :date, :start_time, :end_time, :slot_duration_minutes,
        :is_active, :title, :description, :max_bookings_per_slot
      )
    end

    def create_recurring
      base_params = availability_params
      repeat_weeks = params[:repeat_weeks].to_i.clamp(1, 12)
      base_date = Date.parse(base_params[:date])
      created = 0

      repeat_weeks.times do |i|
        avail = Availability.new(base_params.merge(date: base_date + i.weeks))
        created += 1 if avail.save
      end

      redirect_to admin_availabilities_path, notice: "Created #{created} availability blocks."
    end
  end
end
