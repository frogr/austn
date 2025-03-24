Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # API endpoints
  namespace :api do
    resources :blog_posts, only: [:index, :show], param: :slug
    resources :game_posts, only: [:index, :show], param: :slug
    resources :work_posts, only: [:index, :show], param: :slug
  end

  # Blog routes
  get "/blog", to: "blog#index"
  get "/blog/:slug", to: "blog#show", as: :blog_post
  get "/blog/:slug/content", to: "blog#content", as: :blog_post_content

  # Games routes
  get "/games", to: "games#index"

  # Work routes
  get "/works", to: "works#index"

  # Admin routes
  scope :admin do
    get '/', to: 'admin#dashboard', as: :admin_dashboard
    
    # Blog posts
    get '/blog-posts', to: 'admin#blog_posts', as: :admin_blog_posts
    
    # Game posts
    get '/game-posts', to: 'admin#game_posts', as: :admin_game_posts
    get '/game-posts/new', to: 'admin#new_game_post', as: :admin_new_game_post
    post '/game-posts', to: 'admin#create_game_post', as: :admin_create_game_post
    get '/game-posts/:id/edit', to: 'admin#edit_game_post', as: :admin_edit_game_post
    patch '/game-posts/:id', to: 'admin#update_game_post', as: :admin_update_game_post
    delete '/game-posts/:id', to: 'admin#destroy_game_post', as: :admin_destroy_game_post
    
    # Work posts
    get '/work-posts', to: 'admin#work_posts', as: :admin_work_posts
    get '/work-posts/new', to: 'admin#new_work_post', as: :admin_new_work_post
    post '/work-posts', to: 'admin#create_work_post', as: :admin_create_work_post
    get '/work-posts/:id/edit', to: 'admin#edit_work_post', as: :admin_edit_work_post
    patch '/work-posts/:id', to: 'admin#update_work_post', as: :admin_update_work_post
    delete '/work-posts/:id', to: 'admin#destroy_work_post', as: :admin_destroy_work_post
  end

  # Portfolio routes
  get "/contact", to: "portfolio#contact"
  get "/fun", to: "portfolio#fun"
  get "/games/arena-shooter", to: "portfolio#arena_shooter"
  get "/movement-demo", to: "movement_demo#index"

  # Dashboard for development/testing
  get "/dashboard", to: "dashboard#hello", as: :dashboard
  post "turbo_message", to: "dashboard#turbo_message", as: :turbo_message

  # get '/new', to: 'frontend#show', as: :new_frontend
  # get '/new/*path', to: 'frontend#show'
  # Portfolio as root
  root "portfolio#index"
end
