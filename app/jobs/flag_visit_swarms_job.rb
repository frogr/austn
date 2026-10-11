# Every ten minutes, flags bursts of one-page direct hits on one page as
# automated, so they stay out of the analytics report. See Visit.
class FlagVisitSwarmsJob < ApplicationJob
  queue_as :low

  def perform
    Visit.flag_swarms!
  end
end
