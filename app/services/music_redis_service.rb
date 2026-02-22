class MusicRedisService < BaseRedisService
  DEFAULT_TTL = 900 # 15 minutes for music

  # Store music output reference (not the audio itself, just ComfyUI file info)
  def store_music(generation_id, music_data, ttl: DEFAULT_TTL)
    store_result(generation_id, music_data, ttl: ttl)
  end

  def get_music(generation_id)
    get_result(generation_id)
  end

  def music_exists?(generation_id)
    result_exists?(generation_id)
  end

  protected

  def key_prefix
    "music"
  end
end
