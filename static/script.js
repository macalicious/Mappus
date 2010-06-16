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
var each = function(obj, fn){
  if(fn.length==1){
    for(x in obj){
      fn(obj[x]);
    };
  }else if(fn.length==2){
      for(x in obj){
        fn(x, obj[x]);
      };
  };
};
$extend = function(orginal, extended){
	for (var key in (extended || {})) {orginal[key] = extended[key];};
	return orginal;
};
function Getter(fn){
    var result;
    var fns = [];
        
    set = function(arg){//kjbb
        result = arg; 
        fns.forEach(function(x){
            x(result)
            //x(result);
        });
        return;
    };
    
    fn();
    
    function get(get_fn){
        if(result){
            get_fn(result);
        }else{
            fns.push(get_fn);
        };
    };
    
    return {
        get: get
    };
};
function Hash(obj){
  var hash = obj || {};
  
  function get(name){
    return hash['name'];
  };
  
  function set(key, value){
    hash[key] = value;
    return hash;
  };
  
  function all(){
    return hash;
  };
  
  return {
    set: set, 
    get: get,
    all: all
  };
};

var $j = jQuery.noConflict();

var gmap;


var $mapper = (function(){
  var geocoder;
  
  function initialize(){
    ui.body();
    ui.map();
    plugins.initialize();
  };
  
  var ui = {
    body: function(){
      var r  = '<header></header>';
          r += '<div id="headerline"></div>';
          r += '<div id="map_canvas"></div>';
      $j('body').append(r);
      this.toolbar.render();
      logger(1, "body html ready")
    },
    map: function(){
      var myLatlng = new google.maps.LatLng(50.08408, 8.2383918); //center:wiesbaden
      var myOptions = {
        zoom: 5,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      gmap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      return gmap
    },
    add_plugin_section: function(name, html){
      this.plugin_sections.push({name: name, html:html});
    },
    settings_html: function(){
      var r  = '<h1>Dingsen</h1>';
          r += '<hr />';
          r += '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
          r += '<section class="plugins">'
          
          console.log("sdgsdgsdgsdg");
          
          each(this.plugin_sections, function(plugin){
            r += '<section id="' + plugin.name + 'plugin">';
            r += plugin.html;
            r += '</section>';
            console.log(plugin);
          });
          r += '</section>';
      return r;
    },
    plugin_sections: [],
    dialog: function(obj, html){
      obj.fancybox({	
        'transitionIn'	: 'none',
        'transitionOut'	: 'fade',
        'overlayOpacity' : 0.15,
        'autoDimensions': false,
        'content' : html
      });
      return obj;
    },
    toolbar: {
      add_item: function(text, name){
        var r = '<a id="toolbarlink_' + name + '" href="javascript:void(0);">' + text + '</a>'
        return $j(r).appendTo($('header'));
      },
      remove_item: function(name){},
      render: function(){
        var link = $j('<a href="javascript:void(0);">settings</a>').appendTo($j('header'));
        ui.dialog(link, function(){return $mapper.ui.settings_html();});
      }
    }
  };
  
  var plugins = {
    add: function(name, fn){
      console.log(this);
      this.plugins[name] = fn;
    },
    all: function(){
      return this.plugins;
    },
    get: function(key){
      return this.plugins[key];
    },
    plugins: {},
    initialize: function(){
      each(this.plugins, function(plugin){
        console.log(plugin);
        plugin.initialize();
        
      });
    }
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
  
  function logger(nr, msg){
    console.log("debug("+nr+"): " + msg);
  };
  
  return {
    map: map,
    initialize: initialize,
    plugins: plugins,
    set_marker: set_marker,
    log: logger,
    ui: ui
  };
})();
 
  $mapper.plugins.add('facebook', (function(){
    var parent = $mapper;
    
    function initialize(){
      parent.log(1, "init facebook plugin");
      load_dependencies(function(){  
        parent.log(2, "facebook plugin: dependencies loaded");
        var set_current_user = function(response){
          if (response.session){ current_user = true; } else { current_user = false; };
        };
        FB.getLoginStatus(set_current_user);
        FB.Event.subscribe('auth.sessionChange', set_current_user); 
        
        query(dialoggg);
        
        $mapper.ui.add_plugin_section("facebook", settings_ui());
      });
    };
    
    function load_dependencies(fn){
      parent.log(1, "facebook plugin: load_dependencies");
      window.fbAsyncInit = function() {
        parent.log(2, "facebook plugin: dependencies loaded 2");
        FB.init({appId: '116990711651134', status: true, cookie: true,xfbml: true});
        fn();
      };
        
      var fb_root = $j("body").append('<div id="fb-root"></div>');
      var e = document.createElement('script'); e.async = true;
          e.src = 'http:' + //document.location.protocol
            '//connect.facebook.net/en_US/all.js';
      
      $j("#fb-root").append(e);
      
    };
    
    var current_user = false;
    
    function register_ui_elements(){
      
    };
      
    function settings_ui(){
      parent.log(1, "facebook plugin: settings_ui");
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
    
    function dialoggg(friends){ 
      parent.log(1, "facebook plugin: window");
      var b = "<h1>Facebook</h1>" 
            + "<hr />"
            + "<table> <thead> <tr>"
            + "<th>Name</th>" + "<th>Heimatort</th>" + "<th>Wohnort</th>"
            + "</tr> </thead>";
            
      each(friends, function(item){
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
      $mapper.ui.dialog(link, b);
      FB.XFBML.parse();
    };
    
    function query(fn){
      parent.log(1, "facebook plugin: query");
      var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
          query.wait(function(result){ fn(result); });
    };
    
    return {
      initialize: initialize,
      settings_ui: settings_ui
    };
  })());
  
 
$j(document).ready(function($){
  $mapper.initialize();
});
