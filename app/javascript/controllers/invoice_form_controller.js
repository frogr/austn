import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["lineItems", "lineItem", "template", "quantity", "unitPrice", "lineTotal", "subtotal", "taxRate", "taxAmount", "total", "destroyField"]

  connect() {
    this.nextIndex = this.lineItemTargets.length
    this.calculateTotals()
  }

  addLineItem(event) {
    event.preventDefault()
    const template = this.templateTarget.innerHTML
    const html = template.replace(/NEW_IDX/g, this.nextIndex++)
    this.lineItemsTarget.insertAdjacentHTML("beforeend", html)
    this.calculateTotals()
  }

  removeLineItem(event) {
    event.preventDefault()
    const row = event.target.closest("[data-invoice-form-target='lineItem']")
    if (!row) return

    const destroyField = row.querySelector("[data-invoice-form-target='destroyField']")
    if (destroyField) {
      destroyField.value = "true"
      row.style.display = "none"
    } else {
      row.remove()
    }
    this.calculateTotals()
  }

  calculateTotals() {
    let subtotal = 0

    this.lineItemTargets.forEach((row) => {
      if (row.style.display === "none") return

      const qty = parseFloat(row.querySelector("[data-invoice-form-target='quantity']")?.value) || 0
      const price = parseInt(row.querySelector("[data-invoice-form-target='unitPrice']")?.value) || 0
      const lineTotal = Math.round(qty * price)
      subtotal += lineTotal

      const totalEl = row.querySelector("[data-invoice-form-target='lineTotal']")
      if (totalEl) totalEl.textContent = this.formatMoney(lineTotal)
    })

    const taxRate = parseFloat(this.taxRateTarget?.value) || 0
    const tax = Math.round(subtotal * taxRate / 100)
    const total = subtotal + tax

    if (this.hasSubtotalTarget) this.subtotalTarget.textContent = this.formatMoney(subtotal)
    if (this.hasTaxAmountTarget) this.taxAmountTarget.textContent = this.formatMoney(tax)
    if (this.hasTotalTarget) this.totalTarget.textContent = this.formatMoney(total)
  }

  formatMoney(cents) {
    const dollars = (cents / 100).toFixed(2)
    const parts = dollars.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return "$" + parts.join(".")
  }
}
