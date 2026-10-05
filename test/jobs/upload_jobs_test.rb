require "test_helper"

# Jobs for tools that take an uploaded file read it from Active Storage and
# delete it once they no longer need it.
class UploadJobsTest < ActiveJob::TestCase
  class UnlockedRembgJob < RembgJob
    private

    def gpu_lock = Gpu::Lock.new(redis: redis, key: "test:gpu_lock:#{job_id}")
  end

  setup do
    @blob = ActiveStorage::Blob.create_and_upload!(io: file_fixture("pixel.png").open, filename: "pixel.png")
  end

  test "hands the service a file with the uploaded bytes, then purges the upload" do
    received = nil
    remove_background = lambda do |path, model:|
      received = [ File.binread(path), model ]
      Base64.strict_encode64("result")
    end

    RembgService.stub(:remove_background, remove_background) do
      UnlockedRembgJob.perform_now(SecureRandom.uuid, @blob, { "model" => "u2netp" })
    end

    assert_equal [ file_fixture("pixel.png").binread, "u2netp" ], received
    assert_not ActiveStorage::Blob.exists?(@blob.id)
  end

  test "keeps the upload while a dropped connection is retried" do
    RembgService.stub(:remove_background, ->(*, **) { raise Gpu::ConnectionError }) do
      UnlockedRembgJob.perform_now(SecureRandom.uuid, @blob)
    end

    assert_enqueued_jobs 1, only: UnlockedRembgJob
    assert ActiveStorage::Blob.exists?(@blob.id)
  end

  test "purges the upload when it gives up" do
    RembgService.stub(:remove_background, ->(*, **) { raise Gpu::Offline }) do
      UnlockedRembgJob.perform_now(SecureRandom.uuid, @blob)
    end

    assert_not ActiveStorage::Blob.exists?(@blob.id)
  end

  test "stale uploads whose job never finished are purged" do
    travel 2.days do
      perform_enqueued_jobs { PurgeStaleUploadsJob.perform_now }
    end

    assert_not ActiveStorage::Blob.exists?(@blob.id)
  end
end
