class ReviewChannel < ApplicationCable::Channel
  STREAM_PREFIX = "review_"

  def subscribed
    review_id = params[:review_id]
    return reject unless admin && review_id.present?

    stream_from "#{STREAM_PREFIX}#{review_id}"
  end
end
