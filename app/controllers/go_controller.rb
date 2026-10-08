# GET /go/:kind/*key counts a click on a link that leaves the site, then
# sends the visitor on. The links are named in Outbound; anything else is
# a 404, so this can't be used to redirect people elsewhere.
class GoController < ApplicationController
  def show
    url = Outbound.url_for(params[:kind], params[:key])
    raise ActiveRecord::RecordNotFound, "No outbound link #{params[:kind]}/#{params[:key]}" unless url

    record_visit_event("click", label: "#{params[:kind]}/#{params[:key]}", href: url)
    response.headers["X-Robots-Tag"] = "noindex"
    redirect_to url, allow_other_host: true
  end
end
