module Admin
  class ClaudeCornerEntriesController < BaseController
    before_action :set_entry, only: %i[show publish unpublish destroy]

    def index
      @drafts = ClaudeCornerEntry.drafts.newest_first
      @published = ClaudeCornerEntry.published.newest_first
    end

    def show
    end

    def publish
      @entry.publish!
      redirect_to admin_claude_corner_entries_path, notice: "Published \"#{@entry.title}\"."
    end

    def unpublish
      @entry.unpublish!
      redirect_to admin_claude_corner_entries_path, notice: "\"#{@entry.title}\" is a draft again."
    end

    def destroy
      @entry.destroy
      redirect_to admin_claude_corner_entries_path, notice: "Deleted \"#{@entry.title}\"."
    end

    # Asks for a draft now instead of waiting for the monthly run.
    def generate
      ClaudeCornerDraftJob.perform_later
      redirect_to admin_claude_corner_entries_path, notice: "Asked Claude for a new draft. Refresh in a minute."
    end

    private

    def set_entry
      @entry = ClaudeCornerEntry.find(params[:id])
    end
  end
end
