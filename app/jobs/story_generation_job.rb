class StoryGenerationJob < ApplicationJob
  queue_as :default

  retry_on GroqService::GroqError, wait: :exponentially_longer, attempts: 3

  def perform(story_id = nil)
    unless Rails.env.production?
      Rails.logger.info "StoryGenerationJob: Skipping in #{Rails.env} environment"
      return
    end

    story = if story_id
      Story.find(story_id)
    else
      Story.active.first
    end

    unless story
      Rails.logger.warn "StoryGenerationJob: No active story found, skipping"
      return
    end

    Rails.logger.info "StoryGenerationJob: Generating paragraph for '#{story.title}'..."

    paragraph = story.generate_next_paragraph!

    Rails.logger.info "StoryGenerationJob: Created paragraph ##{paragraph.paragraph_number} for '#{story.title}'"
  rescue GroqService::GroqError => e
    Rails.logger.error "StoryGenerationJob failed: #{e.message}"
    raise
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "StoryGenerationJob save failed: #{e.message}"
  end
end
