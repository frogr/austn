require "test_helper"

class UploadedFileProxyTest < ActiveSupport::TestCase
  test "from_base64 creates a valid proxy" do
    original_content = "Hello, World!"
    base64_data = Base64.encode64(original_content)

    proxy = UploadedFileProxy.from_base64(
      base64_data,
      original_filename: "test.txt",
      prefix: "test"
    )

    assert_equal "test.txt", proxy.original_filename
    assert_equal original_content, proxy.read
    assert File.exist?(proxy.path)

    proxy.cleanup
    refute File.exist?(proxy.path)
  end

  test "from_base64 preserves file extension" do
    base64_data = Base64.encode64("fake image data")

    proxy = UploadedFileProxy.from_base64(
      base64_data,
      original_filename: "image.png",
      prefix: "upload"
    )

    assert proxy.path.end_with?(".png")
    proxy.cleanup
  end

  test "rewind resets file pointer" do
    base64_data = Base64.encode64("test content")

    proxy = UploadedFileProxy.from_base64(
      base64_data,
      original_filename: "test.txt"
    )

    proxy.read # First read
    proxy.rewind
    content = proxy.read # Second read after rewind

    assert_equal "test content", content
    proxy.cleanup
  end
end
