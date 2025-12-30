require "net/http"
require "uri"

class GpuHealthService
  COMFYUI_URL = ENV["COMFYUI_URL"] || "http://100.68.94.33:8188"
  TTS_URL = ENV["TTS_URL"] || "http://100.68.94.33:5000"
  LMSTUDIO_URL = ENV["LMSTUDIO_URL"] || "http://100.68.94.33:1234"

  TIMEOUT = 5

  def self.check_all
    new.check_all
  end

  def check_all
    {
      images: check_images,
      tts: check_tts,
      chat: check_chat
    }
  end

  def check_images
    check_service("images") do
      uri = URI.parse("#{COMFYUI_URL}/system_stats")
      response = make_request(uri)
      response.is_a?(Net::HTTPSuccess)
    end
  end

  def check_tts
    check_service("tts") do
      uri = URI.parse("#{TTS_URL}/health")
      response = make_request(uri)
      response.is_a?(Net::HTTPSuccess)
    end
  end

  def check_chat
    check_service("chat") do
      uri = URI.parse("#{LMSTUDIO_URL}/v1/models")
      response = make_request(uri)
      response.is_a?(Net::HTTPSuccess)
    end
  end

  private

  def check_service(name)
    status = GpuHealthStatus.for_service(name)
    begin
      if yield
        status.mark_online!
        true
      else
        status.mark_offline!("Service returned non-success response")
        false
      end
    rescue StandardError => e
      status.mark_offline!(e.message)
      false
    end
  end

  def make_request(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.open_timeout = TIMEOUT
    http.read_timeout = TIMEOUT
    http.get(uri.path.presence || "/")
  end
end
