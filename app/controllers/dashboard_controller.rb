class DashboardController < ApplicationController
  def hello
    @message = "world"
  end

  def turbo_message
    respond_to do |format|
      format.turbo_stream {
        render turbo_stream: turbo_stream.update(
          "message",
          "Message updated via Turbo at #{Time.current.strftime('%H:%M:%S')}"
        )
      }
    end
  end
end
