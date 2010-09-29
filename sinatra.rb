require 'rubygems'
require 'sinatra/base'
require 'json'
require 'httparty'
require 'sqlite3'

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
      puts @gResult
      #geocode(ort)
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
    return result.to_json
    db = SQLite3::Database.new( "google_query_cach.db" )
    r1, r2 = 0, 0
    
    puts params[:jupitermap].inspect
    params[:jupitermap].each do |key, value|
      r1 += 1
      rows = db.execute( "select result from cach where query='#{value}'" )
      
      if rows.empty?
        r2 += 1
        result[key.to_s] = Google.geocode(value)
        db.execute( "insert into cach (query, result) values ('#{value}', '#{result[key.to_s]}')" )
      else
        result[key.to_s] = rows.first.first
      end 
    end
    
    puts 'alle: ' << r1.inspect
    puts 'an google: ' << r2.inspect
    
    return result.to_json
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
