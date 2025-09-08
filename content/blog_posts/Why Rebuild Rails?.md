_In memory of Noah Gibbs, whose "Rebuilding Rails" book continues to inspire developers to dig deeper._
## The Problem with Being a "Rails Developer"

I've been writing Rails apps for six years. I can build features fast, debug production issues, and design decent APIs. But here's the thing: I've been using Rails like most people use their cars. I know how to drive it, I can change the oil, maybe even replace the brakes. But if you asked me to build an engine from scratch? No clue.

That's a problem when you're gunning for senior roles. Companies don't want another person who can drive the car. They want someone who understands why the engine works the way it does, what tradeoffs went into its design, and how to fix it when it breaks in weird ways.

So I decided to build my own Rails. Not to replace it, but to actually understand it.

## What "Rebuilding Rails" Actually Means

I'm working through Noah Gibbs's "Rebuilding Rails" book and building two things:

1. [TinyRails](https://github.com/frogr/tinyrails) - my own web framework
2. [Best Tweets](https://github.com/frogr/best_tweets) - a real app that uses my framework

## Day 2: Controllers Aren't Magic, They're Just Methods

Building the controller dispatch system was where things clicked. Here's the entire heart of Rails:

```ruby
def call(env)
  controller, action = get_controller_and_action(env)
  controller.new(env).send(action)
  [200, {'content-type' => 'text/html'}, [response]]
end
```

That's it. Parse the URL, find a class, call a method, return HTML. Everything else (parameters, sessions, cookies, authentication) is just layers on top of this simple idea.

Some fun discoveries:

- Why browsers always request `/favicon.ico` (and why you need to handle it)
- Why redirects should use 302 instead of 301 (browser caching is forever)
- How Rails magically finds your controllers (spoiler: `$LOAD_PATH` manipulation)
- Why good error messages matter (specific handling for NameError vs NoMethodError)
## The Real Value: Understanding the Stack

When something breaks in production now, I don't have to guess. I know exactly what's happening:

1. Puma receives the HTTP request
2. Rack converts it to an env hash
3. Rails router figures out which controller/action to call
4. Controller processes and returns a response
5. Rack converts it back to HTTP

Each step is just Ruby code. No magic.
## The Uncomfortable Truth About Learning

It took me two hours to implement basic routing and controllers. Two hours for something Rails gives you instantly. At first, I felt slow and stupid.

But I wasn't just copying code. I was:

- Understanding architectural decisions
- Debugging Rack integration issues
- Figuring out error handling strategies
- Making my own design choices

That's not slow. That's learning. Real learning is uncomfortable and time-consuming. But it's also the only way to go from "I can use this" to "I understand this."
## What's Next

I'm planning to add:

- Real routing (not just string splitting)
- Database integration (mini Active Record)
- View templates with ERB
- Middleware stack for sessions
- Parameter parsing

Each feature teaches me more about Rails' design decisions and tradeoffs.
## The Bottom Line

Rails is just code. It's very clever code written by very smart people, but it's still just code. Once you build your own version, even a tiny one, you stop seeing magic and start seeing patterns.

And once you see the patterns, you can debug anything, optimize anything, and build anything.

That's the difference between a Rails user and a Rails developer. And that's why I'm rebuilding Rails.