module Admin
  class AvailabilityRulesController < BaseController
    before_action :set_rule, only: %i[edit update destroy]

    def index
      @rules = AvailabilityRule.ordered
    end

    def new
      @rule = AvailabilityRule.new(weekday: 1, start_time: "11:00", end_time: "17:00", slot_duration_minutes: 30)
    end

    def create
      @rule = AvailabilityRule.new(rule_params)
      if @rule.save
        redirect_to admin_availability_rules_path, notice: "Added #{@rule.weekday_name} hours."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @rule.update(rule_params)
        redirect_to admin_availability_rules_path, notice: "Updated #{@rule.weekday_name} hours."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    # Existing bookings keep their times; only future slots change.
    def destroy
      @rule.destroy
      redirect_to admin_availability_rules_path, notice: "Removed #{@rule.weekday_name} hours."
    end

    private

    def set_rule
      @rule = AvailabilityRule.find(params[:id])
    end

    def rule_params
      params.require(:availability_rule).permit(:weekday, :start_time, :end_time, :slot_duration_minutes, :active)
    end
  end
end
