class ImagesController < ApplicationController
  before_action :set_image, only: [ :show, :edit, :update, :destroy ]

  def index
    @images = Image.published.ordered
  end

  def show
  end

  def new
    @image = Image.new
  end

  def create
    @image = Image.new(image_params)

    if @image.save
      ImageProcessingJob.perform_later(@image) if @image.file.attached?
      redirect_to @image, notice: "Image was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @image.update(image_params)
      ImageProcessingJob.perform_later(@image) if @image.file.attached?
      redirect_to @image, notice: "Image was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @image.destroy
    redirect_to images_url, notice: "Image was successfully destroyed."
  end

  private

  def set_image
    @image = Image.find(params[:id])
  end

  def image_params
    params.require(:image).permit(:title, :description, :position, :published, :file)
  end
end
