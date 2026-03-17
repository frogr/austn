module Harness
  module Diff
    class Fetcher
      GITHUB_PR_PATTERN = %r{github\.com/([^/]+)/([^/]+)/pull/(\d+)}

      def call(pr_url)
        owner, repo, number = parse_url(pr_url)
        fetch_diff(owner, repo, number)
      end

      private

      def parse_url(url)
        match = url.match(GITHUB_PR_PATTERN)
        raise Harness::Error, "Invalid GitHub PR URL: #{url}" unless match
        [ match[1], match[2], match[3] ]
      end

      def fetch_diff(owner, repo, number)
        uri = URI("https://api.github.com/repos/#{owner}/#{repo}/pulls/#{number}")
        request = Net::HTTP::Get.new(uri)
        request["Accept"] = "application/vnd.github.v3.diff"
        request["User-Agent"] = "Harness-CodeReview"

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(request)
        end

        raise Harness::Error, "GitHub API error: #{response.code}" unless response.code == "200"
        response.body
      end
    end
  end
end
