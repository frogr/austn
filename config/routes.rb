require "sidekiq/web"

Rails.application.routes.draw do
  # Sidekiq Web UI - Protected with HTTP Basic Auth
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    # Use environment variables in production, fallback for development
    expected_username = ENV.fetch("SIDEKIQ_USERNAME", "admin")
    expected_password = ENV.fetch("SIDEKIQ_PASSWORD", Rails.application.credentials.dig(:sidekiq, :password) || "changeme123")

    # Secure comparison to prevent timing attacks
    ActiveSupport::SecurityUtils.secure_compare(username, expected_username) &&
      ActiveSupport::SecurityUtils.secure_compare(password, expected_password)
  end if Rails.env.production?

  mount Sidekiq::Web => "/sidekiq"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Sitemap
  get "sitemap.xml", to: "sitemap#index", as: :sitemap, defaults: { format: :xml }

  # GPU health status API
  get "/gpu_health", to: "gpu_health#index"
  get "/gpu_health/:service", to: "gpu_health#show"
  post "/gpu_health/check", to: "gpu_health#check"
  post "/gpu_health/check/:service", to: "gpu_health#check"

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
  get "/resume", to: "portfolio#resume"

  # Legacy routes - redirect to new structure
  get "/work", to: redirect("/")
  get "/contact", to: redirect("/#contact")
  get "/fun", to: redirect("/fun-links")
  get "/games", to: redirect("/projects")

  # Movement demo
  get "/movement-demo", to: "movement_demo#index"

  # Chat interface for LMStudio integration
  get "/chat", to: "chat#index"
  post "/chat/async", to: "chat#async_complete"
  get "/chat/job/:id", to: "chat#job_status", as: :chat_job_status

  # Dashboard for development/testing
  get "/dashboard", to: "dashboard#hello", as: :dashboard
  post "turbo_message", to: "dashboard#turbo_message", as: :turbo_message

  # Images gallery
  resources :images do
    collection do
      get "ai_generate"
      post "generate"
    end
    member do
      get "ai_show"
      get "ai_image"
      get "ai_data"
      get "ai_status"
    end
  end

  # TTS (Text-to-Speech) interface
  get "/tts", to: "tts#index"
  get "/tts/new", to: "tts#new", as: :new_tts
  get "/tts/voices", to: "tts#voices", as: :tts_voices
  post "/tts/generate", to: "tts#generate"
  post "/tts/:id/share", to: "tts#share", as: :tts_share_create
  get "/tts/:id/status", to: "tts#status", as: :tts_status
  get "/tts/:id/audio", to: "tts#audio", as: :tts_audio
  get "/tts/:id/data", to: "tts#data", as: :tts_data
  get "/tts/:id/download", to: "tts#download", as: :tts_download

  # TTS Share pages (public)
  get "/tts/s/:token", to: "tts_shares#show", as: :tts_share
  get "/tts/s/:token/audio", to: "tts_shares#audio", as: :tts_share_audio
  get "/tts/s/:token/embed", to: "tts_shares#embed", as: :tts_share_embed

  # Rembg (Background Removal)
  get "/rembg", to: "rembg#index"
  post "/rembg/generate", to: "rembg#generate"
  get "/rembg/models", to: "rembg#models", as: :rembg_models
  get "/rembg/:id/status", to: "rembg#status", as: :status_rembg
  get "/rembg/:id/result", to: "rembg#result", as: :result_rembg
  get "/rembg/:id/download", to: "rembg#download", as: :download_rembg

  # VTracer (Image to SVG)
  get "/vtracer", to: "vtracer#index"
  post "/vtracer/generate", to: "vtracer#generate"
  get "/vtracer/defaults", to: "vtracer#defaults", as: :vtracer_defaults
  get "/vtracer/:id/status", to: "vtracer#status", as: :status_vtracer
  get "/vtracer/:id/result", to: "vtracer#result", as: :result_vtracer
  get "/vtracer/:id/download", to: "vtracer#download", as: :download_vtracer

  # Stems (Audio Stem Separation)
  get "/stems", to: "stems#index"
  post "/stems/generate", to: "stems#generate"
  get "/stems/models", to: "stems#models", as: :stems_models
  get "/stems/:id/status", to: "stems#status", as: :status_stems
  get "/stems/:id/result", to: "stems#result", as: :result_stems
  get "/stems/:id/download/:stem", to: "stems#download_stem", as: :download_stem
  get "/stems/:id/download_all", to: "stems#download_all", as: :download_all_stems

  # 3D Model Generation (Image to GLB)
  get "/3d", to: "model3d#index"
  post "/3d/generate", to: "model3d#generate"
  get "/3d/:id/status", to: "model3d#status", as: :status_model3d
  get "/3d/:id/result", to: "model3d#result", as: :result_model3d
  get "/3d/:id/download", to: "model3d#download", as: :download_model3d
  get "/3d/:id/glb", to: "model3d#glb", as: :glb_model3d
  get "/3d/:id/preview", to: "model3d#preview", as: :preview_model3d

  # TTS Batch Generation (admin)
  resources :tts_batches, only: [ :index, :show, :new, :create ] do
    member do
      get :download_all
    end
  end
  get "/tts_batches/items/:id/download", to: "tts_batches#download_item", as: :download_tts_batch_item
  post "/tts_batches/items/:id/share", to: "tts_batches#share_item", as: :share_tts_batch_item

  # Public booking
  get "/book", to: "bookings#new", as: :book
  get "/book/:date", to: "bookings#slots", as: :book_date
  resources :bookings, only: [ :create ], param: :confirmation_token do
    member do
      get :confirmation
      get :cancel_confirm
      delete :cancel
    end
  end

  # Admin namespace
  namespace :admin do
    get "login", to: "sessions#new", as: :login
    post "login", to: "sessions#create"
    delete "logout", to: "sessions#destroy", as: :logout

    root to: "dashboard#index"

    resources :availabilities, except: [ :show ]
    resources :bookings, only: [ :index, :show, :update, :destroy ]

    resources :tts_shares, only: [ :index, :destroy ] do
      collection do
        post :bulk_destroy
        post :cleanup_expired
      end
    end

    resources :blog_posts do
      member do
        post :sync_images
      end
    end
  end

  # API v1
  namespace :api do
    namespace :v1 do
      # TTS endpoints
      post "tts/generate", to: "tts#generate"        # Async - returns generation ID
      post "tts/synthesize", to: "tts#synthesize"    # Sync - returns audio file directly
      get "tts/voices", to: "tts#voices"             # List available voices
      get "tts/health", to: "tts#health"             # Check TTS service health
      get "tts/:id/status", to: "tts#status", as: :tts_status
      post "tts/batch", to: "tts#batch"
      get "tts/batch/:id/status", to: "tts#batch_status", as: :tts_batch_status
    end
  end

  # MIDI DAW interface
  get "/midi", to: "midi#index"

  # DAW Pattern Library
  resources :daw_patterns, path: "daw/patterns", only: [ :index, :show, :create, :update, :destroy ] do
    collection do
      get :tags
    end
  end

  # Endless Story
  get "/endless", to: "endless#index"
  get "/endless/:id", to: "endless#show", as: :endless_story
  get "/endless/:id/paragraphs", to: "endless#paragraphs", as: :endless_story_paragraphs
  get "/endless/:id/timer", to: "endless#timer", as: :endless_story_timer

  # Portfolio as root
  root "portfolio#index"
end
