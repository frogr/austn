module Admin
  class BaseController < ApplicationController
    include HttpBasicAuthenticable
  end
end
