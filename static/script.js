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

//Array.prototype.each = function(fn){this.forEach(fn);};
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
    $j('#progress').animate({backgroundPosition: '0% 30%'}, 30000);
    ui.body(function(){
      ui.map(function(){ 
        plugins.initialize(function(){
          events.app_ready();
        });
      });
    });
  };
  
  var ui = {
    body: function(fn){
      var r  = '<div id="view2">';
          r += '<header></header>';
          r += '<div id="headerline"></div>';
          r += '<div id="map_canvas"></div>';
          r += '<div id="hidden" style="display:none;"></div>';
          r += '</div>';
      $j(r).appendTo('body').css({visibility:'hidden'});
      logger(1, "body ready")
      fn();
      //this.settings();
      //this.toolbar.render();
    },
    map: function(fn){
      
      var e = document.createElement('script'); 
          e.async = true;
          e.src = 'http://maps.google.com/maps/api/js?sensor=false&callback=$mapper.events.map_ready';
      $j("body").append(e);
      
      $mapper.tempmapfn = function(){
        var myLatlng = new google.maps.LatLng(50.08408, 8.2383918); //center:wiesbaden
        var myOptions = {
          zoom: 5,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        gmap = new google.maps.Map($j("#map_canvas")[0], myOptions);
        logger(1, 'map ready');
        fn();
      };
    },
    add_plugin_section: function(obj){
      //this.plugin_sections.push({name: name, html:html});
      $j(obj).appendTo($j('#settings_ui .plugins'));
    },
    settings: function(){
      var r  = '<h1>Dingsen</h1>';
          r += '<hr />';
          r += '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
          r += '<section class="plugins">';
      
      var obj = $j('<div id="settings_ui"></div>').appendTo($j('#hidden')).append(r);
         
      return obj;
    },
    plugin_sections: [],
    dialog: function(obj, html){
      obj.fancybox({	
        'transitionIn'	: 'none',
        'transitionOut'	: 'fade',
        'overlayOpacity' : 0.15,
        'autoDimensions': true,
        'content' : html
      });
      return obj;
    },
    toolbar: {
      add_item: function(text, name){
        var r = '<a id="toolbarlink_' + name + '" href="javascript:void(0);">' + text + '</a>'
        return $j(r).appendTo($j('header'));
      },
      remove_item: function(name){},
      render: function(){
        var link = $j('<a href="javascript:void(0);">settings</a>').appendTo($j('header'));
        ui.dialog(link, $j('#settings_ui'));
      }
    },
    bootscreen: function(){
      
    }
  };
  
  var plugins = {
    add: function(name, fn){
      this.plugins[name] = fn;
    },
    all: function(){
      return this.plugins;
    },
    get: function(key){
      return this.plugins[key];
    },
    plugins: {},
    initialize: function(fn){
      each(this.plugins, function(plugin){
        plugin.initialize(fn);
      });
    }
  };
  
  var events = {
    app_ready: function(){
      $j("#view1").hide();
      $j('#view2').css('visibility', 'visible');
    },
    map_ready: function(){
      console.log("map ready");
      $mapper.tempmapfn();
    }
  };
  
  
  function geocode(query, gfn){
    
    function geocode_serverside(array, fn){
      var string = "";
      each(array, function(item){ 
        if(string!=""){string+=",";};
        string+=item;
      });
      
      $j.ajax({
        url: "geocode",
        dataType: "json",
        data: ({jupitermap : string}),
        success: function(result){
          var points = {};
          each(result, function(index, string){
            var a = string.split(",");
            var point = new google.maps.LatLng(a[1],a[0], 0);
            points[index] = point;
          });
          fn(points);
        },
        error: function(a, b, c){
          alert("Geocode was not successful for the following reason: " + b + "/n" + a);
        }
      });
    };
    function geocode_clintside(string, fn){
      geocoder = geocoder || new google.maps.Geocoder();
      geocoder.geocode( { 'address': string}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var point = results[0].geometry.location;
          window.xx = results;
          var res = {};
          res[string] = point;
          fn(res);
        }else{
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    };
    
    if(typeof(query) == "string"){ geocode_clintside(query, gfn); };
    if(typeof(query) == "object"){ geocode_serverside(query, gfn); };
    
  };
  
  function set_marker(parm, opt){
    
    function add_marker_to_map(point){
      
      
      for (first in point) break;
      point = point[first];
      
      console.log(point);
      var marker = new google.maps.Marker({
        map: gmap, 
        position: point,
        title: "ort"     
      });
      
      console.log(["_______", opt]);
      if(opt.html){
        var infowindow = new google.maps.InfoWindow({
            content: opt.html
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(gmap,marker);
        });
      };
      
      

      // google.maps.event.addListener(marker, 'mouseover', function() {
      //         infowindow.open(gmap,marker);
      //       });
      //       google.maps.event.addListener(marker, 'mouseout', function() {
      //         infowindow.close(gmap,marker);
      //       });
    };
    
    if(typeof(parm) == "string"){ geocode(parm, add_marker_to_map); };
    if(typeof(parm) == "object"){ add_marker_to_map(parm); };
      
  };
  
  function logger(nr, msg){
    console.log("debug("+nr+"): " + msg);
  };
  
  return {
    
    initialize: initialize,
    plugins: plugins,
    set_marker: set_marker,
    log: logger,
    ui: ui,
    events: events,
    geocode: geocode
  };
})();
 
  $mapper.plugins.add('facebook', (function(){
    var parent = $mapper;
    
    function initialize(fn){
      parent.log(1, "init facebook plugin");
      load_dependencies(function(){  
        parent.log(2, "facebook plugin: dependencies loaded");
        
        
        var set_current_user = function(response){
          if (response.session){ current_user = true; } else { current_user = false; };
          $mapper.ui.add_plugin_section( settings_ui() );
        };
        FB.getLoginStatus(function(r){set_current_user(r);});
        FB.Event.subscribe('auth.sessionChange', function(r){set_current_user(r);}); 
        
        //query(dialoggg);
        
        parent.ui.dialog(parent.ui.toolbar.add_item("Facebook Settings", "fb_settings"),function(){
          return settings_ui();
        });
        fn();
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
      var box = $j('<div><div>');
      var t = $j('<fieldset id="settings_ui_plugin_facebook"></fieldset>').appendTo(box);
      $j('<legend>Facebook</legend>').appendTo(t);
      $j('<section>Verbinde dich mit deinem Facebook-Konto und importiere die Daten.</section>').appendTo(t);
      var secl = $j('<section class="last"></section>').appendTo(t);
    
      if (current_user) {
          $j('<fb:facepile>').appendTo(secl);
      } else {
         $j('<img alt="" src="fb_login.gif" />').appendTo(secl).click(function(){FB.login();});
      };
      
      $j('<button>weiter</button>').attr('disabled', current_user?"":"true").appendTo(box).fancybox({content:fb_data_win});
      
      $j(box).appendTo($j('#hidden'));
      
      window.t = current_user;
      
      FB.XFBML.parse(box[0]);
      return box;
    };
    
    
    function fb_data_win(){ 
      parent.log(1, "facebook plugin: window");
      
      var result = $j('<div></div>');
      $j('<h1>Facebook</h1><hr />').appendTo(result);
      var table = $j('<table></table>').appendTo(result);
      var thead = $j('<thead></thead>').appendTo(table);
      $j('<tr></tr>').appendTo(thead).append('<th>Name</th>').append('<th>Heimatort</th>').append('<th>Wohnort</th>');;    
      
      
      
      query(function(friends){
        
        var orte = [];
        each(friends, function(friend){
          if(friend.hometown_location){orte.push(friend.hometown_location.city);}
          if(friend.current_location){orte.push(friend.current_location.city);}
        });
        parent.geocode(orte, function(points){
          
          each(friends, function(friend){
            each(points, function(index, point){
              if(index==(friend.hometown_location?friend.hometown_location.city:null)){ 
                if(!points[index].hometown_location){points[index].hometown_location = []; };
                points[index].hometown_location.push(friend); };
              if(index==(friend.current_location?friend.current_location.city:null)){ 
                if(!points[index].current_location){points[index].current_location = []; };
                points[index].current_location.push(friend); 
              }
              //console.log([index,friend.current_location]);
            });
          });
          console.log(["fb_points", points]);
          each(points, function(index, item){
            var point = new google.maps.LatLng(item.b,item.c, 0);
            parent.set_marker({index: point}, {html: "blabla"});
          });
        });
        
        
        
        function gL(obj){
          if(obj){
            var loc = obj.city +", "+ obj.country;
            //parent.set_marker(obj.city); 
            return loc;
          }
          else {return "-";};
        };      
        each(friends, function(item){
            var tr = $j('<tr></tr>').appendTo(table);
            $j('<td>'+ item.name +'</td>').appendTo(tr);    
            $j('<td>'+ gL(item.hometown_location) +'</td>').appendTo(tr);
            $j('<td>'+ gL(item.current_location) +'</td>').appendTo(tr);
        });
      });
      
      return result;  
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
