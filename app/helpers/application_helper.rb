module ApplicationHelper
  # Returns a responsive image tag with WebP support and lazy loading
  #
  # @param src [String] Path to the image
  # @param alt [String] Alt text for the image
  # @param options [Hash] Additional HTML options
  # @option options [Integer] :width Image width
  # @option options [Integer] :height Image height
  # @option options [Boolean] :lazy Enable lazy loading (default: true)
  # @option options [Boolean] :webp Use WebP format when available (default: true)
  # @return [String] HTML for the responsive image
  def responsive_image_tag(src, alt = "", options = {})
    # Default options
    options = {
      width: nil,
      height: nil,
      lazy: true,
      webp: true,
      class: nil
    }.merge(options)

    width_attr = options[:width] ? " width=\"#{options[:width]}\"" : ""
    height_attr = options[:height] ? " height=\"#{options[:height]}\"" : ""
    class_attr = options[:class] ? " class=\"#{options[:class]}\"" : ""
    loading_attr = options[:lazy] ? " loading=\"lazy\"" : ""
    decoding_attr = options[:lazy] ? " decoding=\"async\"" : ""

    # Generate ID for the picture element if needed for JS
    html_id = options[:id] ? " id=\"#{options[:id]}\"" : ""

    # Only generate webp path for local assets that aren't already webp
    is_external = src.start_with?("http")
    is_webp = src.end_with?(".webp")

    if options[:webp] && !is_external && !is_webp
      # Convert file extension to webp
      webp_src = src.sub(/\.(jpe?g|png)(\?.+)?$/, '.webp\2')

      html = <<-HTML
        <picture#{html_id}>
          <source srcset="#{webp_src}" type="image/webp">
          <img src="#{src}" alt="#{alt}"#{width_attr}#{height_attr}#{class_attr}#{loading_attr}#{decoding_attr}>
        </picture>
      HTML

      html.html_safe
    else
      # For external images or if webp is disabled, just use regular img tag
      tag_options = {
        alt: alt,
        src: src
      }

      # Only add attributes if they were provided
      tag_options[:width] = options[:width] if options[:width]
      tag_options[:height] = options[:height] if options[:height]
      tag_options[:class] = options[:class] if options[:class]
      tag_options[:loading] = "lazy" if options[:lazy]
      tag_options[:decoding] = "async" if options[:lazy]

      # Add any other options provided
      options.except(:width, :height, :lazy, :webp, :class).each do |key, value|
        tag_options[key] = value
      end

      image_tag(src, tag_options)
    end
  end

  # Returns a responsive background image style with WebP fallback
  #
  # @param src [String] Path to the image
  # @param options [Hash] Additional style options
  # @return [String] CSS style attribute for background image
  def responsive_bg_image(src, options = {})
    # Default options
    options = {
      position: "center",
      size: "cover",
      repeat: "no-repeat",
      webp: true
    }.merge(options)

    # Only try to use webp for local assets that aren't already webp
    is_external = src.start_with?("http")
    is_webp = src.end_with?(".webp")

    if options[:webp] && !is_external && !is_webp
      # Convert file extension to webp
      webp_src = src.sub(/\.(jpe?g|png)(\?.+)?$/, '.webp\2')

      # Use feature detection for WebP support
      <<-CSS.squish
        background-image: url('#{src}');
        @supports (background-image: -webkit-image-set(url('data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA') 1x)) {
          background-image: url('#{webp_src}');
        }
        background-position: #{options[:position]};
        background-size: #{options[:size]};
        background-repeat: #{options[:repeat]};
      CSS
    else
      # Just use the original image without WebP logic
      <<-CSS.squish
        background-image: url('#{src}');
        background-position: #{options[:position]};
        background-size: #{options[:size]};
        background-repeat: #{options[:repeat]};
      CSS
    end
  end
end
