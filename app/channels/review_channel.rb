class ReviewChannel < ApplicationCable::Channel
  def subscribed
    stream_from "review_#{params[:review_id]}"
  end
end
