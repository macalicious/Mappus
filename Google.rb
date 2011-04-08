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