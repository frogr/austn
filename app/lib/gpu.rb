# Talking to the home GPU box: the errors it can raise and how low-level
# network failures map onto them.
module Gpu
  class Error < StandardError; end

  # The backend is not configured or nothing answers at its address.
  # Retrying will not help until the box is back.
  class Offline < Error; end

  # The connection dropped mid-request. Worth retrying.
  class ConnectionError < Error; end

  # The backend accepted the work but did not finish in time.
  class Timeout < Error; end

  UNREACHABLE_ERRORS = [
    Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Errno::ENETUNREACH, Errno::EADDRNOTAVAIL,
    SocketError, Net::OpenTimeout
  ].freeze

  INTERRUPTED_ERRORS = [ Errno::ECONNRESET, Errno::EPIPE, EOFError, Net::WriteTimeout ].freeze

  # Runs a request to a GPU backend, re-raising network failures as Gpu errors.
  # The original exception stays available as #cause for the logs.
  def self.translating_network_errors
    yield
  rescue *UNREACHABLE_ERRORS => e
    raise Offline, e.message
  rescue *INTERRUPTED_ERRORS => e
    raise ConnectionError, e.message
  rescue Net::ReadTimeout => e
    raise Timeout, e.message
  end
end
