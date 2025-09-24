require 'sidekiq/web'

Rails.application.routes.draw do
  # Sidekiq Web UI (consider adding authentication in production)
  mount Sidekiq::Web => '/sidekiq'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Blog routes
  get "/blog", to: "blog#index"
  get "/blog/:slug", to: "blog#show", as: :blog_post
  get "/blog/:slug/content", to: "blog#content", as: :blog_post_content

  # Portfolio routes - Simplified structure
  get "/projects", to: "portfolio#projects"
  get "/projects/:id", to: "portfolio#project_detail", as: :project_detail
  get "/tech-setup", to: "portfolio#tech_setup"
  # Simple pages for Engage links
  get "/fun-links", to: "portfolio#fun_links"
  get "/reading", to: "portfolio#reading"
  get "/resources", to: "portfolio#resources"

  # Legacy routes - redirect to new structure
  get "/work", to: redirect("/")
  get "/contact", to: redirect("/#contact")
  get "/fun", to: redirect("/fun-links")
  get "/games", to: redirect("/projects")

  # Movement demo
  get "/movement-demo", to: "movement_demo#index"

  # Chat interface for LMStudio integration
  get "/chat", to: "chat#index"
  post "/chat/stream", to: "chat#stream"  # Legacy endpoint, now async
  post "/chat/async", to: "chat#async_complete"
  get "/chat/job/:id", to: "chat#job_status", as: :chat_job_status

  # Dashboard for development/testing
  get "/dashboard", to: "dashboard#hello", as: :dashboard
  post "turbo_message", to: "dashboard#turbo_message", as: :turbo_message

  # Images gallery
  resources :images do
    collection do
      get 'ai_generate'
      post 'generate'
    end
    member do
      get 'ai_show'
      get 'ai_image'
      get 'ai_data'
      get 'ai_status'
    end
  end

  # Portfolio as root
  root "portfolio#index"
end
