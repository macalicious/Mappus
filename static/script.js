function d(a,b){
   console.log(b,a);
}

/*
var Map = new Class({
  options: {
    geocoder: false,
    map: false
  },
  initialize: function(obj){
    if (GBrowserIsCompatible()) {
      this.options.map = new GMap2(document.getElementById("map_canvas"));
      this.options.map.addControl(new GSmallMapControl());
            
      this.options.geocoder = new GClientGeocoder();
      this.options.geocoder.getLatLng("Deutschland", function(point){
        this.options.map.setCenter(point, 1);
      }.bind(this));  
    }
  },
  set_marker: function(point, overlay_fc){
    var gpoint = new GLatLng(point[1],point[0],point[2]);
    var marker = new GMarker( gpoint );
    this.options.map.addOverlay(marker);
    GEvent.addListener(marker, "click", overlay_fc.bind(this, marker));
  }
});

var FriendMap = new Class({
  options: {
    api_key: '3fad1c03fea2d32fd681ae71e3f7800d',
    channel_path: 'xd_receiver.htm',
    debug: true,
    oid: "map",
    loadimg: "images/ejut8v2y.png"
  },
  Implements: Chain,
  dbug: function(){
    console.log( arguments[1] + ": " + arguments[0] )
  },
  initialize: function(){
    this.dbug("init", "position"); 
    
    this.chain([ 
      this.facebook_request, 
      this.server_request, 
      this.start_markering, 
      this.geladen,
      function(){console.log("geladen");} 
    ]);
    
    FB.init({
      appId: "111427725556783",
      xfbml: true,
      cookie: true,
      status: true
    });
    
    this.element = $(this.options.oid)
    var size = this.element.getSize();
    this.loadimg = new Element('img', {
      'src': this.options.loadimg, 
      'class': 'loadimg', 
      'styles':{
        'top': '50%', 'left': '50%',
        'margin-top': -16,
        'margin-left': -16,
        'position': 'absolute'  
      }
    });
    this.element.adopt( this.loadimg )
    this.gmap = new Element('div', {
      'id': 'map_canvas',
      'styles': { 
        'visibility': 'hidden',
        'height': size.y, 
        'width': size.x 
      } 
    });
    this.element.adopt( this.gmap );
    
    this.map = new Map();
    this.current_user = FB.Helper.getLoggedInUser();
    
    this.callChain(); 
  },
  facebook_request: function(){
    this.dbug("facebook_request", "position");
    var querry = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", this.current_user);
    querry.wait(function(result){
        this.friends = result; 
        this.callChain();
      }.bind(this), 
      function(e){ console.log(e + "error"); }
    ); 
  },
  start_markering: function(){
    this.dbug("merkering", "position");
    var set_marker = function(user, adresse){
      this.map.set_marker(adresse.point, function(marker){
        var markup = '<div class="marker"><fb:profile-pic size="square" uid="'+ user.uid + '" facebook-logo="true">' + ' </fb:profile-pic>' + adresse.city + '</div>'; 
        marker.openInfoWindowHtml(markup);
        $$(".marker").each(function(item){ FB.XFBML.parse(item);  });
      }.bind(this));
    }.bind(this);
    
    var temp = [];
    this.friends.each(function(item){
      if(item.current_location && !(temp.contains(item.current_location.city))){
        set_marker(item, item.current_location);
        temp.push(item.current_location.city);
      }
      if(item.hometown_location && !(temp.contains(item.hometown_location.city))){
        set_marker(item, item.hometown_location);
        temp.push(item.hometown_location.city);
      }
    }, this); 
    this.callChain();
  }, 
  server_request: function(){ //addr_to_lng
    this.dbug("server_request", "position");
    var adressen = [];
    this.friends.each(function(item){
      if (item.current_location) {adressen.push(item.current_location.city);}
      if (item.hometown_location) {adressen.push(item.hometown_location.city);}
    });
    
    var onSuccess = function(json){
      this.friends.each(function(item){
        if (item.current_location) {$extend(item.current_location, {point:json[item.current_location.city].split(",")});}
        if (item.hometown_location) {$extend(item.hometown_location, {point:json[item.hometown_location.city].split(",")});}
      });
      
      this.callChain();
    }.bind(this);
    
    var jsonRequest = new Request.JSON({
      url: '/facebooks/get_cord/', 
      data: {friendmapper: adressen},
      onSuccess: onSuccess
    }).post();
     
  },
  geladen: function(){
    this.loadimg.setStyle('display', 'none');
    this.gmap.setStyle('visibility', 'visible');
    this.callChain();
  }
});

*/

