require 'rubygems'
require 'sinatra/base'

class MyApp < Sinatra::Base
  
  set :public, File.dirname(__FILE__) + '/static'
  
  get '/' do
    erb :index
  end

end