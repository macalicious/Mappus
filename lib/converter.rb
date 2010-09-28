require 'rubygems'
require 'builder'
require 'httparty'
require 'net/http'
require 'iconv'
require 'cgi'

class Google
  include HTTParty
  format :xml
  
  def self.geocode(ort)
    puts ort
    puts ""
    
    uri = URI.escape("http://maps.google.com/maps/geo?q=#{ort}&output=xml&language=de&region=de&sensor=false&key=ABQIAAAAIpjwufEkmHT623auy9W0EBQ1IfWKRoZ68hmR_kq9MWtN9i2BNRSR8hwLkR6TEX9GZDQxp6yQ8dv36Q")
    result =  get(uri)
    
    if georesult = result['kml']['Response']['Placemark']
      
      georesult = georesult[0] if georesult.class==Array
      #georesult.delete "ExtendedData"
      #georesult.delete "AddressDetails"
      
      return georesult
    else 
      case result['kml']['Response']['Status']['code']
      when 602
        return :unknown 
      when 620
        return :toomany
      else
        return :error
        puts "error"
        puts result.inspect
        puts ""
      end
    end
    
    #Net::HTTP.get(URI.parse(@uri))

  end
end


class GeoConverter 
  
  def initialize(file, format)
    @file = file
    @format = format[:to]
    
    geocode csv_to_hash
  end
  
  def geocode(hash)
    
    
    #menschen.each {|m| ddd(Google.geocode("#{m[:"Strasse"]} ,#{m[:"Plz-Ort"]}"), b)}
    a = 0
    hash.each do |adresse|
      next if a == 5
      a += 1
      geo_result = []
      #plz, ort = mensch[:"plz-ort"].split(" ") if mensch[:"plz-ort"]
  
      query = adresse[:strasse] << ', ' << adresse[:'plz-ort']
      r = Google.geocode query
      case r
      when :error, :unknown
        puts query << " nicht gefunden"
        next
      when :toomany
        adresse.push adresse
        sleep 47
        next
      when Array, Hash
        #weiter
        puts r.inspect
        puts ""
        # geo_result.push {
        #            :query => query,
        #            :point => point
        #          }
        
      else
        puts "?"
        next
      end
    end
       # 
       # b.mensch{
       #   b.vorname mensch[:vorname]
       #   b.nachname mensch[:name]
       #   b.strasse mensch[:strasse]
       #   b.plz plz
       #   b.ort ort
       # 
       #   b.geocode {ddd(r, b)}
       # }
        
  end
  
  def csv_to_hash
    f = File.open(@file, 'r')
    lines = f.readlines()
    
    head = lines.delete_at(0).split(";")
    head.pop
    
    lines.map! do |l| 
      res = {}
      s = l.split(";")
      s.pop
      head.each_index do |i| 
        res[head[i].downcase.to_sym] = s[i]  
      end 
      res
    end
    lines
  end
end

puts GeoConverter.new('../hallo.csv', :to => 'json')

def ddd(x, b)
  x.each do |key, value|
    puts key.inspect unless key.class==String
    #puts "value" + value.inspect
    if value.class==String
      b.__send__(key, value) 
    else
      
      b.__send__(key) do |b|
        ddd(value, b)
      end
    end
  end
end
=begin
b = Builder::XmlMarkup.new( :target => xml="", :indent => 2 )
b.instruct! :xml, :version=>"1.0", :encoding=>"UTF-8"




#xml = builder.hallo(Google.geocode("Wiesbaden"));
b.person { 
  b.name("Jim") 
 
  end
  
}

File.open("test.xml", 'w') {|f| f.write(xml) }

=end