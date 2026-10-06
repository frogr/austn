require "test_helper"

class GpuHealthStatusTest < ActiveSupport::TestCase
  test "accepts a status row for every GPU tool" do
    Gpu::Backend::TOOLS.each_key do |tool|
      assert GpuHealthStatus.for_service(tool).persisted?, "#{tool} should have a health status"
    end
  end

  test "rejects unknown services" do
    assert_raises(ActiveRecord::RecordInvalid) { GpuHealthStatus.for_service("video") }
  end

  test "every GPU job reports to a tool that has a health status" do
    Rails.application.eager_load!
    app_jobs = GpuJob.descendants.select do |job|
      Object.const_source_location(job.name).first.start_with?(Rails.root.join("app/jobs").to_s)
    end

    assert_not_empty app_jobs
    app_jobs.each do |job|
      assert_includes GpuHealthStatus::SERVICES, job.gpu_service_name, "#{job.name} reports to an unknown service"
    end
  end

  test "marking online then offline keeps the last online time" do
    status = GpuHealthStatus.for_service("rembg")
    status.mark_online!
    online_at = status.last_online_at

    status.mark_offline!("Errno::ECONNREFUSED: 10.0.0.1:8188")

    assert_not status.online
    assert_equal online_at, status.last_online_at
    assert_not GpuHealthStatus.online?("rembg")
  end

  test "the public summary never includes the error message" do
    GpuHealthStatus.for_service("chat").mark_offline!("Failed to open TCP connection to 10.0.0.1:1234")

    summary = GpuHealthStatus.all_statuses

    assert_equal GpuHealthStatus::SERVICES.sort, summary.keys.sort
    assert_not_includes summary.to_json, "10.0.0.1"
  end
end
