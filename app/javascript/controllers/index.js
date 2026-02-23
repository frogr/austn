// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application"
import HelloController from "./hello_controller"
import BookingSlotsController from "./booking_slots_controller"
import BookingCalendarController from "./booking_calendar_controller"
import BookingNotificationsController from "./booking_notifications_controller"
import AvailabilityCalendarController from "./availability_calendar_controller"
import PitchDetectorController from "./pitch_detector_controller"

application.register("hello", HelloController)
application.register("booking-slots", BookingSlotsController)
application.register("booking-calendar", BookingCalendarController)
application.register("booking-notifications", BookingNotificationsController)
application.register("availability-calendar", AvailabilityCalendarController)
application.register("pitch-detector", PitchDetectorController)
