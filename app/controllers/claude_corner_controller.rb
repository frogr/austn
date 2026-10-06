class ClaudeCornerController < ApplicationController
  def index
    @entries = ClaudeCornerEntry.published.newest_first.map(&:as_props)
  end
end
