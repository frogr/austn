class AdminController < ApplicationController
  layout 'admin'

  def dashboard
    @blog_posts_count = BlogPost.count
    @game_posts_count = GamePost.count
    @work_posts_count = WorkPost.count
  end

  def blog_posts
    @blog_posts = BlogPost.all.order(created_at: :desc)
  end

  def game_posts
    @game_posts = GamePost.all.order(created_at: :desc)
  end

  def work_posts
    @work_posts = WorkPost.all.order(created_at: :desc)
  end

  def new_game_post
    @game_post = GamePost.new
  end

  def create_game_post
    @game_post = GamePost.new(game_post_params)
    
    if @game_post.save
      redirect_to admin_game_posts_path, notice: "Game post was successfully created."
    else
      render :new_game_post
    end
  end

  def edit_game_post
    @game_post = GamePost.find(params[:id])
  end

  def update_game_post
    @game_post = GamePost.find(params[:id])
    
    if @game_post.update(game_post_params)
      redirect_to admin_game_posts_path, notice: "Game post was successfully updated."
    else
      render :edit_game_post
    end
  end

  def destroy_game_post
    @game_post = GamePost.find(params[:id])
    @game_post.destroy
    
    redirect_to admin_game_posts_path, notice: "Game post was successfully deleted."
  end

  def new_work_post
    @work_post = WorkPost.new
  end

  def create_work_post
    @work_post = WorkPost.new(work_post_params)
    
    if @work_post.save
      redirect_to admin_work_posts_path, notice: "Work post was successfully created."
    else
      render :new_work_post
    end
  end

  def edit_work_post
    @work_post = WorkPost.find(params[:id])
  end

  def update_work_post
    @work_post = WorkPost.find(params[:id])
    
    if @work_post.update(work_post_params)
      redirect_to admin_work_posts_path, notice: "Work post was successfully updated."
    else
      render :edit_work_post
    end
  end

  def destroy_work_post
    @work_post = WorkPost.find(params[:id])
    @work_post.destroy
    
    redirect_to admin_work_posts_path, notice: "Work post was successfully deleted."
  end

  private

  def authenticate_admin
    # In a real application, you'd want to use a proper authentication system
    # This is just a placeholder for demonstration purposes
    true
  end

  def game_post_params
    params.require(:game_post).permit(:title, :description, :image_url, :link, :featured)
  end

  def work_post_params
    params.require(:work_post).permit(:title, :description, :image_url, :featured, tags: [])
  end
end