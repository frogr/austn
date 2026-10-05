// Register Stimulus controllers. New controllers must be imported and registered here.
import { application } from "./application"
import BookingNotificationsController from "./booking_notifications_controller"
import AvailabilityCalendarController from "./availability_calendar_controller"
import InvoiceFormController from "./invoice_form_controller"
import PitchDetectorController from "./pitch_detector_controller"

application.register("booking-notifications", BookingNotificationsController)
application.register("availability-calendar", AvailabilityCalendarController)
application.register("invoice-form", InvoiceFormController)
application.register("pitch-detector", PitchDetectorController)