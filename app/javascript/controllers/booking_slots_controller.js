import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  selectSlot(event) {
    const button = event.currentTarget
    const { availabilityId, startTime, endTime, date } = button.dataset.bookingSlotsParams
      ? JSON.parse(button.dataset.bookingSlotsParams)
      : {
          availabilityId: button.dataset.bookingSlotsAvailabilityIdParam,
          startTime: button.dataset.bookingSlotsStartTimeParam,
          endTime: button.dataset.bookingSlotsEndTimeParam,
          date: button.dataset.bookingSlotsDateParam
        }

    // Update hidden fields
    document.getElementById("booking_availability_id").value = availabilityId
    document.getElementById("booking_start_time").value = startTime
    document.getElementById("booking_end_time").value = endTime
    document.getElementById("booking_booked_date").value = date

    // Format display time
    const formatTime = (timeStr) => {
      const [h, m] = timeStr.split(":")
      const hour = parseInt(h)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
      return `${displayHour}:${m} ${ampm}`
    }

    document.getElementById("selected-slot-display").textContent =
      `Selected: ${formatTime(startTime)} – ${formatTime(endTime)}`

    // Show the booking form
    document.getElementById("booking-form").classList.remove("hidden")

    // Highlight selected slot
    this.element.querySelectorAll("button").forEach((btn) => {
      btn.style.borderColor = "var(--border-glass)"
      btn.style.background = "var(--bg-card)"
    })
    button.style.borderColor = "var(--accent-color)"
    button.style.background = "rgba(29, 185, 84, 0.1)"

    // Scroll to form
    document.getElementById("booking-form").scrollIntoView({ behavior: "smooth", block: "center" })
  }
}
