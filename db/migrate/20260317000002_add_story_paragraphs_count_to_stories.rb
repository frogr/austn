class AddStoryParagraphsCountToStories < ActiveRecord::Migration[8.0]
  def up
    add_column :stories, :story_paragraphs_count, :integer, default: 0, null: false

    # Backfill existing counts
    Story.reset_column_information
    Story.find_each do |story|
      Story.update_counters(story.id, story_paragraphs_count: story.story_paragraphs.count)
    end
  end

  def down
    remove_column :stories, :story_paragraphs_count
  end
end
