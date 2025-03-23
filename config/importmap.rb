# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "react", to: "https://ga.jspm.io/npm:react@19.0.0/index.js"
pin "react-dom", to: "https://ga.jspm.io/npm:react-dom@19.0.0/index.js"
pin "scheduler", to: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js"
# ThreeJS for movement demo
pin "movement_demo", to: "movement_demo.js", preload: true
pin "three", to: "https://ga.jspm.io/npm:three@0.158.0/build/three.module.js"
pin "three/addons/controls/PointerLockControls.js", to: "https://ga.jspm.io/npm:three@0.158.0/examples/jsm/controls/PointerLockControls.js"

pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/components", under: "components"
