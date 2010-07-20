if(!console){var console = {};console.log = function(){};};
function cl(a,b){console.log(b,a);}


String.prototype.test = function(regex, params){
	return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
}
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

var DataRecord = function(options){
  this.data = {};
  this.id_counter = 0;
  
  for(var option in options){
    this[option] = options[options];
  };

  this.raise = function(event, obj){
    if( typeof( this[event] ) == "function"){
      var ret = this[event](obj);
      if(ret){return ret;}else{return obj;};
    }else{return obj;};
  };
};
DataRecord.prototype.add = function(obj){
  obj.id = this.id_counter++;
  obj = this.raise('before_add', obj);
  obj.id = this.id_counter++;
  this.data[obj.id] = obj;
  
  obj = this.raise('after_add', obj);

  return obj;
};
DataRecord.prototype.find = function(param){
  var _this = this;
  
  function find_by_string(query){
    var records = [];
    
    $j.each(_this.data, function(k, item){records.push(item);});
    
    query = query.toLowerCase().split(" "); 
    
    var record_auswahl = $j.grep(records, function(record){
    
      // setzte adressstring zusammen: Hans Müller 65781 Neuhausen
      var adresse = "";
      $j.each(record, function(key, value){
        if(typeof(value)=='string'){adresse += value + " ";};
      });
      adresse = adresse.toLowerCase();
    
      for(var key in query){
        if(!adresse.test(query[key])){return false;};
      };
      return true;
    });
      
    return record_auswahl;
  };
  function find_by_function(fn){
    var result = [];
    for(var key in _this.data){
      if(fn(this.data[key])){result.push(_this.data[key]);};
    };
    return result;
  };
  
  if(typeof(param)=='string'){return find_by_string(param);};
  if(typeof(param)=='function'){return find_by_function(param);};
};
DataRecord.prototype.find_by = function(key_string, value_string){
  return find(function(item){
    return item[key_string] == value_string;
  });
};
DataRecord.prototype.all = function(){return this.data};
DataRecord.prototype.set = function(id, key, val){this.data[id][key] = val;};
DataRecord.prototype.remove = function(key){return delete this.data[key];};
DataRecord.prototype.search = function(param){return this.find(param);};


var $j = jQuery.noConflict();
var gmap;


function t3(){
  console.log(3);
  
  this.is.done();
};


/*  Chain:
 
 *  var fn = function(){
 *    //do some stuff 
 *    this.is.done();
 *  }
 *  var chain = new Chain([fn, ...]);
 *  chain.start();

*/

function Chain(functions){
  $this = this;
  this.functions = functions || [];
  
  this.is = {};
  this.is.done = function(){ 
    var x = $this.functions.shift(); 
    if (x) {x.call($this);};
  };
  this.start = function(){this.is.done();};
};


/*  Log:
 
 *  var log = new Log();
 *
 *  log(0, "nuntia") <=> log.trace("nuntia") 
 *  => trace: nuntia 
 *  
 *  0: trace
 *  1: debug
 *  2: info
 *  3: warning
 *  4: error
 *  5: fatal

*/

function LLog(){
   var level_name = {
     0: "trace",
     1: "debug",
     2: "info",
     3: "warning",
     4: "error",
     5: "fatal"
   };
   this.log = function(level, o1, o2, o3, o4, o5){
     console.log(
       level_name[level] + ": ", 
       o1 ? o1 : "",
       o2 ? o2 : "",
       o3 ? o3 : "",
       o4 ? o4 : "",
       o5 ? o5 : ""
     );
   };
   
   this.log.trace       = function(o1, o2, o3, o4, o5){this(0, o1, o2, o3, o4, o5)};
   this.log.debug   = function(o1, o2, o3, o4, o5){this(1, o1, o2, o3, o4, o5)};
   this.log.info    = function(o1, o2, o3, o4, o5){this(2, o1, o2, o3, o4, o5)};
   this.log.warning = function(o1, o2, o3, o4, o5){this(3, o1, o2, o3, o4, o5)};
   this.log.error   = function(o1, o2, o3, o4, o5){this(4, o1, o2, o3, o4, o5)};
   this.log.fatal   = function(o1, o2, o3, o4, o5){this(5, o1, o2, o3, o4, o5)};
   
   return this.log;
};





