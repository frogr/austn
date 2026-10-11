# Every ten minutes, flags bursts of direct hits as swarms and short direct
# visits from the big crawlers' networks as crawlers, so they stay out of
# the analytics report. See Visit.
class FlagVisitSwarmsJob < ApplicationJob
  queue_as :low

  def perform
    Visit.flag_swarms!
    Visit.flag_crawlers!
  end
end
