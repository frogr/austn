---
title: TinyRails
summary: A small Rails-like framework on Rack, built to see what Rails is actually doing on every request.
tier: featured
order: 6
when: "2025"
role: Solo project
stack: [Ruby, Rack, ERB]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/tinyrails
  - label: best_tweets, the app that runs on it
    url: https://github.com/frogr/best_tweets
  - label: Why I built it
    url: /blog/why-rebuild-rails
---

I've written Rails for years. I wanted to know what it does under the hood, so I worked through Noah Gibbs' *Rebuilding Rails* and built my own small version. It's one of the projects I'm proudest of.

TinyRails does the core of what a web framework does:

- **Rack integration**, so it runs on any Ruby web server
- **Routing** by convention: `/tweets/show` goes to `TweetsController#show`
- **Controllers** that render ERB views from `app/views/{controller}/{action}.html.erb`
- **A model layer** that stores records as JSON files, with `find` and `all`
- **Helpful errors**: a typo in a controller name tells you what it looked for

To make sure it worked for real, I built a small app on top of it: [best_tweets](https://github.com/frogr/best_tweets).

## The whole request, in one method

This is the entry point, trimmed a little. Rack calls it with the request, it finds a controller and an action, runs it, and hands back status, headers and body:

```ruby
module Tinyrails
  class Application
    def call(env)
      return [404, { "content-type" => "text/html" }, []] if env["PATH_INFO"] == "/favicon.ico"

      klass, id, act = get_controller_and_action(env)
      env["route.id"] = id if id

      controller = klass.new(env)
      controller.send(act)
      response = controller.get_response

      unless response
        controller.render(act)
        response = controller.get_response
      end

      [response.status, response.headers, response.body]
    rescue NameError => e
      no_controller_error(e)
    rescue NoMethodError => e
      no_action_error(e)
    end
  end
end
```

## Finding classes by name

Rails finds `TweetsController` without a `require`. TinyRails does it the way the book does: when Ruby can't find a constant, it turns the name into a file name and tries to load it.

```ruby
class Object
  def self.const_missing(c)
    begin
      require Tinyrails.to_underscore(c.to_s)
    rescue LoadError => e
      raise NameError, "#{c} was not found. Did you spell it correctly? Additional info: #{e}"
    end

    raise NameError, "Found #{Tinyrails.to_underscore(c.to_s)}.rb, but #{c} was not defined" unless const_defined?(c)

    const_get(c)
  end
end
```

Modern Rails uses Zeitwerk for this instead, which maps file names to constants up front.
