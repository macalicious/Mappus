# require 'rubygems'
# require 'sinatra/base'
# require 'json'
# require 'httparty'
# require "sequel"
# require 'sqlite3'

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
      puts "########"
      puts ort.inspect
      ort = ort.split(", ")
      ort.shift
      puts ort.inspect
      ort = ort.join(', ')
      geocode(ort) unless ort.empty?
    end
  end
end

class MyApp < Sinatra::Base
  set :static, true
  set :public, File.dirname(__FILE__) + '/static'
  
  get '/' do
    puts "+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+"
    puts ENV['HEROKU_TYPE'].inspect
    erb :index
  end
  
  get '/geocode' do
    result = {}
     
    DB = if ENV['HEROKU_TYPE']
      
        Sequel.connect("postgres://uyqetrlvbv:f5lxx1zz5pnorynqglhzmsp34@ec2-184-73-167-204.compute-1.amazonaws.com/uyqetrlvbv")
      else
        Sequel.sqlite( "google_query_cach.db" )
    end
    Cach = DB[:cach]
    r1, r2 = 0, 0
   
    puts params[:jupitermap].inspect
    params[:jupitermap].each do |key, value|
      r1 += 1
      
      puts key
      if key == "3"
        puts "_____________"
        puts value.inspect
      end
      
      row = Cach.where(:query=> value).first
      if row.nil?
        r2 += 1
        result[key.to_s] = Google.geocode(value)
        Cach.insert(:query => value, :result => result[key.to_s])
      else
        result[key.to_s] = row[:result]
      end 
    end
    
    puts 'alle: ' << r1.inspect
    puts 'an google: ' << r2.inspect
    puts result.to_json
    
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
