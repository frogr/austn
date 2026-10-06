# Service for generating music using ComfyUI's ACE-Step workflow
class MusicService
  WORKFLOW_NAME = "AUSTNNETSONGS.json"
  BASE_TIMEOUT = 300 # 5 minutes base
  TIMEOUT_PER_SECOND = 3 # extra seconds of timeout per second of audio duration

  PARAMS = %i[
    tags lyrics audio_duration infer_step guidance_scale guidance_scale_text guidance_scale_lyric seed scheduler preset
  ].freeze

  # Bounds on what one request can ask the GPU to do.
  AUDIO_DURATION_RANGE = 10.0..240.0 # seconds of audio
  INFER_STEP_RANGE = 1..100
  GUIDANCE_RANGE = 0.0..15.0
  MAX_COMPLETION_TIMEOUT = [ BASE_TIMEOUT, (AUDIO_DURATION_RANGE.max * TIMEOUT_PER_SECOND).to_i ].max

  class MusicError < StandardError; end

  SCHEDULER_OPTIONS = %w[euler euler_ancestral ddim].freeze

  PRESETS = {
    "quick_instrumental" => { tags: "lo-fi, chill, piano", lyrics: "[inst]", audio_duration: 30.0, infer_step: 40 },
    "full_song" => { audio_duration: 120.0, infer_step: 60 },
    "rap_track" => { tags: "hip-hop, trap, 808, deep male voice, 130 BPM", infer_step: 60 },
    "ambient" => { tags: "ambient, atmospheric, synth pads, ethereal, 70 BPM", lyrics: "[inst]", audio_duration: 180.0, infer_step: 60 }
  }.freeze

  # Generate music from tags and lyrics
  # @param params [Hash] Generation parameters
  # @return [Hash] { filename:, subfolder:, type: "output", seed: }
  def self.generate(params)
    workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)

    # Apply preset if specified
    if params[:preset] && PRESETS[params[:preset]]
      preset = PRESETS[params[:preset]]
      params = preset.merge(params.except(:preset))
    end

    # Generate unique prefix for this job
    unique_prefix = "ace_song_#{SecureRandom.hex(8)}"

    # Handle seed - 0 means random
    seed = params[:seed].to_i
    seed = rand(1..2**32) if seed.zero?

    modify_workflow(workflow, params, unique_prefix, seed)

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    Rails.logger.info "Queued music generation with prompt_id: #{prompt_id}, prefix: #{unique_prefix}"

    timeout = completion_timeout(params[:audio_duration])

    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: timeout)

    # Find the output audio file
    output_info = extract_output(outputs)

    Rails.logger.info "Music generated: #{output_info[:filename]}"

    output_info.merge(seed: seed)
  rescue ComfyuiClient::ComfyuiError => e
    raise MusicError, e.message
  end

  def self.completion_timeout(audio_duration)
    duration = audio_duration ? audio_duration.to_f.clamp(AUDIO_DURATION_RANGE) : 0
    [ BASE_TIMEOUT, (duration * TIMEOUT_PER_SECOND).to_i ].max
  end

  private

  def self.modify_workflow(workflow, params, unique_prefix, seed)
    workflow.each do |_node_id, node|
      case node["class_type"]
      when "MultiLinePromptACES"
        node["inputs"]["multi_line_prompt"] = params[:tags] if params[:tags].present?
      when "MultiLineLyrics"
        node["inputs"]["multi_line_prompt"] = params[:lyrics] if params[:lyrics].present?
      when "GenerationParameters"
        node["inputs"]["audio_duration"] = params[:audio_duration].to_f.clamp(AUDIO_DURATION_RANGE) if params[:audio_duration]
        node["inputs"]["infer_step"] = params[:infer_step].to_i.clamp(INFER_STEP_RANGE) if params[:infer_step]
        %i[guidance_scale guidance_scale_text guidance_scale_lyric].each do |key|
          node["inputs"][key.to_s] = params[key].to_f.clamp(GUIDANCE_RANGE) if params[key]
        end
        node["inputs"]["seed"] = seed
        node["inputs"]["scheduler_type"] = params[:scheduler] if params[:scheduler].present? && SCHEDULER_OPTIONS.include?(params[:scheduler])
      when "SaveAudio"
        node["inputs"]["filename_prefix"] = unique_prefix
      end
    end
  end

  def self.extract_output(outputs)
    # Look through all output nodes for audio files
    outputs.each do |_node_id, node_output|
      # SaveAudio outputs under "audio" key
      if node_output["audio"]&.any?
        file_info = node_output["audio"].first
        return {
          filename: file_info["filename"],
          subfolder: file_info["subfolder"] || "",
          type: file_info["type"] || "output"
        }
      end
    end

    raise MusicError, "No audio output found in ComfyUI response"
  end
end
