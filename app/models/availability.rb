class Availability < ApplicationRecord
  has_many :bookings, dependent: :restrict_with_error

  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :slot_duration_minutes, presence: true,
    inclusion: { in: [ 15, 30, 45, 60 ], message: "must be 15, 30, 45, or 60" }
  validates :max_bookings_per_slot, presence: true,
    numericality: { greater_than: 0 }
  validate :end_time_after_start_time
  validate :date_not_in_past, on: :create

  scope :active, -> { where(is_active: true) }
  scope :for_date, ->(date) { where(date: date) }
  scope :upcoming, -> { where("date >= ?", Date.current) }
  scope :with_available_slots, -> {
    active.upcoming.order(:date, :start_time)
  }

  def time_slots
    slots = []
    current = start_time_as_minutes
    end_min = end_time_as_minutes

    while current + slot_duration_minutes <= end_min
      slot_start = minutes_to_time(current)
      slot_end = minutes_to_time(current + slot_duration_minutes)
      slots << { start_time: slot_start, end_time: slot_end }
      current += slot_duration_minutes
    end

    slots
  end

  def available_slots_for_date(target_date = date)
    all_slots = time_slots
    # DB stores times in UTC. Compare using UTC-converted strings.
    booked_counts = bookings
      .where(booked_date: target_date, status: "confirmed")
      .group("to_char(start_time, 'HH24:MI')")
      .count

    all_slots.select do |slot|
      # Convert slot time to UTC string to match DB format
      key = slot[:start_time].utc.strftime("%H:%M")
      count = booked_counts[key] || 0
      count < max_bookings_per_slot
    end
  end

  def has_bookings?
    bookings.where(status: "confirmed").exists?
  end

  private

  def end_time_after_start_time
    return unless start_time.present? && end_time.present?

    if end_time_as_minutes <= start_time_as_minutes
      errors.add(:end_time, "must be after start time")
    end
  end

  def date_not_in_past
    return unless date.present?

    if date < Date.current
      errors.add(:date, "cannot be in the past")
    end
  end

  def start_time_as_minutes
    start_time.hour * 60 + start_time.min
  end

  def end_time_as_minutes
    end_time.hour * 60 + end_time.min
  end

  def minutes_to_time(minutes)
    Time.zone.parse("#{minutes / 60}:#{format('%02d', minutes % 60)}")
  end
end
