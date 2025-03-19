// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application"
import HelloController from "./hello_controller"
import ArenaShooterController from "./arena_shooter_controller"

application.register("hello", HelloController)
application.register("arena-shooter", ArenaShooterController)
