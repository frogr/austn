require "net/http"

# Probes each GPU backend and records the result for every tool that runs
# on it. A backend with no URL configured is recorded as offline without
# making a request.
class GpuHealthService
  TIMEOUT = 5 # seconds

  PROBE_PATHS = {
    comfyui: "/system_stats",
    tts: "/health",
    lmstudio: "/v1/models"
  }.freeze

  def self.check_all
    new.check_all
  end

  # @return [Hash{String => Boolean}] online state per tool
  def check_all
    Gpu::Backend::TOOLS.values.uniq.each_with_object({}) do |backend, results|
      online, error = probe(backend)
      tools_on(backend).each do |tool|
        record(tool, online, error)
        results[tool] = online
      end
    end
  end

  # @return [Boolean] whether the tool's backend answered
  def check(tool)
    online, error = probe(Gpu::Backend.for_tool(tool))
    record(tool, online, error)
    online
  end

  private

  def tools_on(backend)
    Gpu::Backend::TOOLS.select { |_tool, tool_backend| tool_backend == backend }.keys
  end

  # @return [Array(Boolean, String)] online flag and, when offline, why
  def probe(backend)
    return [ false, "#{Gpu::Backend::URL_ENV.fetch(backend)} is not set" ] unless Gpu::Backend.configured?(backend)

    uri = URI.join(Gpu::Backend.url(backend), PROBE_PATHS.fetch(backend))
    response = Gpu.translating_network_errors do
      Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https",
                      open_timeout: TIMEOUT, read_timeout: TIMEOUT) { |http| http.get(uri.request_uri) }
    end

    response.is_a?(Net::HTTPSuccess) ? [ true, nil ] : [ false, "HTTP #{response.code}" ]
  rescue Gpu::Error => e
    [ false, "#{e.class}: #{e.message}" ]
  end

  def record(tool, online, error)
    status = GpuHealthStatus.for_service(tool)
    online ? status.mark_online! : status.mark_offline!(error)
  end
end
