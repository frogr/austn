module Admin
  class ClientsController < BaseController
    before_action :set_client, only: %i[show edit update destroy]

    def index
      @clients = Client.order(:name)
    end

    def show
      @invoices = @client.invoices.order(issue_date: :desc)
    end

    def new
      @client = Client.new
    end

    def create
      @client = Client.new(client_params)
      if @client.save
        redirect_to admin_client_path(@client), notice: "Client created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @client.update(client_params)
        redirect_to admin_client_path(@client), notice: "Client updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @client.destroy
      redirect_to admin_clients_path, notice: "Client deleted."
    end

    private

    def set_client
      @client = Client.find(params[:id])
    end

    def client_params
      params.require(:client).permit(:name, :email, :address_line1, :address_line2, :city, :state, :zip, :notes)
    end
  end
end
