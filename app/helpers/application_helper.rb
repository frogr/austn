module ApplicationHelper
  # Generate a cache-busted path for esbuild assets written to public/assets.
  # Uses file mtime as a simple version so browsers pick up new builds.
  def esbuild_asset_path(filename)
    rel = File.join("/assets", filename)
    full = Rails.root.join("public/assets", filename)
    if File.exist?(full)
      ts = File.mtime(full).to_i
      "#{rel}?v=#{ts}"
    else
      rel
    end
  end
end
