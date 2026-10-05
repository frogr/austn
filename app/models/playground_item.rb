# A Playground entry: one of the self-hosted GPU tools (now a write-up of how it
# worked) or a browser tool that still runs live. From content/playground/<slug>.md.
#
# Front matter keys: title, summary, order, kind (gpu | browser | page), live_path,
# legacy_path, model, screenshot, screenshot_caption
class PlaygroundItem
  include MarkdownDocument

  def self.content_dir = Rails.root.join("content/playground")

  def kind = attributes.fetch("kind", "gpu")
  def gpu? = kind == "gpu"
  def live_path = attributes["live_path"]
  def legacy_path = attributes["legacy_path"]
  def model = attributes["model"]
  def screenshot = attributes["screenshot"]
  def screenshot_caption = attributes["screenshot_caption"]
end
