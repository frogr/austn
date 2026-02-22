# Service for generating videos using ComfyUI's Wan 2.2 workflow
class VideoService
  WORKFLOW_NAME = "AUSTNNETVIDEOS.json"
  GENERATION_TIMEOUT = 600 # 10 minutes - video gen is slow

  class VideoError < StandardError; end

  SAMPLER_OPTIONS = %w[euler euler_ancestral uni_pc dpmpp_2m dpmpp_2m_sde].freeze
  SCHEDULER_OPTIONS = %w[normal beta simple karras sgm_uniform].freeze

  RESOLUTION_PRESETS = {
    "quick" => { width: 512, height: 320, length: 33 },
    "standard" => { width: 832, height: 480, length: 81 },
    "hd" => { width: 1280, height: 720, length: 81 }
  }.freeze

  # Generate a video from a text prompt
  # @param params [Hash] Generation parameters
  # @return [Hash] { filename:, subfolder:, type: "output" }
  def self.generate(params)
    workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)

    # Apply resolution preset if specified
    if params[:preset] && RESOLUTION_PRESETS[params[:preset]]
      preset = RESOLUTION_PRESETS[params[:preset]]
      params = preset.merge(params.except(:preset))
    end

    # Generate unique prefix for this job
    unique_prefix = "wan_video_#{SecureRandom.hex(8)}"

    # Handle seed - 0 means random
    seed = params[:seed].to_i
    seed = rand(1..2**32) if seed.zero?

    modify_workflow(workflow, params, unique_prefix, seed)

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    Rails.logger.info "Queued video generation with prompt_id: #{prompt_id}, prefix: #{unique_prefix}"

    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: GENERATION_TIMEOUT)

    # Find the output file from SaveAnimatedWEBP node (node 14)
    output_info = extract_output(outputs)

    Rails.logger.info "Video generated: #{output_info[:filename]}"

    output_info.merge(seed: seed)
  rescue ComfyuiClient::ComfyuiError => e
    raise VideoError, e.message
  end

  private

  def self.modify_workflow(workflow, params, unique_prefix, seed)
    workflow.each do |_node_id, node|
      case node["class_type"]
      when "CLIPTextEncode"
        title = node.dig("_meta", "title") || ""
        if title.include?("Positive")
          node["inputs"]["text"] = params[:prompt] if params[:prompt]
        elsif title.include?("Negative")
          node["inputs"]["text"] = params[:negative_prompt] if params[:negative_prompt].present?
        end
      when "EmptyHunyuanLatentVideo"
        node["inputs"]["width"] = params[:width].to_i if params[:width]
        node["inputs"]["height"] = params[:height].to_i if params[:height]
        node["inputs"]["length"] = params[:length].to_i if params[:length]
      when "RandomNoise"
        node["inputs"]["noise_seed"] = seed
      when "BasicScheduler"
        node["inputs"]["steps"] = params[:steps].to_i if params[:steps]
        node["inputs"]["scheduler"] = params[:scheduler] if params[:scheduler].present? && SCHEDULER_OPTIONS.include?(params[:scheduler])
        node["inputs"]["denoise"] = params[:denoise].to_f if params[:denoise]
      when "KSamplerSelect"
        node["inputs"]["sampler_name"] = params[:sampler_name] if params[:sampler_name].present? && SAMPLER_OPTIONS.include?(params[:sampler_name])
      when "ModelSamplingSD3"
        node["inputs"]["shift"] = params[:shift].to_f if params[:shift]
      when "SaveAnimatedWEBP"
        node["inputs"]["fps"] = params[:fps].to_i if params[:fps]
        node["inputs"]["filename_prefix"] = unique_prefix
      end
    end
  end

  def self.extract_output(outputs)
    # Look through all output nodes for video/image files
    outputs.each do |_node_id, node_output|
      # SaveAnimatedWEBP outputs under "images" key
      if node_output["images"]&.any?
        file_info = node_output["images"].first
        return {
          filename: file_info["filename"],
          subfolder: file_info["subfolder"] || "",
          type: file_info["type"] || "output"
        }
      end
      # VHS_VideoCombine outputs under "gifs" key
      if node_output["gifs"]&.any?
        file_info = node_output["gifs"].first
        return {
          filename: file_info["filename"],
          subfolder: file_info["subfolder"] || "",
          type: file_info["type"] || "output"
        }
      end
    end

    raise VideoError, "No video output found in ComfyUI response"
  end
end
