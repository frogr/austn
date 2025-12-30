require "httparty"
require "base64"

class TtsService
  include HTTParty
  base_uri ENV["TTS_URL"] || "http://100.68.94.33:5000"

  class TtsError < StandardError; end

  def self.generate_speech(text, options = {})
    exaggeration = options[:exaggeration] || options["exaggeration"] || 0.5
    cfg_weight = options[:cfg_weight] || options["cfg_weight"] || 0.5
    voice_preset = options[:voice_preset] || options["voice_preset"]
    voice_audio = options[:voice_audio] || options["voice_audio"]

    Rails.logger.info "Sending TTS request to #{base_uri}/generate"

    body = {
      text: text,
      exaggeration: exaggeration.to_f,
      cfg_weight: cfg_weight.to_f
    }

    # Add voice preset if provided (takes precedence over uploaded audio)
    if voice_preset.present?
      body[:voice_preset] = voice_preset
      Rails.logger.info "Using voice preset: #{voice_preset}"
    elsif voice_audio.present?
      body[:voice_audio] = voice_audio
      Rails.logger.info "Using voice cloning with uploaded audio"
    end

    response = post("/generate",
      body: body.to_json,
      headers: { "Content-Type" => "application/json" },
      timeout: 120  # TTS can take a while
    )

    Rails.logger.info "TTS response code: #{response.code}"

    unless response.success?
      Rails.logger.error "TTS error response: #{response.body}"
      raise TtsError, "TTS error: #{response.code} - #{response.body}"
    end

    response_data = response.parsed_response || JSON.parse(response.body)

    unless response_data["audio"]
      Rails.logger.error "No audio in response: #{response_data.inspect}"
      raise TtsError, "TTS did not return audio data"
    end

    Rails.logger.info "TTS generated #{response_data['duration']}s of audio"

    {
      audio: response_data["audio"],
      sample_rate: response_data["sample_rate"],
      duration: response_data["duration"]
    }
  rescue HTTParty::Error => e
    raise TtsError, "Network error: #{e.message}"
  rescue => e
    Rails.logger.error "TtsService error: #{e.message}"
    raise
  end

  def self.health_check
    response = get("/health", timeout: 5)

    if response.success?
      response.parsed_response || JSON.parse(response.body)
    else
      { status: "error", code: response.code }
    end
  rescue => e
    { status: "unreachable", error: e.message }
  end

  def self.available_voices
    response = get("/voices", timeout: 5)

    if response.success?
      data = response.parsed_response || JSON.parse(response.body)
      data["voices"] || []
    else
      []
    end
  rescue => e
    Rails.logger.error "Failed to fetch voices: #{e.message}"
    []
  end
end
