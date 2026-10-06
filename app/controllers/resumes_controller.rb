class ResumesController < ApplicationController
  include SitePage
  site_section "resume"

  def show
    @resume = Resume.current

    respond_to do |format|
      format.html
      format.pdf do
        send_data ResumePdf.new(@resume).render,
                  filename: "Austin_French_Resume.pdf",
                  type: "application/pdf",
                  disposition: "inline"
      end
    end
  end
end
