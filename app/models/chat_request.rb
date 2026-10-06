# A visitor's chat history, checked before it goes anywhere near the GPU.
# Only user and assistant turns are accepted; the system prompt is set
# server-side by ChatService.
class ChatRequest
  include ActiveModel::Validations

  MAX_MESSAGES = 20
  MAX_MESSAGE_LENGTH = 4_000 # characters
  ROLES = %w[user assistant].freeze

  attr_reader :messages

  validate :has_messages
  validate :within_limits
  validate :only_known_roles
  validate :ends_with_user_message

  # @param messages [Array<#[]>] each with "role" and "content"
  def initialize(messages)
    @messages = Array(messages).map { |message| { "role" => message["role"].to_s, "content" => message["content"].to_s } }
  end

  private

  def has_messages
    errors.add(:base, "Send a message to start the chat.") if messages.empty?
  end

  def within_limits
    if messages.size > MAX_MESSAGES
      errors.add(:base, "This conversation is too long. Clear it and start again.")
    elsif messages.any? { |message| message["content"].length > MAX_MESSAGE_LENGTH }
      errors.add(:base, "Keep each message under #{MAX_MESSAGE_LENGTH.to_fs(:delimited)} characters.")
    end
  end

  def only_known_roles
    errors.add(:base, "Messages must come from the user or the assistant.") unless messages.all? { |message| ROLES.include?(message["role"]) }
  end

  def ends_with_user_message
    errors.add(:base, "The last message must be yours.") unless messages.empty? || messages.last["role"] == "user"
  end
end
