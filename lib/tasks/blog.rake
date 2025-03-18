namespace :blog do
  desc "Import markdown files from Obsidian public notes directory"
  task import_obsidian_notes: :environment do
    ImportObsidianNotesJob.perform_now
  end
end
