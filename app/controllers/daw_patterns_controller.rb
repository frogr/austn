class DawPatternsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :create, :update, :destroy ]

  def index
    patterns = DawPattern.recent

    if params[:q].present?
      patterns = patterns.search(params[:q])
    end

    if params[:tag].present?
      patterns = patterns.by_tag(params[:tag])
    end

    if params[:templates] == "true"
      patterns = patterns.templates
    elsif params[:templates] == "false"
      patterns = patterns.user_patterns
    end

    render json: patterns.limit(100)
  end

  def show
    pattern = DawPattern.find(params[:id])
    render json: pattern
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pattern not found" }, status: :not_found
  end

  def create
    pattern = DawPattern.new(pattern_params)

    if pattern.save
      render json: pattern, status: :created
    else
      render json: { errors: pattern.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    pattern = DawPattern.find(params[:id])

    if pattern.update(pattern_params)
      render json: pattern
    else
      render json: { errors: pattern.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pattern not found" }, status: :not_found
  end

  def destroy
    pattern = DawPattern.find(params[:id])
    pattern.destroy
    render json: { success: true }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pattern not found" }, status: :not_found
  end

  def tags
    tags = DawPattern.pluck(:tags).flatten.uniq.compact.sort
    render json: tags
  end

  private

  def pattern_params
    params.permit(:name, :description, :bpm, :total_steps, :steps_per_measure, :is_template, tags: [], data: {})
  end
end
