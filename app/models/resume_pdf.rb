require "prawn"

# The built-in Helvetica covers everything the resume uses (curly quotes, en
# dashes, bullets), so skip the warning about non-ASCII text.
Prawn::Fonts::AFM.hide_m17n_warning = true

# Renders the resume as a one-file PDF from the same data as /resume, so the
# page and the download can't drift apart.
class ResumePdf
  ACCENT = "1A7F45".freeze
  MUTED = "555555".freeze

  def initialize(resume, name: Profile.name)
    @resume = resume
    @name = name
  end

  def render
    Prawn::Document.new(page_size: "LETTER", margin: [ 40, 48, 40, 48 ], info: { Title: "#{@name} Resume", Author: @name }) do |pdf|
      pdf.font_size 9.5
      header(pdf)
      section(pdf, "Summary") { pdf.text @resume.summary, leading: 2 }
      section(pdf, "Experience") { @resume.experience.each { |job| job(pdf, job) } }
      section(pdf, "Projects") do
        @resume.projects.each do |project|
          pdf.text "<b>#{esc(project["name"])}</b> (#{esc(project["dates"])}) #{esc(project["text"])}", inline_format: true, leading: 2
          pdf.move_down 4
        end
      end
      section(pdf, "Skills") do
        @resume.skills.each do |skill|
          pdf.text "<b>#{esc(skill["label"])}:</b> #{esc(skill["text"])}", inline_format: true, leading: 2
        end
      end
    end.render
  end

  private

  def header(pdf)
    pdf.text @name, size: 20, style: :bold
    pdf.text @resume.title, size: 11, color: MUTED
    pdf.move_down 4
    contact = [ @resume.location, @resume.email, *@resume.links.map { |l| l["url"].delete_prefix("https://") } ]
    pdf.text contact.join("  ·  "), size: 9, color: MUTED
    pdf.move_down 8
  end

  def section(pdf, title)
    pdf.move_down 6
    pdf.text title.upcase, size: 9, style: :bold, color: ACCENT, character_spacing: 0.5
    pdf.stroke_color "DDDDDD"
    pdf.stroke_horizontal_rule
    pdf.move_down 6
    yield
  end

  def job(pdf, job)
    pdf.text "<b>#{esc(job["company"])}</b>  ·  #{esc(job["title"])}", inline_format: true, size: 10.5
    pdf.text "#{esc(job["dates"])}  ·  #{esc(job["location"])}", size: 8.5, color: MUTED
    pdf.text esc(job["note"]), size: 8.5, style: :italic, color: MUTED if job["note"]
    pdf.text esc(job["about"]), leading: 2 if job["about"]
    pdf.move_down 2
    job["bullets"].each do |bullet|
      line = bullet["lead"] ? "<b>#{esc(bullet["lead"])}</b> #{esc(bullet["text"])}" : esc(bullet["text"])
      pdf.indent(10) { pdf.text "•  #{line}", inline_format: true, leading: 2 }
      pdf.move_down 2
    end
    pdf.move_down 6
  end

  def esc(text)
    ERB::Util.html_escape(text.to_s)
  end
end
