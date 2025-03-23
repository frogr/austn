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

  # Portfolio routes
  get "/work", to: "portfolio#work"
  get "/contact", to: "portfolio#contact"
  get "/fun", to: "portfolio#fun"
  get "/games", to: "portfolio#games"
  get "/games/arena-shooter", to: "portfolio#arena_shooter"
  get "/movement-demo", to: "movement_demo#index"

  # Dashboard for development/testing
  get "/dashboard", to: "dashboard#hello", as: :dashboard
  post "turbo_message", to: "dashboard#turbo_message", as: :turbo_message

  get '/new', to: 'frontend#show', as: :new_frontend
  get '/new/*path', to: 'frontend#show'
  # Portfolio as root
  root "portfolio#index"
end
