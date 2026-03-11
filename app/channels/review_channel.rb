class ReviewChannel < ApplicationCable::Channel
  STREAM_PREFIX = "review_"

  def subscribed
    review_id = params[:review_id]

    if review_id.present?
      stream_from "#{STREAM_PREFIX}#{review_id}"
    else
      reject
    end
  end
end
