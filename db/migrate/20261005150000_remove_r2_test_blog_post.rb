# "This Is A Test For R2" was a test post that got published. Its markdown file
# is gone, but the importer only upserts, so the row has to be removed here.
class RemoveR2TestBlogPost < ActiveRecord::Migration[8.0]
  def up
    execute "DELETE FROM blog_posts WHERE slug = 'this-is-a-test-for-r2'"
  end

  def down
    # Nothing to restore.
  end
end
