module TtsHelper
  def voice_name_for(voice_preset, voices)
    return "Default" if voice_preset.blank?

    voice = voices&.find { |v| v["id"] == voice_preset }
    voice ? voice["name"] : voice_preset.titleize
  end
end
