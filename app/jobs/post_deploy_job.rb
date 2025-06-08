class PostDeployJob < ApplicationJob
  queue_as :critical

  def perform
    # Run the blog post importer
    ImportObsidianNotesJob.perform_now

    # Add any other post-deploy tasks here
    Rails.logger.info "Post-deploy tasks completed"
  end
end
