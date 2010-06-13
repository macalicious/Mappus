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
Object.prototype._each = function(fn){
  if(fn.length==1){
    for(x in this){
      fn(x);
    };
  }else if(fn.arity==1){
      for(x in this){
        fn(x, this[x]);
      };
  };
};
$extend = function(orginal, extended){
	for (var key in (extended || {})) {orginal[key] = extended[key];};
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
      if(this.plugins[plugin].settings_ui){
        add_settings_ui( this.plugins[plugin].settings_ui() ); 
      };
      
    };
  };
  
  function add_settings_ui(html){
    
  };
  
  function map(array){
    var locations = array.map(function(item){ return {'query': item}; });
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
        $extend(locations[index], results);
        if(index+1==locations.length) {fn(locations);};
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
  
  function dialog(obj, html){
    obj.fancybox({	
      'transitionIn'	: 'none',
      'transitionOut'	: 'fade',
      'overlayOpacity' : 0.15,
      'autoDimensions': false,
      'content' : html
    });
    return obj;
  };
  
  
    //gobale markerzuordnung fehlt noch
  //};
  
  function set_marker(parm){
    
    var parse_marker = function(ort){
      geocode(ort, function(results){
        var marker = new google.maps.Marker({
          map: gmap, 
          position: results[0].geometry.location,
          title: ort     
        });

        var contentString = '<h2>'+ort+'</h2>';

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
      
    if(typeof(parm) == "string"){ parse_marker(parm); };
    if(typeof(parm) == "array"){ parm.each(function(item){ parse_marker(item); }); };
    if(typeof(parm) == "object"){ parm.each(function(index, item){ parse_marker(item); });};
  };
  
  var toolbar = [];
      toolbar.add_item = function(){};
  
  return {
    map: map,
    initialize: initialize,
    plugins: plugins,
    dialog: dialog,
    set_marker: set_marker
  };
})();
 
$mapper.plugins.facebook = (function(){
  
  function initialize(){
    load_dependencies(function(){  
      var set_current_user = function(response){
        if (response.session){ current_user = true; } else { current_user = false; };
      };
      FB.getLoginStatus(set_current_user);
      FB.Event.subscribe('auth.sessionChange', set_current_user); 
      
      query(window);
    });
  };
  
  function load_dependencies(fn){
    window.fbAsyncInit = function() {
      FB.init({appId: '116990711651134', status: true, cookie: true,xfbml: true});
      fn();
    };
      
    var fb_root = $j("body").append('<div id="fb-root"></div>');
    var e = document.createElement('script'); e.async = true;
        e.src = 'http:' + //document.location.protocol
          '//connect.facebook.net/en_US/all.js';
    fb_root.append(e);
  };
  
  var current_user = false;
    
  function settings_ui(){
    var t = '<fieldset id="facebook_settings">'
          + '<legend>Facebook</legend>'
          + '<section>Verbinde dich mit deinem Facebook-Konto und importiere die Daten.</section>'
          + '<section class="last">';
    if (current_user) {
        t += '<fb:facepile>';
    } else {
       t += '<fb:login-button><fb:intl>Connect with Facebook</fb:intl></fb:login-button>';
    };
    t += '</section>';
    return t;
  };
  
  function window(friends){
    var b = "<h1>Facebook</h1>" 
          + "<hr />"
          + "<table> <thead> <tr>"
          + "<th>Name</th>" + "<th>Heimatort</th>" + "<th>Wohnort</th>"
          + "</tr> </thead>";
          
    friends.each(function(item){
        b += "<tr>"
          +  "<td>" + item.name + "</td>"
          +  "<td>";
          if(item.hometown_location){
            b += item.hometown_location.city + ", " + item.hometown_location.country;
          }else{
        b += "-";
          }; 
        b += "</td>"
          +  "<td>";
          if(item.current_location){
            b += item.current_location.city + ", " + item.current_location.country;
          }else{
        b += "-";
          };
        b += "</td>"
          +  "</tr>"; 
    });
        b += "</table>";  
        
    
    var link = $j("header").append('<a href="#">Facebook</a>').children("a").last();
    $mapper.dialog(link, b);
    FB.XFBML.parse();
  };
  
  function query(fn){
    var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
        query.wait(function(result){ fn(result); });
  };
  
  return {
    initialize: initialize,
    settings_ui: settings_ui
  };
})();


$j(document).ready(function($){
  
    $mapper.initialize();

    
    $j("a").fancybox({	
      'transitionIn'	: 'none',
			'transitionOut'	: 'fade',
			'overlayOpacity' : 0.15,
			'autoDimensions': false
		});
});




