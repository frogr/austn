require "test_helper"

# This test ensures every file under app/lib/harness/ defines the constant
# that Zeitwerk expects based on its file path. If this test fails, the app
# will crash on boot in production (eager_load).
class ZeitwerkComplianceTest < ActiveSupport::TestCase
  AUTOLOAD_ROOT = Rails.root.join("app/lib")

  # Acronyms that Zeitwerk should inflect (must match config/initializers/inflections.rb)
  ACRONYMS = %w[LLM].freeze

  test "all harness files define the expected constant" do
    harness_files = Dir[AUTOLOAD_ROOT.join("harness/**/*.rb")]
    root_file = AUTOLOAD_ROOT.join("harness.rb")

    # The root file defines the Harness module
    assert File.exist?(root_file), "app/lib/harness.rb must exist as the Zeitwerk root"

    harness_files.each do |file_path|
      relative = file_path.delete_prefix("#{AUTOLOAD_ROOT}/").delete_suffix(".rb")
      expected_constant = path_to_constant(relative)

      assert Object.const_defined?(expected_constant),
        "Expected #{file_path} to define #{expected_constant} but it was not found. " \
        "This will cause a Zeitwerk eager load error in production."
    end
  end

  test "no file named after its parent directory exists (Zeitwerk anti-pattern)" do
    # e.g. harness/harness.rb would be interpreted as Harness::Harness
    Dir[AUTOLOAD_ROOT.join("**/*.rb")].each do |file_path|
      dir = File.dirname(file_path)
      filename = File.basename(file_path, ".rb")
      parent_dir = File.basename(dir)

      next if dir == AUTOLOAD_ROOT.to_s # root-level files are fine

      assert_not_equal parent_dir, filename,
        "#{file_path} has the same name as its parent directory. " \
        "Zeitwerk will expect #{camelize(filename)} inside the #{camelize(parent_dir)} namespace, " \
        "causing 'uninitialized constant' errors. Move the module definition to the parent level."
    end
  end

  private

  def path_to_constant(relative_path)
    relative_path.split("/").map { |part| camelize(part) }.join("::")
  end

  def camelize(str)
    result = str.split("_").map(&:capitalize).join
    ACRONYMS.each do |acronym|
      result.gsub!(/#{acronym}/i, acronym)
    end
    result
  end
end
