import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  connect() {
    this.consumer = createConsumer()
    this.subscription = this.consumer.subscriptions.create("BookingNotificationsChannel", {
      received: (data) => this.handleNotification(data)
    })
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.consumer) {
      this.consumer.disconnect()
    }
  }

  handleNotification(data) {
    const container = document.getElementById("booking-toast-container")
    if (!container) return

    const toast = document.createElement("div")
    toast.style.cssText = `
      padding: 16px 20px;
      border-radius: 12px;
      background: rgba(30, 30, 30, 0.95);
      border: 1px solid rgba(29, 185, 84, 0.3);
      backdrop-filter: blur(20px);
      color: white;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: fadeInUp 300ms ease-out;
      cursor: pointer;
    `

    if (data.type === "new_booking") {
      toast.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px; color: #1DB954;">New Booking!</div>
        <div>${data.booking.first_name} booked ${data.booking.date} at ${data.booking.time}</div>
      `
    } else if (data.type === "cancellation") {
      toast.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px; color: #FF3B30;">Booking Cancelled</div>
        <div>${data.booking.first_name} cancelled ${data.booking.date} at ${data.booking.time}</div>
      `
    }

    toast.addEventListener("click", () => {
      if (data.booking && data.booking.id) {
        window.location.href = `/admin/bookings/${data.booking.id}`
      }
    })

    container.appendChild(toast)

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      toast.style.animation = "fadeIn 300ms ease-out reverse"
      toast.style.opacity = "0"
      setTimeout(() => toast.remove(), 300)
    }, 10000)
  }
}
