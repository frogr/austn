require "sidekiq/web"

Rails.application.routes.draw do
  # Sidekiq Web UI, only routed for a signed-in admin (everyone else gets a 404)
  constraints ->(request) { AdminSession.new(request.session).active? } do
    mount Sidekiq::Web => "/sidekiq"
  end

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

  # Public site: Home, Work, Writing (blog), Playground, Resume, plus /now
  root "pages#home"
  get "/now", to: "pages#now", as: :now

  get "/work", to: "work#index", as: :work_index
  get "/work/:slug", to: "work#show", as: :work_item

  get "/blog", to: "blog#index"
  get "/blog/:slug", to: "blog#show", as: :blog_post

  get "/playground", to: "playground#index", as: :playground
  get "/playground/:slug", to: "playground#show", as: :playground_item

  get "/resume", to: "resumes#show", as: :resume, defaults: { format: :html }

  # Short link to send people for a call
  get "/meet", to: redirect("/book"), as: :meet

  # Old URLs from the previous version of the site
  get "/projects", to: redirect("/work")
  get "/projects/:id", to: "work#legacy"
  get "/fun-links", to: redirect("/now")
  get "/reading", to: redirect("/now")
  get "/resources", to: redirect("/now")
  get "/fun", to: redirect("/now")
  get "/games", to: redirect("/playground")
  get "/contact", to: redirect("/book")

  # Claude Corner
  get "/claude", to: "claude_corner#index"

  # Pitch checker
  get "/pitch", to: "pitch#index"

  # Chat interface for LMStudio integration
  get "/chat", to: "chat#index"
  post "/chat/async", to: "chat#async_complete"
  get "/chat/job/:id", to: "chat#job_status", as: :chat_job_status

  # Images gallery (read-only; generated images are published by the admin)
  resources :images, only: [ :index, :show ] do
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

  # Music Generation (ACE-Step)
  get "/music", to: "music#index"
  post "/music/generate", to: "music#generate"
  get "/music/:id/status", to: "music#status", as: :music_status
  get "/music/:id/result", to: "music#result", as: :music_result
  get "/music/:id/download", to: "music#download", as: :music_download
  get "/music/:id/data", to: "music#data", as: :music_data

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

    resources :availability_rules, except: [ :show ]
    resources :availabilities, except: [ :show ] do
      collection do
        post :bulk_create
      end
    end
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

    resources :invoices do
      member do
        get :preview
        get :pdf
        post :send_invoice
        post :mark_paid
        post :duplicate
      end
    end

    resources :clients

    resources :claude_corner_entries, only: [ :index, :show, :destroy ] do
      member do
        post :publish
        post :unpublish
      end
      collection do
        post :generate
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

      # Image generation endpoints
      post "images/generate", to: "images#generate"            # Sync - blocks until complete
      post "images/generate_async", to: "images#generate_async" # Async - returns generation ID
      get "images/:id/status", to: "images#status", as: :image_status

      # Briefing email endpoint
      post "briefings/send", to: "briefings#send_briefing"
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

  # Code Review Harness
  resources :reviews, only: [ :index, :create, :show ] do
    member do
      post :synthesize
    end
    resources :sections, only: [] do
      post :comments, to: "reviews#add_comment"
    end
  end
end
