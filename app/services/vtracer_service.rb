require "tempfile"

# Service for converting raster images to SVG using ComfyUI's VTracer node
class VtracerService
  DEFAULT_OPTIONS = {
    filter_speckle: 4,
    color_precision: 6,
    gradient_step: 10,
    corner_threshold: 60,
    segment_length: 4.0,
    splice_threshold: 45
  }.freeze

  class VtracerError < StandardError; end

  # Convert an image to SVG
  # @param image_file [ActionDispatch::Http::UploadedFile] The uploaded image
  # @param options [Hash] VTracer parameters
  # @return [String] SVG content as string
  def self.convert_to_svg(image_file, options = {})
    opts = DEFAULT_OPTIONS.merge(normalize_options(options))
    validate_options!(opts)

    # Save uploaded file to temp location
    temp_file = create_temp_file(image_file)

    begin
      # Upload to ComfyUI
      upload_result = ComfyuiClient.upload_file(temp_file.path)
      uploaded_filename = upload_result["name"]

      Rails.logger.info "Uploaded image for vtracer: #{uploaded_filename}"

      # Load and modify workflow
      workflow = ComfyuiClient.load_workflow("AUSTNNETTOSVG.json")

      # Update input image (node 1)
      workflow["1"]["inputs"]["image"] = uploaded_filename

      # Update VTracer parameters (node 2)
      workflow["2"]["inputs"]["filter_speckle"] = opts[:filter_speckle].to_i
      workflow["2"]["inputs"]["color_precision"] = opts[:color_precision].to_i
      workflow["2"]["inputs"]["gradient_step"] = opts[:gradient_step].to_i
      workflow["2"]["inputs"]["corner_threshold"] = opts[:corner_threshold].to_i
      workflow["2"]["inputs"]["segment_length"] = opts[:segment_length].to_f
      workflow["2"]["inputs"]["splice_threshold"] = opts[:splice_threshold].to_i

      # Generate unique output prefix
      output_prefix = "vtracer_#{SecureRandom.hex(4)}"
      workflow["3"]["inputs"]["filename_prefix"] = output_prefix

      # Queue the workflow
      prompt_id = ComfyuiClient.queue_prompt(workflow)

      # Wait for completion (30s timeout)
      outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: 30, output_node_id: "3")

      # Get the SVG output - the Save SVG node outputs svg files
      if outputs && outputs["svg"]&.any?
        svg_info = outputs["svg"].first
        filename = svg_info["filename"]
        subfolder = svg_info["subfolder"] || ""

        Rails.logger.info "VTracer output ready: #{filename}"

        # Fetch the SVG content
        ComfyuiClient.get_output_file(filename, subfolder: subfolder, type: "output")
      elsif outputs && outputs["files"]&.any?
        # Alternative output format
        file_info = outputs["files"].first
        filename = file_info["filename"]
        subfolder = file_info["subfolder"] || ""

        ComfyuiClient.get_output_file(filename, subfolder: subfolder, type: "output")
      else
        raise VtracerError, "No SVG output returned from ComfyUI"
      end

    ensure
      temp_file.close
      temp_file.unlink
    end

  rescue ComfyuiClient::ComfyuiError => e
    raise VtracerError, e.message
  end

  # Get default options for reference
  def self.default_options
    DEFAULT_OPTIONS.dup
  end

  private

  # Normalize options from web params (strings) to proper types
  def self.normalize_options(options)
    opts = options.symbolize_keys
    {
      filter_speckle: opts[:filter_speckle]&.to_i,
      color_precision: opts[:color_precision]&.to_i,
      gradient_step: opts[:gradient_step]&.to_i,
      corner_threshold: opts[:corner_threshold]&.to_i,
      segment_length: opts[:segment_length]&.to_f,
      splice_threshold: opts[:splice_threshold]&.to_i
    }.compact
  end

  def self.validate_options!(opts)
    # Validate ranges
    if opts[:filter_speckle] < 0 || opts[:filter_speckle] > 128
      raise VtracerError, "filter_speckle must be between 0 and 128"
    end

    if opts[:color_precision] < 1 || opts[:color_precision] > 8
      raise VtracerError, "color_precision must be between 1 and 8"
    end

    if opts[:gradient_step] < 1 || opts[:gradient_step] > 255
      raise VtracerError, "gradient_step must be between 1 and 255"
    end

    if opts[:corner_threshold] < 0 || opts[:corner_threshold] > 180
      raise VtracerError, "corner_threshold must be between 0 and 180"
    end

    if opts[:segment_length] < 0.1 || opts[:segment_length] > 100
      raise VtracerError, "segment_length must be between 0.1 and 100"
    end

    if opts[:splice_threshold] < 0 || opts[:splice_threshold] > 180
      raise VtracerError, "splice_threshold must be between 0 and 180"
    end
  end

  def self.create_temp_file(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).presence || ".png"
    temp_file = Tempfile.new(["vtracer_input", extension])
    temp_file.binmode
    temp_file.write(uploaded_file.read)
    temp_file.rewind
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)
    temp_file
  end
end
