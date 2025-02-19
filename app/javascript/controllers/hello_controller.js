import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    console.log("Connected!")
    this.element.textContent = "Controller connected!"
  }
}