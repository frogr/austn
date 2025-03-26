Rails.application.config.after_initialize do
  if Rails.env.production?
    ImportObsidianNotesJob.perform_later
  end
end