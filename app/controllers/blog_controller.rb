class BlogController < ApplicationController
  def index
    @blog_posts = BlogPost.all
  end

  def show
    @blog_post = BlogPost.find_by!(slug: params[:slug])
    
    respond_to do |format|
      format.html
      format.json { render json: { content: @blog_post.content } }
    end
  end
  
  def content
    blog_post = BlogPost.find_by!(slug: params[:slug])
    render json: { content: blog_post.content }
  end
end
