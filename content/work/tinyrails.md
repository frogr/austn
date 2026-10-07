---
title: TinyRails
summary: A small Rails-like framework on Rack, built to see what Rails is actually doing on every request.
tagline: "Rails, rebuilt small, to see what it's really doing."
tier: featured
kind: project
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

<figure class="figure">
  <div class="diagram" role="img" aria-label="A request goes from the browser to Rack, to Application#call, which finds the controller and action, runs TweetsController#show, renders the ERB view, and returns status, headers and body">
    <svg viewBox="0 0 680 118" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="tr-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6c756f"/></marker></defs>
      <rect class="box" x="0" y="14" width="120" height="48" rx="6"/><text x="60" y="36" text-anchor="middle">Browser</text><text class="label" x="60" y="52" text-anchor="middle">/tweets/show</text>
      <path class="edge" d="M120 38 H138" marker-end="url(#tr-arrow)"/>
      <rect class="box" x="140" y="14" width="120" height="48" rx="6"/><text x="200" y="36" text-anchor="middle">Rack</text><text class="label" x="200" y="52" text-anchor="middle">calls the app</text>
      <path class="edge" d="M260 38 H278" marker-end="url(#tr-arrow)"/>
      <rect class="box box--accent" x="280" y="14" width="120" height="48" rx="6"/><text x="340" y="36" text-anchor="middle">Application#call</text><text class="label" x="340" y="52" text-anchor="middle">finds controller</text>
      <path class="edge" d="M400 38 H418" marker-end="url(#tr-arrow)"/>
      <rect class="box" x="420" y="14" width="120" height="48" rx="6"/><text x="480" y="36" text-anchor="middle">TweetsController</text><text class="label" x="480" y="52" text-anchor="middle">#show</text>
      <path class="edge" d="M540 38 H558" marker-end="url(#tr-arrow)"/>
      <rect class="box" x="560" y="14" width="120" height="48" rx="6"/><text x="620" y="36" text-anchor="middle">ERB view</text><text class="label" x="620" y="52" text-anchor="middle">show.html.erb</text>
      <path class="edge" d="M620 62 V96 H62 V64" marker-end="url(#tr-arrow)"/><text class="label" x="340" y="112" text-anchor="middle">[status, headers, body]</text>
    </svg>
  </div>
  <figcaption>One request through TinyRails. The method below is the box in the middle.</figcaption>
</figure>

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
