# An untrusted file uploaded for a GPU tool.
#
# The size is checked before anything reads the file, the type comes from
# the file's magic bytes (not its name or the browser's claim), and the file
# is stored in Active Storage so the job receives a blob reference instead of
# the bytes. GpuJob purges the blob once the job is done with it.
class GpuUpload
  class Invalid < StandardError; end

  KINDS = {
    image: {
      max_size: 10.megabytes,
      content_types: %w[image/png image/jpeg image/webp]
    },
    audio: {
      max_size: 25.megabytes,
      content_types: %w[audio/mpeg audio/x-wav audio/flac audio/ogg application/ogg audio/mp4]
    }
  }.freeze

  # @return [ActiveStorage::Blob]
  # @raise [Invalid] with a message that is safe to show the visitor
  def self.store!(file, kind:)
    rules = KINDS.fetch(kind)
    raise Invalid, "No #{kind} file was uploaded." unless file.is_a?(ActionDispatch::Http::UploadedFile)

    if file.size > rules[:max_size]
      raise Invalid, "#{kind.to_s.capitalize} files must be #{ActiveSupport::NumberHelper.number_to_human_size(rules[:max_size])} or smaller."
    end

    content_type = Marcel::MimeType.for(Pathname.new(file.path))
    raise Invalid, "That file doesn't look like a supported #{kind} file." unless rules[:content_types].include?(content_type)

    ActiveStorage::Blob.create_and_upload!(
      io: file.tempfile,
      filename: file.original_filename.presence || "upload",
      content_type: content_type,
      identify: false
    )
  end
end
