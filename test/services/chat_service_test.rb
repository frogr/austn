require "test_helper"

class ChatServiceTest < ActiveSupport::TestCase
  test "sends the server's system prompt ahead of the conversation and logs no content" do
    sent_body = nil
    http = Object.new
    http.define_singleton_method(:request) do |request|
      sent_body = JSON.parse(request.body)
      Net::HTTPOK.new("1.1", "200", "OK").tap do |response|
        response.instance_variable_set(:@read, true)
        response.instance_variable_set(:@body, { choices: [ { message: { content: "secret reply" } } ] }.to_json)
      end
    end
    %i[use_ssl= open_timeout= read_timeout=].each { |setter| http.define_singleton_method(setter) { |_| } }

    log = StringIO.new
    reply = with_env("LMSTUDIO_URL" => "http://gpu-box.test:1234") do
      Net::HTTP.stub(:new, http) do
        with_logger(Logger.new(log)) { ChatService.new.completion([ { "role" => "user", "content" => "secret question" } ]) }
      end
    end

    assert_equal "secret reply", reply
    assert_equal({ "role" => "system", "content" => ChatService::SYSTEM_PROMPT }, sent_body["messages"].first)
    assert_equal({ "role" => "user", "content" => "secret question" }, sent_body["messages"].last)
    assert_not_includes log.string, "secret"
  end

  private

  def with_logger(logger)
    previous = Rails.logger
    Rails.logger = logger
    yield
  ensure
    Rails.logger = previous
  end
end
