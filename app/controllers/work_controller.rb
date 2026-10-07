class WorkController < ApplicationController
  include SitePage
  site_section "work"

  def index
    @jobs = WorkItem.of_kind("job")
    # Drawn projects first, then ones with a screenshot, then the rest.
    @projects = WorkItem.of_kind("project").sort_by.with_index { |item, i| [ item.art? ? 0 : (item.screenshot ? 1 : 2), i ] }
    @fun = WorkItem.of_kind("fun")
  end

  def show
    items = WorkItem.all
    index = items.index { |item| item.slug == params[:slug] } || raise(ActiveRecord::RecordNotFound)
    @item = items[index]
    @previous_item = items[index - 1] if index.positive?
    @next_item = items[index + 1]
  end

  # /projects/:id from the old site. Send it to the matching case study, or to /work.
  def legacy
    item = WorkItem.for_legacy_id(params[:id])
    redirect_to(item ? work_item_path(item) : work_index_path, status: :moved_permanently)
  end
end
