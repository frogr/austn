require "test_helper"

class ImagesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @image = Image.create!(title: "Sunset", published: true)
  end

  test "the gallery and published images are public" do
    get images_path
    assert_response :success

    get image_path(@image)
    assert_response :success
  end

  test "unpublished images are not shown" do
    draft = Image.create!(title: "Draft", published: false)

    get image_path(draft)

    assert_response :not_found
  end

  test "there are no public write routes for images" do
    post "/images", params: { image: { title: "Spam", published: true } }
    assert_response :not_found

    patch "/images/#{@image.id}", params: { image: { title: "Defaced" } }
    assert_response :not_found

    delete "/images/#{@image.id}"
    assert_response :not_found

    assert_equal "Sunset", @image.reload.title
  end

  test "visitors cannot publish generated images to the gallery" do
    stub_gpu_online("images")

    assert_enqueued_jobs 1, only: ImageGenerationJob do
      post generate_images_path, params: { prompt: "a lighthouse", publish: "true" }
    end

    assert_equal false, enqueued_jobs.last["arguments"].last["publish"]
  end

  test "the admin can publish generated images" do
    stub_gpu_online("images")
    sign_in_as_admin

    post generate_images_path, params: { prompt: "a lighthouse", publish: "true" }

    assert_equal true, enqueued_jobs.last["arguments"].last["publish"]
  end
end
