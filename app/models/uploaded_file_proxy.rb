# Proxy class that mimics an uploaded file for background job processing.
# Used when jobs receive base64-encoded file data that needs to be
# passed to services expecting file-like objects.
class UploadedFileProxy
  attr_reader :original_filename

  def initialize(tempfile, original_filename)
    @tempfile = tempfile
    @original_filename = original_filename
  end

  def read
    @tempfile.read
  end

  def rewind
    @tempfile.rewind
  end

  def path
    @tempfile.path
  end

  # Create a proxy from base64-encoded file data
  def self.from_base64(base64_data, original_filename:, prefix: "upload")
    extension = File.extname(original_filename).presence || ".bin"
    tempfile = Tempfile.new([ prefix, extension ])
    tempfile.binmode
    tempfile.write(Base64.decode64(base64_data))
    tempfile.rewind

    new(tempfile, original_filename)
  end

  def close
    @tempfile.close
  end

  def unlink
    @tempfile.unlink
  end

  # Convenience method for cleanup
  def cleanup
    close
    unlink
  end
end