Array.prototype.each = function(fn){this.forEach(fn);};
$extend = function(orginal, extended){
	for (var key in (extended || {})) orginal[key] = extended[key];
	return orginal;
};

var $j = jQuery.noConflict();

var gmap;




var $mapper = (function(){
  var geocoder;
  var plugins = {};
  
  function initialize(){
    var myLatlng = new google.maps.LatLng(50.08408, 8.2383918); //center:wiesbaden
    var myOptions = {
      zoom: 5,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    gmap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
     
    for(var plugin in plugins){ //init plugins
      //try { this.plugins[plugin].initialize(); }
      //catch(e){ console.log(e)}; 
      this.plugins[plugin].initialize();
    };
  };
  
  function map(array){
    var locations = array.map(function(item){ return {'query': item} });
    array_to_points(locations, function(result){
      array_to_marker(result);
      console.log(result);
    });
  };
  
  function geocode(querry, fn){
    geocoder = geocoder || new google.maps.Geocoder();
    geocoder.geocode( { 'address': querry}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        fn(results[0]);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };
  
  function array_to_points(locations, fn){
    locations.each(function(item, index){
      geocode(item.query, function(results){
        $extend(locations[index], results)
        if(index+1==locations.length) fn(locations);
      });
    });
  };
  
  function array_to_marker(locations){
    locations.each(function(item){   
      var marker = new google.maps.Marker({
        map: gmap, 
        position: item.geometry.location,
        title: item.query     
      });
      
      var contentString = '<h2>'+item.query+'</h2>';

      var infowindow = new google.maps.InfoWindow({
          content: contentString
      });

      google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(gmap,marker);
      });
      google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(gmap,marker);
      });
      
      
    });
  };
  
  return {
    map: map,
    initialize: initialize,
    plugins: plugins
  };
})();
 
$mapper.plugins.facebook = (function(){
  
  function initialize(){
    window.fbAsyncInit = function() {
        FB.init({appId: '116990711651134', status: true, cookie: true,
                 xfbml: true});
      
       var t = '<fieldset>'
             + '<legend>Facebook</legend>'
             + '<section>Verbinde dich mit deinem Facebook-Konto und importiere die Daten.</section>'
             + '<section class="last">'
             + '<fb:if-is-app-user>'
             + 'Verbunden'
             + '<fb:else><fb:login-button></fb:else>'
             + '</fb:if-is-verified>'
             + '</section>' //<fb:intl>Connect with Facebook</fb:intl></fb:login-button>
             + '</fb:if-is-app-user>';
       
       var obj = $j("#dialog1").append(t);
       //var obj = $j("#dialog1 section.plugins").append('<fieldset class="last"><legend>Facebook</legend><fb:login-button><fb:intl>Connect with Facebook</fb:intl></fb:login-button></fieldset>');
       
       FB.XFBML.parse();
      };
      
    var fb_root = $j("body").append('<div id="fb-root"></div>');
    var e = document.createElement('script'); e.async = true;
        e.src = 'http:' + //document.location.protocol
          '//connect.facebook.net/en_US/all.js';
    fb_root.append(e);
       
  };
  
  return {
    initialize: initialize
  };
})();


$j(document).ready(function($){
  
    $mapper.initialize();
    /*
    var address = "Wiesbaden"
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              gmap.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                  map: gmap, 
                  position: results[0].geometry.location
              });
            } else {
              alert("Geocode was not successful for the following reason: " + status);
            }
    });
    */
    
    $j("a").fancybox({	
      'transitionIn'	: 'none',
			'transitionOut'	: 'fade',
			'overlayOpacity' : 0.15,
			'autoDimensions': false
		});
});



var friendmapper = null;
//window.fbAsyncInit = function() { friendmapper= new FriendMap(); };





// var current_user = FB._session.uid;
// var querry = FB.Data.query("select uid2 from friend where uid1={0}", current_user);
