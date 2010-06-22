require 'rubygems'
require 'sinatra/base'
require 'json'
require 'httparty'

# class Google
#   include HTTParty
#   format :xml
#   
#   def self.geocode(ort)
#     @uri = URI.escape("http://maps.google.com/maps/geo?q=#{ort}&output=xml&sensor=false&key=ABQIAAAAIpjwufEkmHT623auy9W0EBQ1IfWKRoZ68hmR_kq9MWtN9i2BNRSR8hwLkR6TEX9GZDQxp6yQ8dv36Q")
#     @gResult =  get(@uri)
#     @cord = @gResult['kml']['Response']['Placemark']
#       @cord = @cord[0] if @cord.class == Array
# 
#       if @cord
#         @cord['Point']['coordinates']   
#       else
#         geocode(ort)
#       end
#   end
# end
# 
# 
# class MyApp < Sinatra::Base
#   set :static, true
#   set :public, File.dirname(__FILE__) + '/static'
#   
#   get '/' do
#     erb :index
#   end
#   
#   get '/geocode' do
#     result = {}
# 
#     params[:jupitermap].split(",").each do |item|
#       result[URI.escape(item).to_s] = Google.geocode(item) unless result.has_key?(item) 
#     end
#     
#     return result.to_json; 
#   end
#   
# end




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



class MyApp < Sinatra::Base
 
  
  get '/' do
    erb :index
  end
  
  
end