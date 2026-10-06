# Service for converting raster images to SVG using ComfyUI's VTracer node
class VtracerService
  DEFAULT_OPTIONS = {
    hierarchical: "stacked",
    mode: "spline",
    filter_speckle: 4,
    color_precision: 6,
    layer_difference: 16,
    corner_threshold: 60,
    length_threshold: 4.0,
    max_iterations: 10,
    splice_threshold: 45,
    path_precision: 3
  }.freeze

  class VtracerError < StandardError; end

  # @param image_path [String] the input image on disk
  # @param options [Hash] VTracer parameters (see DEFAULT_OPTIONS)
  # @return [String] SVG markup
  def self.convert_to_svg(image_path, options = {})
    opts = options_for(options)

    workflow = ComfyuiClient.load_workflow("AUSTNNETTOSVG.json")
    workflow["1"]["inputs"]["image"] = ComfyuiClient.upload_file(image_path)["name"]
    workflow["2"]["inputs"].merge!(opts.stringify_keys)
    workflow["3"]["inputs"]["filename_prefix"] = "vtracer_#{SecureRandom.hex(4)}"

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: 30, output_node_id: "3")

    # ComfyUI sometimes reports the filename as an array of characters.
    filename = outputs["saved_svg"] || outputs.dig("ui", "saved_svg")
    raise VtracerError, "No SVG output returned from ComfyUI" if filename.blank?

    ComfyuiClient.get_output_file(Array(filename).join)
  rescue ComfyuiClient::ComfyuiError => e
    raise VtracerError, e.message
  end

  # Merges, type-casts and validates options from request params.
  # @raise [VtracerError] naming the first option that is out of range
  def self.options_for(options)
    opts = DEFAULT_OPTIONS.merge(normalize_options(options))
    validate_options!(opts)
    opts
  end

  # Get default options for reference
  def self.default_options
    DEFAULT_OPTIONS.dup
  end

  private

  # Normalize options from web params (strings) to proper types
  # Also handles legacy parameter names for backwards compatibility
  def self.normalize_options(options)
    opts = options.symbolize_keys

    # Handle legacy parameter names
    opts[:layer_difference] ||= opts.delete(:gradient_step)
    opts[:length_threshold] ||= opts.delete(:segment_length)

    {
      hierarchical: opts[:hierarchical]&.to_s,
      mode: opts[:mode]&.to_s,
      filter_speckle: opts[:filter_speckle]&.to_i,
      color_precision: opts[:color_precision]&.to_i,
      layer_difference: opts[:layer_difference]&.to_i,
      corner_threshold: opts[:corner_threshold]&.to_i,
      length_threshold: opts[:length_threshold]&.to_f,
      max_iterations: opts[:max_iterations]&.to_i,
      splice_threshold: opts[:splice_threshold]&.to_i,
      path_precision: opts[:path_precision]&.to_i
    }.compact
  end

  def self.validate_options!(opts)
    # Validate string options
    unless %w[stacked cutout].include?(opts[:hierarchical])
      raise VtracerError, "hierarchical must be 'stacked' or 'cutout'"
    end

    unless %w[spline polygon none].include?(opts[:mode])
      raise VtracerError, "mode must be 'spline', 'polygon', or 'none'"
    end

    # Validate numeric ranges
    if opts[:filter_speckle] < 0 || opts[:filter_speckle] > 128
      raise VtracerError, "filter_speckle must be between 0 and 128"
    end

    if opts[:color_precision] < 1 || opts[:color_precision] > 8
      raise VtracerError, "color_precision must be between 1 and 8"
    end

    if opts[:layer_difference] < 1 || opts[:layer_difference] > 255
      raise VtracerError, "layer_difference must be between 1 and 255"
    end

    if opts[:corner_threshold] < 0 || opts[:corner_threshold] > 180
      raise VtracerError, "corner_threshold must be between 0 and 180"
    end

    if opts[:length_threshold] < 0.1 || opts[:length_threshold] > 100
      raise VtracerError, "length_threshold must be between 0.1 and 100"
    end

    if opts[:max_iterations] < 1 || opts[:max_iterations] > 100
      raise VtracerError, "max_iterations must be between 1 and 100"
    end

    if opts[:splice_threshold] < 0 || opts[:splice_threshold] > 180
      raise VtracerError, "splice_threshold must be between 0 and 180"
    end

    if opts[:path_precision] < 1 || opts[:path_precision] > 10
      raise VtracerError, "path_precision must be between 1 and 10"
    end
  end
end
