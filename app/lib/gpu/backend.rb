module Gpu
  # Where the GPU services live. This is the only place that reads their
  # configuration. A URL that is not set means that backend is offline;
  # there is deliberately no default host.
  module Backend
    URL_ENV = {
      comfyui: "COMFYUI_URL",
      tts: "TTS_URL",
      lmstudio: "LMSTUDIO_URL"
    }.freeze

    # Every public GPU tool and the backend it runs on.
    TOOLS = {
      "images" => :comfyui,
      "rembg" => :comfyui,
      "vtracer" => :comfyui,
      "stems" => :comfyui,
      "music" => :comfyui,
      "model3d" => :comfyui,
      "tts" => :tts,
      "chat" => :lmstudio
    }.freeze

    def self.url(backend)
      ENV[URL_ENV.fetch(backend)].presence
    end

    def self.url!(backend)
      url(backend) || raise(Offline, "#{URL_ENV.fetch(backend)} is not set")
    end

    def self.configured?(backend)
      url(backend).present?
    end

    def self.for_tool(tool)
      TOOLS.fetch(tool)
    end
  end
end
