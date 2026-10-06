require "test_helper"

class GpuUploadTest < ActiveSupport::TestCase
  test "stores a valid image and records the type from its bytes" do
    blob = GpuUpload.store!(upload("pixel.png", "image/png"), kind: :image)

    assert blob.persisted?
    assert_equal "image/png", blob.content_type
    assert_equal "pixel.png", blob.filename.to_s
  end

  test "stores valid audio" do
    blob = GpuUpload.store!(upload("silence.wav", "audio/wav"), kind: :audio)

    assert_equal "audio/x-wav", blob.content_type
  end

  test "rejects files over the size limit before storing them" do
    file = upload("pixel.png", "image/png")

    file.stub(:size, 10.megabytes + 1) do
      error = assert_raises(GpuUpload::Invalid) { GpuUpload.store!(file, kind: :image) }
      assert_equal "Image files must be 10 MB or smaller.", error.message
    end
    assert_equal 0, ActiveStorage::Blob.count
  end

  test "judges the type by content, not by name or declared type" do
    disguised = upload("pixel.png", "audio/mpeg", original_filename: "song.mp3")

    assert_raises(GpuUpload::Invalid) { GpuUpload.store!(disguised, kind: :audio) }
  end

  test "rejects markup posing as an image" do
    html = Tempfile.new([ "cat", ".png" ])
    html.write("<html><script>alert(1)</script></html>")
    html.rewind
    file = ActionDispatch::Http::UploadedFile.new(tempfile: html, filename: "cat.png", type: "image/png")

    assert_raises(GpuUpload::Invalid) { GpuUpload.store!(file, kind: :image) }
  ensure
    html&.close!
  end

  test "rejects a missing file" do
    assert_raises(GpuUpload::Invalid) { GpuUpload.store!(nil, kind: :image) }
    assert_raises(GpuUpload::Invalid) { GpuUpload.store!("not a file", kind: :image) }
  end

  private

  def upload(fixture, content_type, original_filename: fixture)
    file = Rack::Test::UploadedFile.new(file_fixture(fixture), content_type, original_filename: original_filename)
    as_uploaded_file(file)
  end

  # What a controller sees in params for a multipart upload.
  def as_uploaded_file(rack_file)
    ActionDispatch::Http::UploadedFile.new(
      tempfile: rack_file.tempfile, filename: rack_file.original_filename, type: rack_file.content_type
    )
  end
end
