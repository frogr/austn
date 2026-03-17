require "test_helper"

class Harness::Diff::ParserTest < ActiveSupport::TestCase
  SAMPLE_DIFF = <<~DIFF
    diff --git a/app/models/user.rb b/app/models/user.rb
    index abc1234..def5678 100644
    --- a/app/models/user.rb
    +++ b/app/models/user.rb
    @@ -1,5 +1,6 @@
     class User < ApplicationRecord
    +  validates :email, presence: true
       has_many :posts

       def full_name
    @@ -10,3 +11,7 @@
       end
    +
    +  def admin?
    +    role == "admin"
    +  end
     end
    diff --git a/app/controllers/users_controller.rb b/app/controllers/users_controller.rb
    new file mode 100644
    --- /dev/null
    +++ b/app/controllers/users_controller.rb
    @@ -0,0 +1,5 @@
    +class UsersController < ApplicationController
    +  def index
    +    @users = User.all
    +  end
    +end
  DIFF

  setup do
    @parser = Harness::Diff::Parser.new
  end

  test "parses multiple files from unified diff" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal 2, result.length
  end

  test "extracts filenames correctly" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal "app/models/user.rb", result[0].filename
    assert_equal "app/controllers/users_controller.rb", result[1].filename
  end

  test "detects modified file status" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal :modified, result[0].status
  end

  test "detects new file status" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal :added, result[1].status
  end

  test "parses hunks from file changes" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal 2, result[0].hunks.length
    assert_equal 1, result[1].hunks.length
  end

  test "detects language from file extension" do
    result = @parser.call(SAMPLE_DIFF)
    assert_equal "ruby", result[0].language
    assert_equal "ruby", result[1].language
  end

  test "hunk tracks additions and deletions" do
    result = @parser.call(SAMPLE_DIFF)
    hunk = result[0].hunks[0]
    assert_equal 1, hunk.additions.length
    assert_equal 0, hunk.deletions.length
  end

  test "hunk parses header line numbers" do
    result = @parser.call(SAMPLE_DIFF)
    hunk = result[0].hunks[0]
    assert_equal 1, hunk.old_start
    assert_equal 1, hunk.new_start
  end

  test "patch_text reconstructs the diff" do
    result = @parser.call(SAMPLE_DIFF)
    patch = result[0].patch_text
    assert_includes patch, "validates :email"
    assert_includes patch, "def admin?"
  end
end
