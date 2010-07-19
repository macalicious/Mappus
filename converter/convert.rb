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
    
    uri = URI.escape("http://maps.google.com/maps/geo?q=#{ort}&output=xml&sensor=false&key=ABQIAAAAIpjwufEkmHT623auy9W0EBQ1IfWKRoZ68hmR_kq9MWtN9i2BNRSR8hwLkR6TEX9GZDQxp6yQ8dv36Q")
    result =  get(uri)
    
    if georesult = result['kml']['Response']['Placemark']
      
      georesult = georesult[0] if georesult.class==Array
      georesult.delete "ExtendedData"
      georesult.delete "AddressDetails"
      
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

b = Builder::XmlMarkup.new( :target => xml="", :indent => 2 )
b.instruct! :xml, :version=>"1.0", :encoding=>"UTF-8"


def csv(file)
  f = File.open(file, 'r')
  lines = f.readlines("\r")
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

#xml = builder.hallo(Google.geocode("Wiesbaden"));
b.person { 
  b.name("Jim") 
  menschen = csv("Gemeindeliste.txt")
  #menschen.each {|m| ddd(Google.geocode("#{m[:"Strasse"]} ,#{m[:"Plz-Ort"]}"), b)}
 
  menschen.each do |mensch|
    
    plz, ort = mensch[:"plz-ort"].split(" ") if mensch[:"plz-ort"]
    

    
    r = Google.geocode "#{mensch[:strasse]} ,#{plz} #{ort}"
    case r
    when :error, :unknown
      puts "#{mensch[:strasse]} ,#{plz} #{ort}" + " nicht gefunden"
      next
    when :toomany
      menschen = menschen.push mensch
      sleep 47
      next
    when Array, Hash
      #weiter
    else
      puts "?"
      next
    end
    
    b.mensch{
      b.vorname mensch[:vorname]
      b.nachname mensch[:name]
      b.strasse mensch[:strasse]
      b.plz plz
      b.ort ort
      
      b.geocode {ddd(r, b)}
    }
  end
  
}

File.open("test.xml", 'w') {|f| f.write(xml) }


 
