# The links that leave the site, each with a short name, so a click on one
# can be counted on the way out (see GoController) without any JavaScript.
# A link is only ever a URL already in the content: there is no way to
# redirect somewhere the site doesn't link to itself.
#
#   demo/<work slug>              the project's Try it live button
#   link/<work slug>/<label>      one of the case study's links, by its label
#   profile/<name>                github, linkedin (content/profile.yml)
#   resume/<label>                a link from the resume page, by its label
#   course/<course slug>/starter  the course's free starter repo
#   course/<course slug>/buy      the course's checkout page
module Outbound
  def self.url_for(kind, key)
    parts = key.to_s.split("/")
    case kind
    when "demo" then WorkItem.find(parts[0]).demo_url if parts.one?
    when "link" then WorkItem.find(parts[0]).links.find { |link| link["label"].parameterize == parts[1] }&.dig("url") if parts.size == 2
    when "profile" then Profile.links[parts[0]] if parts.one?
    when "resume" then Resume.current.links.find { |link| link["label"].parameterize == parts[0] }&.dig("url") if parts.one?
    when "course" then course_url(parts) if parts.size == 2
    end
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def self.course_url(parts)
    course = Course.find(parts[0])
    case parts[1]
    when "starter" then course.starter_url
    when "buy" then course.buy_url
    end
  end
  private_class_method :course_url
end
