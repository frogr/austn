# Pages that use the public site layout and highlight a section in the nav.
module SitePage
  extend ActiveSupport::Concern

  included do
    layout "site"
    helper_method :current_section
  end

  class_methods do
    def site_section(name)
      define_method(:current_section) { name }
    end
  end

  def current_section = nil
end
