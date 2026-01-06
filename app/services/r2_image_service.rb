require "aws-sdk-s3"
require "digest"

class R2ImageService
  class R2Error < StandardError; end

  SUPPORTED_EXTENSIONS = %w[.png .jpg .jpeg .gif .webp .svg .avif].freeze

  class << self
    def client
      @client ||= Aws::S3::Client.new(
        access_key_id: ENV["R2_ACCESS_KEY_ID"],
        secret_access_key: ENV["R2_SECRET_ACCESS_KEY"],
        endpoint: "https://#{ENV['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        region: "auto",
        ssl_verify_peer: !Rails.env.development?
      )
    end

    def bucket_name
      ENV["R2_BUCKET_NAME"] || "austnnet"
    end

    def public_url_base
      # Use custom domain if configured, otherwise use R2.dev public URL
      ENV["R2_PUBLIC_URL"] || "https://#{bucket_name}.#{ENV['R2_ACCOUNT_ID']}.r2.dev"
    end

    def configured?
      ENV["R2_ACCESS_KEY_ID"].present? &&
        ENV["R2_SECRET_ACCESS_KEY"].present? &&
        ENV["R2_ACCOUNT_ID"].present?
    end

    # Upload a file from local path and return the public URL
    def upload_file(local_path, remote_key = nil)
      raise R2Error, "R2 not configured" unless configured?
      raise R2Error, "File not found: #{local_path}" unless File.exist?(local_path)

      remote_key ||= generate_key(local_path)
      content_type = mime_type_for(local_path)

      File.open(local_path, "rb") do |file|
        client.put_object(
          bucket: bucket_name,
          key: remote_key,
          body: file,
          content_type: content_type
        )
      end

      Rails.logger.info "Uploaded #{local_path} to R2 as #{remote_key}"
      public_url_for(remote_key)
    rescue Aws::S3::Errors::ServiceError => e
      raise R2Error, "R2 upload failed: #{e.message}"
    end

    # Upload binary data directly
    def upload_data(data, filename, content_type: nil)
      raise R2Error, "R2 not configured" unless configured?

      remote_key = generate_key_from_data(data, filename)
      content_type ||= mime_type_for(filename)

      client.put_object(
        bucket: bucket_name,
        key: remote_key,
        body: data,
        content_type: content_type
      )

      Rails.logger.info "Uploaded data to R2 as #{remote_key}"
      public_url_for(remote_key)
    rescue Aws::S3::Errors::ServiceError => e
      raise R2Error, "R2 upload failed: #{e.message}"
    end

    # Check if a key already exists in R2
    def exists?(remote_key)
      client.head_object(bucket: bucket_name, key: remote_key)
      true
    rescue Aws::S3::Errors::NotFound
      false
    end

    def public_url_for(remote_key)
      "#{public_url_base}/#{remote_key}"
    end

    private

    def generate_key(file_path)
      # Generate a unique key based on file content hash + original filename
      content_hash = Digest::MD5.file(file_path).hexdigest[0..7]
      extension = File.extname(file_path).downcase
      basename = File.basename(file_path, extension).parameterize

      "blog/#{content_hash}-#{basename}#{extension}"
    end

    def generate_key_from_data(data, filename)
      content_hash = Digest::MD5.hexdigest(data)[0..7]
      extension = File.extname(filename).downcase
      basename = File.basename(filename, extension).parameterize

      "blog/#{content_hash}-#{basename}#{extension}"
    end

    def mime_type_for(filename)
      case File.extname(filename).downcase
      when ".png" then "image/png"
      when ".jpg", ".jpeg" then "image/jpeg"
      when ".gif" then "image/gif"
      when ".webp" then "image/webp"
      when ".svg" then "image/svg+xml"
      when ".avif" then "image/avif"
      else "application/octet-stream"
      end
    end
  end
end
