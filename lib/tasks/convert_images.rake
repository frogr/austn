namespace :images do
  desc "Convert game textures to WebP format for better performance"
  task convert_to_webp: :environment do
    require 'fileutils'
    
    # Check if cwebp command is available
    unless system("which cwebp > /dev/null 2>&1")
      puts "Error: cwebp utility not found. Please install it first:"
      puts "  macOS: brew install webp"
      puts "  Ubuntu/Debian: sudo apt-get install webp"
      puts "  Windows: Download from https://developers.google.com/speed/webp/download"
      exit 1
    end
    
    # Define directories to process
    dirs_to_process = [
      Rails.root.join('public', 'assets', 'textures')
    ]
    
    total_converted = 0
    total_savings = 0
    
    dirs_to_process.each do |dir|
      next unless Dir.exist?(dir)
      
      # Get all image files recursively
      images = Dir.glob("#{dir}/**/*.{jpg,jpeg,png}")
      
      images.each do |image_path|
        original_size = File.size(image_path)
        output_path = "#{image_path.chomp(File.extname(image_path))}.webp"
        
        # Skip if WebP version already exists and is newer
        if File.exist?(output_path) && File.mtime(output_path) >= File.mtime(image_path)
          puts "Skipping #{image_path} (WebP already exists and is up-to-date)"
          next
        end
        
        # Determine quality based on file type
        quality = image_path.end_with?('.png') ? 90 : 85
        
        # Convert image to WebP
        success = system("cwebp -q #{quality} \"#{image_path}\" -o \"#{output_path}\"")
        
        if success
          webp_size = File.size(output_path)
          savings = ((original_size - webp_size) / original_size.to_f * 100).round(2)
          total_savings += original_size - webp_size
          
          puts "Converted #{image_path} to WebP, saved #{savings}% (#{original_size} → #{webp_size} bytes)"
          total_converted += 1
        else
          puts "Failed to convert #{image_path}"
        end
      end
    end
    
    if total_converted > 0
      total_savings_mb = (total_savings / 1024.0 / 1024.0).round(2)
      puts "\nConverted #{total_converted} images, total savings: #{total_savings_mb} MB"
    else
      puts "\nNo images were converted."
    end
  end
  
  desc "Resize and optimize all images"
  task optimize: :environment do
    require 'fileutils'
    
    # Check for required tools
    %w(convert identify).each do |cmd|
      unless system("which #{cmd} > /dev/null 2>&1")
        puts "Error: #{cmd} command not found. Please install ImageMagick:"
        puts "  macOS: brew install imagemagick"
        puts "  Ubuntu/Debian: sudo apt-get install imagemagick"
        exit 1
      end
    end
    
    # Define size limits for different image types
    MAX_GAME_TEXTURE_SIZE = 1024  # Maximum texture dimension for game
    MAX_THUMBNAIL_SIZE = 480      # Maximum thumbnail dimension
    MAX_PROFILE_PIC_SIZE = 256    # Maximum profile picture dimension
    
    # Define directories to process
    dirs_to_process = [
      Rails.root.join('public', 'assets', 'textures')
    ]
    
    total_processed = 0
    total_savings = 0
    
    dirs_to_process.each do |dir|
      next unless Dir.exist?(dir)
      
      # Get all image files recursively
      images = Dir.glob("#{dir}/**/*.{jpg,jpeg,png}")
      
      images.each do |image_path|
        original_size = File.size(image_path)
        
        # Skip small files (less than 10KB)
        next if original_size < 10 * 1024
        
        # Get image dimensions
        dimensions = `identify -format "%wx%h" "#{image_path}"`.strip.split('x').map(&:to_i)
        width, height = dimensions
        
        # Determine max size based on image type/location
        max_size = MAX_GAME_TEXTURE_SIZE
        
        # Calculate new dimensions (only if image is larger than max size)
        if width > max_size || height > max_size
          if width > height
            new_width = max_size
            new_height = (height.to_f / width * max_size).to_i
          else
            new_height = max_size
            new_width = (width.to_f / height * max_size).to_i
          end
          
          # Create a temporary file path
          temp_path = "#{image_path}.tmp"
          
          # Resize and optimize the image
          success = system("convert \"#{image_path}\" -resize #{new_width}x#{new_height} -strip -quality 85 \"#{temp_path}\"")
          
          if success
            # Replace the original with the optimized version
            FileUtils.mv(temp_path, image_path)
            
            new_size = File.size(image_path)
            savings = ((original_size - new_size) / original_size.to_f * 100).round(2)
            total_savings += original_size - new_size
            
            puts "Resized #{image_path} from #{width}x#{height} to #{new_width}x#{new_height}, saved #{savings}% (#{original_size} → #{new_size} bytes)"
            total_processed += 1
          else
            puts "Failed to optimize #{image_path}"
            FileUtils.rm(temp_path) if File.exist?(temp_path)
          end
        end
      end
    end
    
    if total_processed > 0
      total_savings_mb = (total_savings / 1024.0 / 1024.0).round(2)
      puts "\nOptimized #{total_processed} images, total savings: #{total_savings_mb} MB"
    else
      puts "\nNo images were optimized."
    end
  end
end