var $mapper = (function(){
  
  var geocoder;
  var $this = this;
  
  this.options = {
    cluster: true,
    gridSize: 30,
    maxZoom: 12
  };
  
  
  this.initialize = function(){
    $j('#progress').animate({backgroundPosition: '0% 30%'}, 30000);
    
    var chain = new Chain([
      ui.body,
      ui.map,
      plugins.initialize,
      events.app_ready
    ]);
    chain.start();
    
  };
  
  this.ui = {
    body: function(){
      var r  = '<div id="view2">';
          //r += '<header></header>';
          //r += '<div id="headerline"></div>';
          r += '<div id="map_canvas"></div>';
          r += '<aside id="aside">';
            r += '<div id="searchbar">';
              r += '<button class="add"></button>';
              r += '<input type="text" class="search" />';
            r += '</div>';
            r += '<div class="content"><ul id="datenliste"></ul></div>';
          r += '</aside>';
          r += '<div id="hidden" style="display:none;"></div>';
          r += '</div>';
      $j(r).appendTo('body').css({visibility:'hidden'});
      $j("#searchbar input").keydown(function(e) {
        if(e.keyCode == 13) {
          var result = record.find(this.value);
          
          ui.sidebar.show(result);
        }
      });
      
      function set_height(){
        var h = $j("#aside").height();
        $j('#aside').find('.content').css('height', h-75);
      };
      $j(window).resize(set_height);
      set_height();
      
      log.info("ui.body ready");
      
      this.is.done();
    },
    map: function(fn){
      _this = this;
      
      var e = document.createElement('script'); 
          e.async = true;
          e.src = 'http://maps.google.com/maps/api/js?sensor=false&callback=$mapper.events.map_ready';
      $j("body").append(e);
      
      var stylez = [
        {
          featureType: "water",
          elementType: "all",
          stylers: [
            { gamma: 1.08 },
            { lightness: 22 },
            { saturation: 56 }
          ]
        },{
          featureType: "poi.park",
          elementType: "all",
          stylers: [
            { gamma: 0.98 },
            { lightness: 28 },
            { saturation: 3 }
          ]
        },{
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [
            { hue: "#ff001a" },
            { visibility: "simplified" },
            { saturation: -21 },
            { lightness: 62 }
          ]
        },{
          featureType: "road.arterial",
          elementType: "all",
          stylers: [
            { hue: "#eeff00" },
            { gamma: 1.17 },
            { saturation: -29 },
            { lightness: 46 }
          ]
        },{
          featureType: "administrative.country",
          elementType: "geometry",
          stylers: [
            { lightness: 20 },
            { saturation: -44 }
          ]
        },{
          featureType: "all",
          elementType: "labels",
          stylers: [
            { saturation: -40 },
            { lightness: 40 }
          ]
        },{
          featureType: "water",
          elementType: "labels",
          stylers: [

          ]
        }
      ];
      
      
       $mapper.tempmapfn = function(){
          var myLatlng = new google.maps.LatLng(50.08408, 8.2383918); //center:wiesbaden
          var myOptions = {
            zoom: 5,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          gmap = new google.maps.Map($j("#map_canvas")[0], myOptions);
          
          var styledMapOptions = {
                map: gmap,
                name: "light"
            }

            var jayzMapType =  new google.maps.StyledMapType(stylez,styledMapOptions);

            gmap.mapTypes.set('light', jayzMapType);
            gmap.setMapTypeId('light');
          
          log.info('ui.map ready');
          _this.is.done();
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
    sidebar: {
      show: function(obj){
        
        var ids = [];
        for(var item in obj){ids.push(obj[item].id);};
        
        var x = $j("#datenliste li").hide().filter(function(){
          var id = $j(this).data("record_id");
          var inarray = false;
          for(var item in ids){if(id==ids[item]){inarray=true;};};
        
          return inarray
        }).show();
      }
    },
    bootscreen: function(){
      
    }
  };
  
  this.plugins = (function(){
    
    function add(name, fn){
      plugins[name] = fn;
    };
    
    function all(){
      return plugins;
    };
    
    function get(key){
      return plugins[key];
    };
    
    var plugins = {};
    
    function initialize(){ 
      var _this = this;
      each(plugins, function(plugin){
        plugin.initialize(function(){
          _this.is.done();
        });
      });
    };
    
    return {
      add: add,
      all: all,
      get: get,
      initialize: initialize
    };
  })();
  
  this.events = {
    app_ready: function(){
      $j("#view1").hide();
      $j('#view2').css('visibility', 'visible');
      this.is.done();
      
      if(document.location.hash.substring(1)=="gemeinde"){
        $this.log.trace($this.plugins.get("gemeinde").render());
      };
      
      $this.log.trace("pl fb: ", $mapper.plugins.get("facebook"));
      $mapper.plugins.get("facebook").modal(function(box){
        return new Modal(box, true);
      });
      
    },
    map_ready: function(){
      $mapper.tempmapfn();
    }
  };
  this.fireEvent = function(event){
    $this.log.info(event);
    
  };
  
  this.geocode = function(query, gfn){
    
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
  

  this.render_cluster = function(marker_array){
    if($this.options.cluster){
      var mcOptions = {gridSize: $this.options.gridSize, maxZoom: $this.options.maxZoom};
      var markerCluster = new MarkerClusterer(gmap, marker_array, mcOptions);
    };
  };
  
  this.Marker = function(parm){

    if(!opt){var opt = {};};
    
    function add_marker_to_map(opt){
      if(!opt.point){throw "$mapper.set_marker: point is not defined"};
      
      var marker_options = {position: opt.point};
      if(!$this.options.cluster){marker_options.map = gmap;};
      if(opt.title){marker_options.title = opt.title;};       
      var marker = new google.maps.Marker(marker_options);
      
      return marker;
    };
    
    if(typeof(parm) == "string"){ return geocode(parm, add_marker_to_map); };
    if(typeof(parm) == "object"){ return add_marker_to_map(parm, opt); };
      
  };
  
  var xxmarker = {
    devaul_t: function(){
      var image = new google.maps.MarkerImage('yellow_marker_sprite.png',
          // This marker is 20 pixels wide by 32 pixels tall.
          new google.maps.Size(20, 34),
          // The origin for this image is 0,0.
          new google.maps.Point(0,0),
          // The anchor for this image is the base of the flagpole at 0,32.
          new google.maps.Point(10, 34));
        
      var shadow = new google.maps.MarkerImage('yellow_marker_sprite.png',
          // The shadow image is larger in the horizontal dimension
          // while the position and offset are the same as for the main image.
          new google.maps.Size(54, 34),
          new google.maps.Point(29,0),
          new google.maps.Point(29, 34));
               
      // Shapes define the clickable region of the icon.
      // The type defines an HTML &lt;area&gt; element 'poly' which
      // traces out a polygon as a series of X,Y points. The final
      // coordinate closes the poly by connecting to the first
      // coordinate.
      var shape = {
          coord: [1, 1, 1, 20, 18, 20, 18 , 1],
          type: 'poly'
      };
      
      return {image: image, shadow:shadow, shape:shape};
   
    },
    yellow: ""
  }
  
  this.Infowindow = function(opt){
    if(opt.html){
      var infowindow = new google.maps.InfoWindow({content: opt.html});
      google.maps.event.addListener(opt.marker, 'click', function() {
        
        if(window.openinfowindow){window.openinfowindow.close();};
        infowindow.open(gmap,opt.marker);
        window.openinfowindow = infowindow;
      });
    };
    return infowindow;
  };


  this.record = new DataRecord;
  this.record.before_add = function(obj){
    var Straße = obj.strasse ? obj.strasse : " - ";
    var Ort = obj.plz && obj.ort ? obj.plz + " " + obj.ort : " - ";
    var Land = obj.land ? obj.land : " - ";
    var Adresse = Straße + ", " + Ort + ", " + Land;
    obj.adresse = Adresse;
    
    return obj;
  };
  this.record.after_add = function(obj){
    sidebar.add(obj);
  };
  
  
  var sidebar = {
    add: function(obj){
      var li = $j('<li></li>').appendTo($j('#datenliste'));
      $j('<strong>'+obj.title+'</strong><br />').appendTo(li);
      $j('<small>'+obj.adresse+'</small><br />').appendTo(li);
      
      $j(li).data("record_id", obj.id);
      
      li.click(this.click);
      
      return li;
    },
    click: function(){      
      var id = $j(this).data("record_id");
      var obj = record.all()[id];
      
      if(window.openinfowindow){window.openinfowindow.close();};
      obj.infowindow.open(gmap,obj.marker);
      window.openinfowindow = obj.infowindow;
    }
  };
  
  function Modal(html, init_open){
    var el;
    this.close = function(){
      return el.hide();
    };
    
    this.nevv = function(){
      el = $j('<div id="modal"></div>').append($j(html)).appendTo($j("body")).hide();
      if(init_open){this.open()};
    };
    
    this.open = function(){
      var h = $j(el).outerHeight(),
          w = $j(el).outerWidth(),
          w_sidebar = $j('#aside').outerWidth(),
          css = {
            'margin-left': -(w/2)-(w_sidebar/2),
            'margin-top': -(h/2)
          };
      $this.log.trace(w_sidebar);    
      return el.css(css).show();
    };
    
    this.nevv();
  };
  
  
  this.log = new LLog();
  
  
 
  return { 
      initialize: this.initialize,
         plugins: this.plugins,
          Marker: this.Marker,
             log: this.log,
              ui: this.ui,
          events: this.events,
         geocode: this.geocode,
          record: this.record,
         cluster: this.marker_cluster,
  set_infowindow: this.Infowindow,
  render_cluster: this.render_cluster
  };
})();
 
  $mapper.plugins.add('facebook', (function(){
    var parent = $mapper;
    
    function initialize(fn){
      parent.log.info("init facebook plugin");
      load_dependencies(function(){  
        parent.log.info("facebook plugin: dependencies loaded");
        
        
        var set_current_user = function(response){
          if (response.session){ current_user = true; } else { current_user = false; };
          $mapper.ui.add_plugin_section( settings_ui() );
        };
        FB.getLoginStatus(function(r){set_current_user(r);});
        FB.Event.subscribe('auth.sessionChange', function(r){set_current_user(r);}); 
        
        //query(dialoggg);
        
        //parent.ui.dialog(parent.ui.toolbar.add_item("Facebook Settings", "fb_settings"),function(){
        //  return settings_ui();
        //});
        fn();
      });
    };
    
    function load_dependencies(fn){
      parent.log.info("facebook plugin: load_dependencies");
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
      parent.log.info("facebook plugin: settings_ui");
      var box = $j('<div><div>');
      /*
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
      */
      return box;
    };
    
    
    function fb_data_win(){ 
      parent.log.info("facebook plugin: window");
      
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
            var html = $j('<div></div>');
            html.append($j('<h3>'+index+'<h3>'));
            html.append($j('<div>hometown_location:</div>'));
            if(item.hometown_location){
              each(item.hometown_location, function(friend){
                html.append('<fb:profile-pic uid="'+friend.uid+'" linked="true" size="square"></fb:profile-pic>');
              });
            }else{
              html.append(' - ');
            };
            html.append($j('<div>current_location:</div>'));
            if(item.current_location){
              each(item.current_location, function(friend){
                html.append('<fb:profile-pic uid="'+friend.uid+'" linked="true" size="square"></fb:profile-pic>');
              });
            }else{
              html.append(' - ');
            };
            $j(html).appendTo($j('#hidden'));
            FB.XFBML.parse(html[0]);
            parent.set_marker({index: point}, {html: html[0]});
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
      parent.log.info("facebook plugin: query");
      var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
          query.wait(function(result){ fn(result); });
    };
    
    
  
    function login(content){
      
      var loading = $j('<div>Connecting Facebook</span><img src="loadinfo.net.gif" alt="loading"/></div>').css("text-align", "center");
      content.replaceWith(loading); 
      parent.log.trace("loading_el: ", loading);
      FB.login(cb, { perms: 'friends_hometown,friends_location' });
      function cb(response){
        parent.log.trace('FB.login callback', response);
        if (response.session) {
          parent.log.info('Facebook: User is logged in');

          var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
          query.wait(function(result){ 
            parent.log.trace("Facebook Query: ", query);
            loading.replaceWith($j('<span>geladen<span/>'));
          });
      
        } else {
          parent.log.info('Facebook: User isn\'t logged in');
        };
      };

    };

    this.modal = function(new_modal_fn){
      var box = $j("<div></div>");

      box.append($j("<h3>Facebook</h3><hr />"));
      var content = $j('<section></section>').appendTo(box);
      $j('<img src="facebook_connect.gif" alt="facebook connect" class="button"/>').appendTo(content).click(function(){login(content);});

      var footer = $j("<footer><hr/></footer>").appendTo(box);
      var abbruch = $j('<a href="javascript:;">abbrechen</a>').appendTo(footer);



      var modal = new_modal_fn(box);
      abbruch.click(modal.close);
    };


    
        
        
    return {
      initialize: initialize,
      settings_ui: settings_ui,
      modal: this.modal
    };
  })());
  
  
  $mapper.plugins.add('gemeinde', (function(){
    var parent = $mapper;
    
    var menschen = [];
    function initialize(fn){
      parent.log.info("init gemeinde plugin");
      load_dependencies(function(){  
        fn();
      });
      $j('#searchbar button').click(show_menschen);
    };
    
    function load_dependencies(fn){
      $j.get("gemeinde.xml", function(xml){
        
        window.xml = xml;
        
        $j(window.xml).find("mensch").each(function(key, item){
          item = $j(item);
          a = item.find("geocode point coordinates").text().split(",");
          var mensch = {
            vorname: item.find("vorname").text(),
            nachname: item.find("nachname").text(),
            strasse: item.find("strasse").text(),
            ort: item.find("ort").text(),
            plz: item.find("plz").text(),
            point: new google.maps.LatLng(a[1],a[0], 0)
          };
          if(!window.item){window.item = item};
          menschen.push(mensch);
          
        });
        
        window.ff = menschen;
        fn();
      });
    };
    
    function show_menschen(){
      var markers = [];
      $j.each(menschen, function(key, item){
        
        var html = $j("<address></address>");
        html.append(item.vorname + " " + item.nachname).append("<br />");
        html.append(item.strasse).append("<br />");
        html.append(item.plz + " " + item.ort).append("<br />");
        
        var obj = {
          title: item.vorname + " " + item.nachname,
          plz: item.plz,
          ort: item.ort,
          point: item.point,
          html: html[0]
        };
        
        var dataobj = parent.record.add(obj);
        
        var marker = new parent.Marker({point:item.point, title:obj.title});
        parent.record.set(dataobj.id, "marker", marker);
        markers.push(marker);
        
        var infowindow = new parent.set_infowindow(dataobj);
        parent.record.set(dataobj.id, "infowindow", infowindow);
        
      });
      
      parent.render_cluster(markers);
    };
    
    
    
    return {
      initialize: initialize,
      render: show_menschen
    };
  })());
 
$j(document).ready(function($){
  $mapper.initialize();
});
