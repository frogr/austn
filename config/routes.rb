Rails.application.routes.draw do
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
  get "/games/arena-shooter", to: "portfolio#arena_shooter"
  get "/tech-setup", to: "portfolio#tech_setup"

  # Legacy routes - redirect to new structure
  get "/work", to: redirect("/")
  get "/contact", to: redirect("/#contact")
  get "/fun", to: redirect("/projects")
  get "/games", to: redirect("/projects")

  # Movement demo
  get "/movement-demo", to: "movement_demo#index"

  # Dashboard for development/testing
  get "/dashboard", to: "dashboard#hello", as: :dashboard
  post "turbo_message", to: "dashboard#turbo_message", as: :turbo_message

  # Portfolio as root
  root "portfolio#index"
end
