class Booking < ApplicationRecord
  belongs_to :availability

  validates :booked_date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :first_name, presence: true
  validates :email, presence: true,
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }
  validates :phone_number, presence: true
  validates :confirmation_token, presence: true, uniqueness: true
  validates :status, inclusion: { in: %w[confirmed cancelled completed] }
  validate :slot_available, on: :create
  validate :not_in_past, on: :create

  before_validation :generate_confirmation_token, on: :create
  before_validation :normalize_phone_number

  scope :confirmed, -> { where(status: "confirmed") }
  scope :cancelled, -> { where(status: "cancelled") }
  scope :completed, -> { where(status: "completed") }
  scope :upcoming, -> { confirmed.where("booked_date > ? OR (booked_date = ? AND start_time > ?)", Date.current, Date.current, Time.current) }
  scope :past, -> { where("booked_date < ? OR (booked_date = ? AND end_time < ?)", Date.current, Date.current, Time.current) }
  scope :for_date, ->(date) { where(booked_date: date) }
  scope :today, -> { where(booked_date: Date.current) }
  scope :this_week, -> { where(booked_date: Date.current.beginning_of_week..Date.current.end_of_week) }
  scope :this_month, -> { where(booked_date: Date.current.beginning_of_month..Date.current.end_of_month) }

  def cancel!
    transaction do
      update!(status: "cancelled", cancelled_at: Time.current)
    end
  end

  def complete!
    update!(status: "completed")
  end

  def confirmed?
    status == "confirmed"
  end

  def cancelled?
    status == "cancelled"
  end

  def formatted_date
    booked_date.strftime("%A, %B %-d, %Y")
  end

  def formatted_time_range
    "#{start_time.strftime('%l:%M %p').strip} - #{end_time.strftime('%l:%M %p').strip} PST"
  end

  def formatted_date_short
    booked_date.strftime("%B %-d")
  end

  def formatted_start_time
    start_time.strftime("%l:%M %p").strip
  end

  private

  def generate_confirmation_token
    self.confirmation_token ||= SecureRandom.urlsafe_base64(32)
  end

  def normalize_phone_number
    return unless phone_number.present?
    self.phone_number = phone_number.gsub(/[^\d+]/, "")
  end

  def slot_available
    return unless availability.present? && booked_date.present? && start_time.present?

    # Use UTC time string to match DB storage format
    time_str = start_time.utc.strftime("%H:%M")
    existing_count = Booking.where(
      availability: availability,
      booked_date: booked_date,
      status: "confirmed"
    ).where("to_char(start_time, 'HH24:MI') = ?", time_str).count

    if existing_count >= availability.max_bookings_per_slot
      errors.add(:base, "This time slot is no longer available")
    end
  end

  def not_in_past
    return unless booked_date.present? && start_time.present?

    booking_time = booked_date.in_time_zone.change(
      hour: start_time.hour,
      min: start_time.min
    )

    if booking_time < Time.current
      errors.add(:base, "Cannot book a time in the past")
    end
  end
end
