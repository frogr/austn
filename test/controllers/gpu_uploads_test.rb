require "test_helper"

class GpuUploadsTest < ActionDispatch::IntegrationTest
  setup do
    %w[rembg stems vtracer model3d].each { |tool| stub_gpu_online(tool) }
  end

  test "an accepted upload is stored and the job gets a blob, not the bytes" do
    assert_enqueued_jobs 1, only: RembgJob do
      post "/rembg/generate", params: { image: fixture_file_upload("pixel.png", "image/png"), model: "u2netp" }
    end

    assert_response :success
    job_arguments = enqueued_jobs.last["arguments"]
    assert_match %r{\Agid://.+/ActiveStorage::Blob/\d+\z}, job_arguments.second["_aj_globalid"]
    assert_equal "u2netp", job_arguments.third["model"]
    assert_operator job_arguments.to_json.bytesize, :<, 1_000
  end

  test "audio tools accept audio" do
    assert_enqueued_jobs 1, only: StemsJob do
      post "/stems/generate", params: { audio: fixture_file_upload("silence.wav", "audio/wav") }
    end
  end

  test "a file of the wrong type is refused and nothing is queued" do
    assert_no_enqueued_jobs do
      post "/stems/generate", params: { audio: fixture_file_upload("pixel.png", "audio/mpeg") }
    end

    assert_response :unprocessable_entity
    assert_equal "invalid_input", response.parsed_body["error_code"]
    assert_equal 0, ActiveStorage::Blob.count
  end

  test "a missing file is refused" do
    post "/3d/generate"

    assert_response :unprocessable_entity
    assert_equal "invalid_input", response.parsed_body["error_code"]
  end

  test "an unknown model is refused before the file is stored" do
    post "/rembg/generate", params: { image: fixture_file_upload("pixel.png", "image/png"), model: "../../etc" }

    assert_response :unprocessable_entity
    assert_equal 0, ActiveStorage::Blob.count
  end

  test "out of range vectorizer options are refused" do
    post "/vtracer/generate", params: { image: fixture_file_upload("pixel.png", "image/png"), color_precision: 99 }

    assert_response :unprocessable_entity
    assert_match "color_precision", response.parsed_body["error"]
  end

  test "generation requests are throttled per IP" do
    10.times { post "/3d/generate" }
    assert_response :unprocessable_entity

    post "/3d/generate"

    assert_response :too_many_requests
  end
end
