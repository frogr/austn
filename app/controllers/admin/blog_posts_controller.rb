module Admin
  class BlogPostsController < BaseController
    def index
      @blog_posts = BlogPost.all.sort_by { |p| p.published_at || p.created_at }.reverse
      @total_count = BlogPost.count
    end

    def new
      @blog_post = BlogPost.new
    end

    def create
      @blog_post = BlogPost.new(blog_post_params)
      if @blog_post.save
        redirect_to admin_blog_posts_path, notice: "Blog post created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @blog_post = BlogPost.find(params[:id])
    end

    def update
      @blog_post = BlogPost.find(params[:id])
      if @blog_post.update(blog_post_params)
        redirect_to admin_blog_posts_path, notice: "Blog post updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @blog_post = BlogPost.find(params[:id])
      @blog_post.destroy
      redirect_to admin_blog_posts_path, notice: "Blog post deleted."
    end

    private

    def blog_post_params
      params.require(:blog_post).permit(:title, :content, :slug, :published_at)
    end
  end
end
