import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dateCell", "datesInput", "startTime", "endTime", "submitBtn", "selectionCount", "customTimeFields", "customStart", "customEnd"]
  static values = { existingDates: Array }

  connect() {
    this.selectedDates = new Set()
    this.activePreset = null
    this.updateUI()
  }

  toggleDate(event) {
    const cell = event.currentTarget
    const date = cell.dataset.date
    if (cell.dataset.past === "true") return

    if (this.selectedDates.has(date)) {
      this.selectedDates.delete(date)
      cell.dataset.selected = "false"
    } else {
      this.selectedDates.add(date)
      cell.dataset.selected = "true"
    }
    this.updateUI()
  }

  selectPreset(event) {
    const btn = event.currentTarget
    const preset = btn.dataset.preset

    this.element.querySelectorAll("[data-preset]").forEach(b => {
      b.dataset.active = "false"
    })
    btn.dataset.active = "true"
    this.activePreset = preset

    if (preset === "custom") {
      this.customTimeFieldsTarget.classList.remove("hidden")
      this.syncCustomTime()
      return
    }

    this.customTimeFieldsTarget.classList.add("hidden")

    const presets = {
      morning:   { start: "09:00", end: "12:00" },
      afternoon: { start: "13:00", end: "17:00" },
      fullday:   { start: "09:00", end: "17:00" },
      evening:   { start: "17:00", end: "20:00" }
    }

    const times = presets[preset]
    if (times) {
      this.startTimeTarget.value = times.start
      this.endTimeTarget.value = times.end
    }
    this.updateUI()
  }

  syncCustomTime() {
    this.startTimeTarget.value = this.customStartTarget.value
    this.endTimeTarget.value = this.customEndTarget.value
    this.updateUI()
  }

  clearSelection() {
    this.selectedDates.clear()
    this.dateCellTargets.forEach(cell => {
      cell.dataset.selected = "false"
    })
    this.updateUI()
  }

  updateUI() {
    const count = this.selectedDates.size
    const hasTime = this.startTimeTarget.value && this.endTimeTarget.value

    if (count === 0) {
      this.selectionCountTarget.textContent = "Click dates on the calendar"
    } else {
      this.selectionCountTarget.textContent = `${count} date${count !== 1 ? "s" : ""} selected`
    }

    this.datesInputTarget.value = JSON.stringify([...this.selectedDates].sort())

    const submitBtn = this.submitBtnTarget
    const enabled = count > 0 && hasTime
    submitBtn.disabled = !enabled
    submitBtn.style.opacity = enabled ? "1" : "0.4"
    submitBtn.style.cursor = enabled ? "pointer" : "not-allowed"
  }
}
