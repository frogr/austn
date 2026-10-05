module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :admin

    def connect
      self.admin = AdminSession.new(request.session).active?
    end
  end
end
