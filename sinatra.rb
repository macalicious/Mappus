require 'rubygems'
require 'sinatra/base'
require 'json'
require 'httparty'

class Google
  include HTTParty
  format :xml
  
  def self.geocode(ort)
    @uri = URI.escape("http://maps.google.com/maps/geo?q=#{ort}&output=xml&sensor=false&key=ABQIAAAAIpjwufEkmHT623auy9W0EBQ1IfWKRoZ68hmR_kq9MWtN9i2BNRSR8hwLkR6TEX9GZDQxp6yQ8dv36Q")
    @gResult =  get(@uri)
    @cord = @gResult['kml']['Response']['Placemark']
    @cord = @cord[0] if @cord.class == Array

    if @cord
      @cord['Point']['coordinates']   
    else
      geocode(ort)
    end
  end
end

class MyApp < Sinatra::Base
  set :static, true
  set :public, File.dirname(__FILE__) + '/static'
  
  get '/' do
    erb :index
  end
  
  get '/geocode' do
    result = {}

    params[:jupitermap].split(",").each do |item|
      id, adresse = item.split("=");
      result[id.to_s] = Google.geocode(adresse) unless result.has_key?(adresse) 
    end
    
    return result.to_json; 
  end
  
  get '/gemeinde.xml' do
    content_type 'text/xml', :charset => 'utf-8'
  end
  
end




# $j.ajax({
#       url: "test/",
#       data: ({jupitermap : ["Wiesbaden","Hamburg","München"]}),
#       success: function(msg){
#          alert(msg);
#       },
#       error: function(a,b,c){
#         alert(a);
#         alert(b);
#         alert(c);
#       }
#    }
# )
