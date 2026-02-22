class VideoRedisService < BaseRedisService
  DEFAULT_TTL = 1800 # 30 minutes for video (larger files, longer to download)

  # Store video output reference (not the video itself, just ComfyUI file info)
  def store_video(generation_id, video_data, ttl: DEFAULT_TTL)
    store_result(generation_id, video_data, ttl: ttl)
  end

  def get_video(generation_id)
    get_result(generation_id)
  end

  def video_exists?(generation_id)
    result_exists?(generation_id)
  end

  protected

  def key_prefix
    "video"
  end
end
