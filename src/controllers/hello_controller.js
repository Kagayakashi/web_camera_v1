import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["name", "welcome"]

    get name() {
        return this.nameTarget.value
    }
    
    connect() {
        console.log("This is view controller container:", this.element)
    }

    greet() {
        this.welcomeTarget.textContent = `Hello, ${this.name}!`
    }
}
