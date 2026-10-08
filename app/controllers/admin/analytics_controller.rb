module Admin
  # Who visited, from where, and what they did. Numbers come from VisitReport.
  class AnalyticsController < BaseController
    def index
      @report = VisitReport.new(days: params[:days])
      @touching = params[:touching].to_s.start_with?("/") ? params[:touching] : nil
      @recent = @report.recent(touching: @touching)
    end

    def show
      @visit = Visit.find(params[:id])
      @events = @visit.events.order(:created_at)
      @other_visits = Visit.where(visitor_id: @visit.visitor_id).where.not(id: @visit.id).recent_first.limit(20).includes(:events)
    end
  end
end
