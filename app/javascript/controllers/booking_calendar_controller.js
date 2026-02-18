import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { availableDates: Array }

  connect() {
    // Calendar is server-rendered, this controller is a hook for future enhancements
  }
}
