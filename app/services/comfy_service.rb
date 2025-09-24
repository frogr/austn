require 'httparty'
require 'base64'

class ComfyService
  include HTTParty
  base_uri ENV['COMFYUI_URL'] || 'http://100.68.94.33:8188'

  class ComfyError < StandardError; end

  def self.generate_image(prompt, negative_prompt: nil, seed: nil, image_size: nil, batch_size: nil)
    workflow = build_workflow(prompt, negative_prompt, seed, image_size, batch_size)

    Rails.logger.info "Sending request to ComfyUI at #{base_uri}/prompt"

    response = post('/prompt',
      body: { prompt: workflow }.to_json,
      headers: { 'Content-Type' => 'application/json' },
      timeout: 30
    )

    Rails.logger.info "ComfyUI response code: #{response.code}"
    Rails.logger.info "ComfyUI response body: #{response.body[0..500]}" # Log first 500 chars

    unless response.success?
      Rails.logger.error "ComfyUI error response: #{response.body}"
      raise ComfyError, "ComfyUI error: #{response.code} - #{response.body}"
    end

    # Parse response body if it's a string
    response_data = response.parsed_response || JSON.parse(response.body)
    prompt_id = response_data['prompt_id']

    unless prompt_id
      Rails.logger.error "No prompt_id in response: #{response_data.inspect}"
      raise ComfyError, "ComfyUI did not return a prompt_id"
    end

    Rails.logger.info "ComfyUI prompt queued with ID: #{prompt_id}"
    wait_for_image(prompt_id)
  rescue HTTParty::Error => e
    raise ComfyError, "Network error: #{e.message}"
  rescue => e
    Rails.logger.error "ComfyService error: #{e.message}"
    raise
  end

  private

  def self.build_workflow(prompt, negative_prompt, seed, image_size, batch_size)
    # Default to 512 if not specified
    size = image_size ? image_size.to_i : 512
    # Default to 1 if not specified
    batch = batch_size ? batch_size.to_i : 1

    {
      "4" => {
        "inputs" => {
          "ckpt_name" => "v1-5-pruned-emaonly-fp16.safetensors"
        },
        "class_type" => "CheckpointLoaderSimple"
      },
      "5" => {
        "inputs" => {
          "text" => prompt,
          "clip" => ["4", 1]
        },
        "class_type" => "CLIPTextEncode"
      },
      "6" => {
        "inputs" => {
          "text" => negative_prompt || "blurry, out of focus, low quality, pixelated, compression artifacts, jpeg artifacts",
          "clip" => ["4", 1]
        },
        "class_type" => "CLIPTextEncode"
      },
      "3" => {
        "inputs" => {
          "seed" => seed || rand(1..1000000000),
          "steps" => 20,
          "cfg" => 8.0,
          "sampler_name" => "euler",
          "scheduler" => "normal",
          "denoise" => 1.00,
          "model" => ["4", 0],
          "positive" => ["5", 0],
          "negative" => ["6", 0],
          "latent_image" => ["7", 0]
        },
        "class_type" => "KSampler"
      },
      "7" => {
        "inputs" => {
          "width" => size,
          "height" => size,
          "batch_size" => batch
        },
        "class_type" => "EmptyLatentImage"
      },
      "8" => {
        "inputs" => {
          "samples" => ["3", 0],
          "vae" => ["4", 2]
        },
        "class_type" => "VAEDecode"
      },
      "9" => {
        "inputs" => {
          "filename_prefix" => "api_#{SecureRandom.hex(4)}",
          "images" => ["8", 0]
        },
        "class_type" => "SaveImage"
      }
    }
  end

  def self.wait_for_image(prompt_id, timeout: 60)
    start_time = Time.current

    loop do
      response = get("/history/#{prompt_id}")

      if response.success? && response[prompt_id]
        history_entry = response[prompt_id]

        if history_entry['outputs'] && history_entry['outputs']['9']
          outputs = history_entry['outputs']['9']
          if outputs['images'] && outputs['images'].any?
            # Handle multiple images for batch
            images = outputs['images'].map do |image_info|
              filename = image_info['filename']
              subfolder = image_info['subfolder'] || ''

              Rails.logger.info "Image ready: #{filename}"

              image_response = get("/view",
                query: {
                  filename: filename,
                  subfolder: subfolder,
                  type: 'output'
                }
              )

              if image_response.success?
                Base64.strict_encode64(image_response.body)
              else
                Rails.logger.error "Failed to fetch image: #{filename}"
                nil
              end
            end.compact

            # Return array if multiple, single if one
            return images.length == 1 ? images.first : images
          end
        end
      end

      if Time.current - start_time > timeout
        raise ComfyError, "Timeout waiting for image generation (#{timeout}s)"
      end

      sleep 2
    end
  end
end