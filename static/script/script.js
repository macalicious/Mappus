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


/*  
 *  Mapperobject
 *  {
 *    titel: String
 *    items: Array of MarkerObjects
 *    
 *  }
 *
 *  MarkerObject 
 *  {
 *    search_string: String
 *    point: GMap_Point
 *    marker: GMap_Marker
 *    infowindow: GMap_Infowindow
 *    info_html: "string"
 *    visible: Boolean 
 *  }
 */ 


function DevTool(){
  var toolbar = $j('<div id="devtool"></div>').appendTo($j("body")); 
  toolbar.css({
    'display': 'none',
    'position': 'absolute',
    'top': 0,
    'left': 0,
    'z-index': 999,
    'background': '#ffffff'
  });
  $j('<a href="javascript:;">relode CSS</a>').click(relodeCSS).appendTo(toolbar);
  
  function open(){
    toolbar.fadeIn('fast');
  };
  function close(){
    toolbar.fadeOut('fast');
  };
  
  function relodeCSS(){
    void(function(){var i,a,s;a=document.getElementsByTagName('link');for(i=0;i<a.length;i++){s=a[i];if(s.rel.toLowerCase().indexOf('stylesheet')>=0&&s.href) {var h=s.href.replace(/(&|%5C?)forceReload=\d+/,'');s.href=h+(h.indexOf('?')>=0?'&':'?')+'forceReload='+(new Date().valueOf())}}})();
  };
  
  $j(document).bind('mousemove',function(e){ 
      if(e.pageY < 20){
        open();
      } else if(e.pageY > 30){
        close();
      };
  });
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
              r += '<button class="add"><div class="inner">+</div></button>';
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
      $j("#searchbar").click(function(){
        void(function(){var i,a,s;a=document.getElementsByTagName('link');for(i=0;i<a.length;i++){s=a[i];if(s.rel.toLowerCase().indexOf('stylesheet')>=0&&s.href) {var h=s.href.replace(/(&|%5C?)forceReload=\d+/,'');s.href=h+(h.indexOf('?')>=0?'&':'?')+'forceReload='+(new Date().valueOf())}}})();
      });
      function set_height(){
        var h = $j("#aside").height();
        $j('#aside').find('.content').css('height', h-38);
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
      var strings = {};
      for(var key in array){
         strings[key] = array[key];
      };
     
      //string = string.replace(/\s*[,]*\s+/g ,"+");
      //string = string.replace(/&/g ,",");
      $this.log.trace("strings: ",strings);
      $j.ajax({
        url: "geocode",
        dataType: "json",
        data: ({jupitermap : strings}),
        success: function(result){
          console.log("geocode_serverside fertig", result);
          var points = {};
          each(result, function(index, string){
            var a = string.split(",");
            var point = new google.maps.LatLng(a[1],a[0], 0);
            points[index] = point;
          });
          console.log(points);
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
      console.log(opt);
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
      var li = $j('<li class="item"></li>').appendTo($j('#datenliste'));
      $j('<strong>'+obj.title+'</strong><br />').appendTo(li);
      $j('<small> '+obj.ort+', '+obj.land+'</small><br />').appendTo(li);
      $this.log.trace(obj);
      var adressen = $j('<ul class="adressen slide"></ul>').appendTo(li).click(function(){return false;});
      var fff = ["Nr 1", "Nr 2"];
      
      for(var key in fff){
        adressen.append("<li>"+fff[key]+"</li>");
      };
      
      $j(li).data("record_id", obj.id);
      
      li.click(this.click);
      
      return li;
    },
    click: function(){
      var li = $j(this);
      var slide = li.find('.slide');
      var is_slide = slide.length != 0;
      
      
      if(window.active_mensch){
        window.active_mensch.removeClass("active");
        
        if(is_slide){
          window.active_mensch.animate({"margin-bottom": 0},"fast");
          window.active_mensch.find('.slide').slideUp("fast");
        };
        
        if(window.active_mensch.html() == li.html()){
          window.active_mensch = false; 
          return;
        };
      };
      
      window.active_mensch = li.addClass("active");
      
      if(is_slide){
        li.animate({
          'margin-bottom': slide.height()+5
          }, "fast");
        slide.slideDown("fast");
      };
            
      var id = li.data("record_id");
      var obj = record.all()[id];
      
      if(!is_slider){
        this.click_to_marker(obj);
      }; 
    },
    click_to_marker: function(obj){
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
        
        /*
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
        */
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
    
    var modal_content;
    var modal;
    
    function ui(name, options){
      var x = modal_content;
      switch(name){
        case "facebook":
          x.empty();
          x.append($j("<h3>Facebook</h3><hr />"));
          x.append($j('<section class="content"><img src="image/facebook_connect.gif" alt="facebook connect" class="button"/></section>').click(login));
          break
        case "loading":
          var x = x.find(".content").empty();
          parent.log.trace(x);
          x.append($j('<div>Wird geladen </span> <img src="image/loadinfo.net.gif" alt="loading" class="loading"/></div>').css("text-align", "center"));
          break;
        case "result":
          var x = x.find(".content").empty();
          var freunde = options.freunde;
          //x.append($j("<h3>Facebook</h3><hr />"));
          //x.append($j('<section class="content"><img src="facebook_connect.gif" alt="facebook connect" class="button"/></section>')
          
          var geladen = $j('<p></p>').appendTo(x);
          geladen.append($j('<span><b>'+freunde.alle.length+'</b> Freunde &nbsp; </span>'));
          geladen.append($j('<span><b>'+freunde.mit_adresse.length+'</b> Freunde mit Adresse &nbsp; </span>'));
          geladen.append($j('<span><b>'+freunde.alle_adressen_length+'</b> Adressen gesamt &nbsp; </span>'));
          
          var form = $j('<fieldset class="large" id="form"></fieldset>').html(
            '<span class="input"><input type="checkbox" id="home" checked value="home" /> <label for="home">Heimatort</label></span>'
            + ' <span class="input"><input type="checkbox" id="current" checked value="current" /> <label for="current">Aktueller Wohnort</label></span>'
            + '<br/>der Freunde auf der Karte anzeigen.'
          ).appendTo(x);
          
          var weiter = modal_content.next().append($j(' <a href="javascript:;" class="big">Anzeigen</a>')).click(options.click_anzeigen);
          break;
        case "allgemein":
          x.empty();
          $j('<h3>Hallo</h3><hr/>').appendTo(x);
          break;
        case "gemeinde":
          x.empty();
          $j('<h3>Gemeinde</h3><hr/>').appendTo(x);
          break;
      };
      return x;
    }
  
    function login(){
      
      ui("loading");
      FB.login(fb_login_cb, { perms: 'friends_hometown,friends_location' });
      
      function fb_login_cb(response){
        parent.log.trace('FB.login callback', response);
        if (response.session) {
          parent.log.info('Facebook: User is logged in');
          fb_querry(fb_query_cb);
        } else {
          parent.log.info('Facebook: User isn\'t logged in');
          ui("facebook");
        };
      };
        
      function fb_query_cb(result){
        parent.log.trace("Facebook Query: ", {result:result});
        //parent.log.trace("Facebook Query in JSON: ", JSON.stringify(result));
        //alert(JSON.stringify(result));
        var freunde = (function(result){
          var id_counter = 0;
          var freunde_mit_adresse = [];
          var adressen = {};     
          for(var key in result){
            var freund = result[key];
            if(freund.current_location || freund.hometown_location){

              if(freund.current_location){
                var f = freund.current_location;
                adressen[id_counter] =  f.city+", "+f.state+", "+f.country;
                freund.current_location.geoid = id_counter;
                id_counter++;
              };
              if(freund.hometown_location && freund.current_location != freund.hometown_location){
                var f = freund.hometown_location;
                adressen[id_counter] = f.city+", "+f.state+", "+f.country;
                freund.hometown_location.geoid = id_counter;
                id_counter++;
              };

              freunde_mit_adresse.push(freund);
            };
          };
          return {
            mit_adresse: freunde_mit_adresse,
            alle_adressen: adressen,
            alle_adressen_length: id_counter,
            alle: result
          };
        })(result);

        ui("result", {
          freunde:freunde, 
          click_anzeigen: function(){ anzeigen(freunde); }
        });
        //parent.log.trace("Facebook Query in JSON: ", JSON.stringify(freunde['mit_adresse']));
      };
    
      function anzeigen(freunde){
      
        // which locations should be shown?
        var home = false, current = false;
        modal_content.find(":checked").each(function(key, item){
          if(item.value=="home"){home=true;};
          if(item.value=="current"){current=true;};
        });
      
        parent.log.trace("adressen: ", freunde.alle_adressen);
        window.fb_freundee = freunde;
        ui("loading");
        parent.geocode(freunde.alle_adressen, function(pos){fb_geocode(pos, freunde, home, current);});
        parent.log.trace("adressen JSon: ", freunde.alle_adressen);
      };
      
    };
    
    function fb_querry(cb){
      var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
      query.wait(cb);
    };
    
    function fb_geocode(positionen, freunde, home, current){
      parent.log.trace("geocode result: ", positionen );
      
      var markers = [];
      function add_marker(freund, loc){
        var html = $j("<address></address>");
        html.append('<span>'+freund.name+'</span>').append("<br />");
        html.append('<span>'+loc.city+", "+loc.state+", "+loc.country+'</span>').append("<br />");

        var obj = {
          title: freund.name,
          point: loc.point,
          html: html[0]
        };

        var dataobj = parent.record.add(obj);

        var marker = new parent.Marker({point:obj.point, title:obj.title});
        parent.record.set(dataobj.id, "marker", marker);
        markers.push(marker);

        var infowindow = new parent.set_infowindow(dataobj);
        parent.record.set(dataobj.id, "infowindow", infowindow);
        
      };
      
      
      for(var key in freunde.mit_adresse){
        var freund = freunde.mit_adresse[key];
        if(current && freund.current_location){
          freund.current_location.point = positionen[freund.current_location.geoid];
          add_marker(freund, freund.current_location);
        };
        if(home && freund.hometown_location && freund.current_location != freund.hometown_location){
          freund.hometown_location.point = positionen[freund.hometown_location.geoid];
          add_marker(freund, freund.hometown_location);
        };
      
      };
      modal.close();
      parent.render_cluster(markers);
      
    };
    
    this.modal = function(new_modal_fn){
      var box = $j("<div></div>");
      var nav = $j("<nav></nav>").appendTo(box);
      
      function modal_change(nr){
        box.find("nav a").removeClass("active");
        box.find("nav a").eq(nr).addClass("active");
        switch(nr){
          case 0:
            ui("allgemein");
            break;
          case 1:
            ui("facebook");
            break;
          case 2:
            ui("gemeinde");
            break;
        };
      };
      //.toggleClass()
      nav.append($j('<a href="javascript:;">Allgemein</a>').click(function(){modal_change(0)}));
      nav.append($j('<a href="javascript:;" class="active">Facebook</a>').click(function(){modal_change(1)}));
      nav.append($j('<a href="javascript:;">Gemeinde</a>').click(function(){modal_change(2)}));
      
      var content = $j('<section></section>').appendTo(box);
      modal_content = content;
      ui("facebook");
      
      var footer = $j("<footer><hr/></footer>").appendTo(box);
      var abbruch = $j('<a href="javascript:;">abbrechen</a>').appendTo(footer);
      
      modal = new_modal_fn(box);
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
            point: new google.maps.LatLng(a[1],a[0], 0),
            land: item
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
        parent.log.trace('# #', item);
        var obj = {
          title: item.vorname + " " + item.nachname,
          plz: item.plz,
          ort: item.ort,
          strasse: item.strasse,
          land: item.land,
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
  new DevTool();
});

var fb_freunde = {
    "mit_adresse": [{
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 0
        },
        "name": "Meret Mueller",
        "uid": "569011024"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 1
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 2
        },
        "name": "Patrick Litsch",
        "uid": "583577848"
    },
    {
        "current_location": {
            "city": "Utrecht",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "id": "103157243058555",
            "name": "Utrecht, Utrecht",
            "geoid": 3
        },
        "hometown_location": {
            "city": "Utrecht",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "id": "103157243058555",
            "name": "Utrecht, Utrecht",
            "geoid": 4
        },
        "name": "Eline Rentinck",
        "uid": "595599117"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 5
        },
        "hometown_location": {
            "city": "Ankara",
            "state": "Ankara",
            "country": "Turkey",
            "zip": "",
            "id": "106478736056198",
            "name": "Ankara, Turkey",
            "geoid": 6
        },
        "name": "Ebru Ceyhan",
        "uid": "600042730"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 7
        },
        "name": "Verena Flemming",
        "uid": "608581275"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 8
        },
        "hometown_location": null,
        "name": "Sarah Weinerth",
        "uid": "632018419"
    },
    {
        "current_location": {
            "city": "Bangkok",
            "state": "Krung Thep",
            "country": "Thailand",
            "zip": "",
            "id": "110585945628334",
            "name": "Bangkok, Thailand",
            "geoid": 9
        },
        "hometown_location": {
            "city": "Bogotu00e1",
            "state": "Cundinamarca",
            "country": "Colombia",
            "zip": "",
            "id": "102194039822307",
            "name": "Bogotu00e1, Colombia",
            "geoid": 10
        },
        "name": "Stephan Klein Gu00f3mez",
        "uid": "642153901"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Houten",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "geoid": 11
        },
        "name": "Roosmarijn de Groot",
        "uid": "647366163"
    },
    {
        "current_location": {
            "city": "Montpellier",
            "state": "Languedoc-Roussillon",
            "country": "France",
            "zip": "",
            "id": "115100621840245",
            "name": "Montpellier, France",
            "geoid": 12
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 13
        },
        "name": "Agnieszka Kowalski",
        "uid": "684613604"
    },
    {
        "current_location": {
            "city": "Essen",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "108402229182110",
            "name": "Essen, Nordrhein-Westfalen",
            "geoid": 14
        },
        "hometown_location": {
            "city": "Bochum",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "106544749381682",
            "name": "Bochum, Germany",
            "geoid": 15
        },
        "name": "Anna FrOst",
        "uid": "723909599"
    },
    {
        "current_location": {
            "city": "Erbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "108639415825703",
            "name": "Erbach, Hessen, Germany",
            "geoid": 16
        },
        "hometown_location": {
            "city": "Erbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "108639415825703",
            "name": "Erbach, Hessen, Germany",
            "geoid": 17
        },
        "name": "Anja Faust",
        "uid": "1039324314"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 18
        },
        "name": "Lena Schilling",
        "uid": "1118155519"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 19
        },
        "hometown_location": null,
        "name": "Sarissa Labil",
        "uid": "1124704110"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 20
        },
        "name": "Svenja Schu00fctz",
        "uid": "1150745773"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 21
        },
        "name": "Julia Heyer",
        "uid": "1155277257"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Velten",
            "state": "Brandenburg",
            "country": "Germany",
            "zip": "",
            "id": "113559861991038",
            "name": "Velten",
            "geoid": 22
        },
        "name": "Esther Keidel",
        "uid": "1159037092"
    },
    {
        "current_location": {
            "city": "Jerusalem",
            "state": "Yerushalayim",
            "country": "Israel",
            "zip": "",
            "id": "106401656063896",
            "name": "Jerusalem, Israel",
            "geoid": 23
        },
        "hometown_location": null,
        "name": "Kyrill u05e7u05d9u05e8u05d9u05dc Ahlvers",
        "uid": "1159430744"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 24
        },
        "name": "Tobias Bauer",
        "uid": "1167428259"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 25
        },
        "hometown_location": null,
        "name": "Chantal Rheinheimer",
        "uid": "1176843674"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 26
        },
        "name": "Elisa Seip",
        "uid": "1185716888"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 27
        },
        "name": "Annika Geiu00df",
        "uid": "1198147613"
    },
    {
        "current_location": {
            "city": "Darmstadt",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 28
        },
        "hometown_location": null,
        "name": "Sandra Hu00e4nsel",
        "uid": "1201635326"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Darmstadt",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 29
        },
        "name": "Micha Brockmann",
        "uid": "1202085567"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 30
        },
        "name": "Sandra Orth",
        "uid": "1215487867"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 31
        },
        "name": "Franzi Sophie R",
        "uid": "1246563698"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 32
        },
        "name": "Corinna Eulberg",
        "uid": "1246746409"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 33
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 34
        },
        "name": "Marc Reif",
        "uid": "1278395189"
    },
    {
        "current_location": {
            "city": "Auckland",
            "state": "Auckland",
            "country": "New Zealand",
            "zip": "",
            "id": "101883149853721",
            "name": "Auckland, New Zealand",
            "geoid": 35
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 36
        },
        "name": "Brabra Lu00fcbbering",
        "uid": "1300551973"
    },
    {
        "current_location": {
            "city": "Montgiscard",
            "state": "Midi-Pyrenees",
            "country": "France",
            "zip": "",
            "id": "109088189125777",
            "name": "Montgiscard, Midi-Pyrenees, France",
            "geoid": 37
        },
        "hometown_location": null,
        "name": "Luc Gu00e9raud",
        "uid": "1315743040"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 38
        },
        "name": "Julia Link",
        "uid": "1342423654"
    },
    {
        "current_location": {
            "city": "Gieu00dfen",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110305888999535",
            "name": "Gieu00dfen, Germany",
            "geoid": 39
        },
        "hometown_location": null,
        "name": "Flo Reinecke",
        "uid": "1366306640"
    },
    {
        "current_location": {
            "city": "Greifenstein",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "107911935898693",
            "name": "Greifenstein",
            "geoid": 40
        },
        "hometown_location": {
            "city": "Bremen",
            "state": "Bremen",
            "country": "Germany",
            "zip": "",
            "id": "115221125158582",
            "name": "Bremen, Germany",
            "geoid": 41
        },
        "name": "Hartmut Constien",
        "uid": "1367469594"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 42
        },
        "name": "Katharina von Haugwitz",
        "uid": "1418110619"
    },
    {
        "current_location": {
            "city": "Heidelberg",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "114466755232742",
            "name": "Heidelberg, Germany",
            "geoid": 43
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 44
        },
        "name": "Enya Gauch",
        "uid": "1427857241"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Breckenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "111815215511878",
            "name": "Breckenheim",
            "geoid": 45
        },
        "name": "Florian Schwarz",
        "uid": "1432591039"
    },
    {
        "current_location": {
            "city": "Zunsweier",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "104908456211489",
            "name": "Zunsweier, Baden-Wurttemberg, Germany",
            "geoid": 46
        },
        "hometown_location": null,
        "name": "Sandra Helena Meyer",
        "uid": "1438024794"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Verden",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "112162582134780",
            "name": "Verden, Germany",
            "geoid": 47
        },
        "name": "Annika Vetter",
        "uid": "1475807302"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 48
        },
        "name": "Jonathan Schmidt",
        "uid": "1479588492"
    },
    {
        "current_location": {
            "city": "Vienna",
            "state": "Wien",
            "country": "Austria",
            "zip": "",
            "id": "111165112241092",
            "name": "Vienna, Austria",
            "geoid": 49
        },
        "hometown_location": {
            "city": "Brandon",
            "state": "South Dakota",
            "country": "United States",
            "zip": "",
            "id": "106142586083813",
            "name": "Brandon, South Dakota",
            "geoid": 50
        },
        "name": "Madeleine Suchy",
        "uid": "1498230208"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 51
        },
        "name": "Anissa Sander",
        "uid": "1499499073"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Bremen",
            "state": "Bremen",
            "country": "Germany",
            "zip": "",
            "id": "115221125158582",
            "name": "Bremen, Germany",
            "geoid": 52
        },
        "name": "Anna Dittmer",
        "uid": "1508681974"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 53
        },
        "name": "Svenja Lorenz",
        "uid": "1510065437"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Steeden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "115930221751606",
            "name": "Steeden, Hessen, Germany",
            "geoid": 54
        },
        "name": "Fabian Fink",
        "uid": "1527611558"
    },
    {
        "current_location": {
            "city": "Walluf",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "116028331745026",
            "name": "Walluf, Hessen, Germany",
            "geoid": 55
        },
        "hometown_location": {
            "city": "Geisenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "109662679052177",
            "name": "Geisenheim",
            "geoid": 56
        },
        "name": "Julia Zschu00e4tzsch",
        "uid": "1555506007"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 57
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 58
        },
        "name": "Frederik Bissinger",
        "uid": "1574853006"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Stuttgart",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112089218817486",
            "name": "Stuttgart, Germany",
            "geoid": 59
        },
        "name": "Ina Kaufmann",
        "uid": "1581789376"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Radevormwald",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "geoid": 60
        },
        "name": "Franziska Elisabeth Bracht",
        "uid": "1595663373"
    },
    {
        "current_location": {
            "city": "Steeden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "115930221751606",
            "name": "Steeden, Hessen, Germany",
            "geoid": 61
        },
        "hometown_location": null,
        "name": "Vanessa Kunath",
        "uid": "1606015650"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Oberursel",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "107794739255070",
            "name": "Oberursel",
            "geoid": 62
        },
        "name": "Nicole Du00f6rner",
        "uid": "1705256168"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 63
        },
        "name": "Morten Nerlich",
        "uid": "1719537899"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 64
        },
        "hometown_location": null,
        "name": "Miriam Ku00f6nig",
        "uid": "1720159289"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 65
        },
        "hometown_location": null,
        "name": "Morgen La T",
        "uid": "1746503538"
    },
    {
        "current_location": {
            "city": "Siegen",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "106364406066894",
            "name": "Siegen, Germany",
            "geoid": 66
        },
        "hometown_location": {
            "city": "Witten",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "111526388866101",
            "name": "Witten, Germany",
            "geoid": 67
        },
        "name": "Charlotte Kossler",
        "uid": "1780874872"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Itzehoe",
            "state": "Schleswig-Holstein",
            "country": "Germany",
            "zip": "",
            "id": "110650918962346",
            "name": "Itzehoe, Germany",
            "geoid": 68
        },
        "name": "Alexander Kraft",
        "uid": "1798381011"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 69
        },
        "name": "Sascha Seitz",
        "uid": "1810521248"
    },
    {
        "current_location": {
            "city": "Freiburg im Breisgau",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "107094909321044",
            "name": "Freiburg Im Breisgau, Baden-Wurttemberg, Germany",
            "geoid": 70
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 71
        },
        "name": "Florian Best",
        "uid": "1817734300"
    },
    {
        "current_location": {
            "city": "Pu00e9cs",
            "state": "Pecs",
            "country": "Hungary",
            "zip": "",
            "id": "104083222960076",
            "name": "Pu00e9cs",
            "geoid": 72
        },
        "hometown_location": null,
        "name": "Bibi Tillmann",
        "uid": "1849787266"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Marburg an der Lahn",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "106842329347504",
            "name": "Marburg An Der Lahn, Hessen, Germany",
            "geoid": 73
        },
        "name": "Christina Heicke",
        "uid": "1849914432"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 74
        },
        "name": "Lythunder Deal",
        "uid": "100000063447941"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Westerburg",
            "state": "Rheinland-Pfalz",
            "country": "Germany",
            "zip": "",
            "id": "105593319474851",
            "name": "Westerburg",
            "geoid": 75
        },
        "name": "Myriam Scheiner",
        "uid": "100000119780452"
    },
    {
        "current_location": {
            "city": "Johannesburg",
            "state": "Gauteng",
            "country": "South Africa",
            "zip": "",
            "id": "108151539218136",
            "name": "Johannesburg, Gauteng",
            "geoid": 76
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 77
        },
        "name": "Anna Hu00f6nig",
        "uid": "100000178047127"
    },
    {
        "current_location": {
            "city": "Hannover",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "107926389240913",
            "name": "Hannover, Germany",
            "geoid": 78
        },
        "hometown_location": null,
        "name": "Simon Bru00fcckmann",
        "uid": "100000226364932"
    },
    {
        "current_location": {
            "city": "Saginaw",
            "state": "Michigan",
            "country": "United States",
            "zip": "",
            "id": "107838192572373",
            "name": "Saginaw, Michigan",
            "geoid": 79
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 80
        },
        "name": "Lydi Fink",
        "uid": "100000287253817"
    },
    {
        "current_location": {
            "city": "Johannesburg",
            "state": "Gauteng",
            "country": "South Africa",
            "zip": "",
            "id": "108151539218136",
            "name": "Johannesburg, Gauteng",
            "geoid": 81
        },
        "hometown_location": null,
        "name": "Esther Figge",
        "uid": "100000341866878"
    },
    {
        "current_location": {
            "city": "Hamburg",
            "state": "Hamburg",
            "country": "Germany",
            "zip": "",
            "id": "114829128532877",
            "name": "Hamburg, germany",
            "geoid": 82
        },
        "hometown_location": null,
        "name": "Sabrina Mia Muras",
        "uid": "100000372039500"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 83
        },
        "hometown_location": null,
        "name": "Cameron Pauly",
        "uid": "100000550818701"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 84
        },
        "hometown_location": null,
        "name": "Alexandra Weinerth",
        "uid": "100000561054657"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 85
        },
        "name": "Lars Racky",
        "uid": "100000635197576"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 86
        },
        "hometown_location": null,
        "name": "Lucia Lorenz",
        "uid": "100000646500730"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 87
        },
        "hometown_location": {
            "city": "Ludwigshafen am Rhein",
            "state": "Rheinland-Pfalz",
            "country": "Germany",
            "zip": "",
            "id": "106459612720032",
            "name": "Ludwigshafen Am Rhein, Rheinland-Pfalz, Germany",
            "geoid": 88
        },
        "name": "Markus Kilian",
        "uid": "100000691284304"
    },
    {
        "current_location": {
            "city": "Berlin",
            "state": "Berlin",
            "country": "Germany",
            "zip": "",
            "geoid": 89
        },
        "hometown_location": {
            "city": "Berlin",
            "state": "Berlin",
            "country": "Germany",
            "zip": "",
            "geoid": 90
        },
        "name": "Jannis Kempe",
        "uid": "100000718778008"
    },
    {
        "current_location": {
            "city": "Russell",
            "country": "New Zealand",
            "zip": "",
            "geoid": 91
        },
        "hometown_location": {
            "city": "Kiedrich",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 92
        },
        "name": "Juliane Gugerel",
        "uid": "100000743373441"
    },
    {
        "current_location": {
            "city": "Gieu00dfen",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 93
        },
        "hometown_location": null,
        "name": "Adrienne Weber",
        "uid": "100000748441854"
    },
    {
        "current_location": {
            "city": "Hildesheim",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "115991441748506",
            "name": "Hildesheim, Germany",
            "geoid": 94
        },
        "hometown_location": {
            "city": "Hildesheim",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "115991441748506",
            "name": "Hildesheim, Germany",
            "geoid": 95
        },
        "name": "Georg Benhu00f6fer",
        "uid": "100000756584018"
    },
    {
        "current_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 96
        },
        "hometown_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 97
        },
        "name": "Sebbistian Isenschlu00e4ger",
        "uid": "100000793860575"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 98
        },
        "hometown_location": null,
        "name": "Matthias Heuu00df",
        "uid": "100000869374259"
    },
    {
        "current_location": {
            "city": "Medenbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 99
        },
        "hometown_location": null,
        "name": "Kevin Loff",
        "uid": "100000911713303"
    },
    {
        "current_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 100
        },
        "hometown_location": null,
        "name": "Felix Schultz",
        "uid": "100000940304491"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 101
        },
        "hometown_location": null,
        "name": "Nico Heymer",
        "uid": "100000988451869"
    },
    {
        "current_location": {
            "city": "Hartheim",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "104075542960971",
            "name": "Hartheim",
            "geoid": 102
        },
        "hometown_location": null,
        "name": "Natalie Salomon",
        "uid": "100001195400538"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 103
        },
        "hometown_location": null,
        "name": "Kulturpalast Wiesbaden",
        "uid": "100001232922608"
    },
    {
        "current_location": {
            "city": "Geisenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "109662679052177",
            "name": "Geisenheim",
            "geoid": 104
        },
        "hometown_location": null,
        "name": "Luna Hilkenbach",
        "uid": "100001642845388"
    }],
    "alle_adressen": {
        "0": "Wiesbaden, Hessen, Germany",
        "1": "Wiesbaden, Hessen, Germany",
        "2": "Wiesbaden, Hessen, Germany",
        "3": "Utrecht, Utrecht, Netherlands",
        "4": "Utrecht, Utrecht, Netherlands",
        "5": "Wiesbaden, Hessen, Germany",
        "6": "Ankara, Ankara, Turkey",
        "7": "Wiesbaden, Hessen, Germany",
        "8": "Wiesbaden, Hessen, Germany",
        "9": "Bangkok, Krung Thep, Thailand",
        "10": "Bogotu00e1, Cundinamarca, Colombia",
        "11": "Houten, Utrecht, Netherlands",
        "12": "Montpellier, Languedoc-Roussillon, France",
        "13": "Wiesbaden, Hessen, Germany",
        "14": "Essen, Nordrhein-Westfalen, Germany",
        "15": "Bochum, Nordrhein-Westfalen, Germany",
        "16": "Erbach, Hessen, Germany",
        "17": "Erbach, Hessen, Germany",
        "18": "Wiesbaden, Hessen, Germany",
        "19": "Wiesbaden, Hessen, Germany",
        "20": "Wiesbaden, Hessen, Germany",
        "21": "Wiesbaden, Hessen, Germany",
        "22": "Velten, Brandenburg, Germany",
        "23": "Jerusalem, Yerushalayim, Israel",
        "24": "Wiesbaden, Hessen, Germany",
        "25": "Wiesbaden, Hessen, Germany",
        "26": "Wiesbaden, Hessen, Germany",
        "27": "Wiesbaden, Hessen, Germany",
        "28": "Darmstadt, Hessen, Germany",
        "29": "Darmstadt, Hessen, Germany",
        "30": "Wiesbaden, Hessen, Germany",
        "31": "Wiesbaden, Hessen, Germany",
        "32": "Wiesbaden, Hessen, Germany",
        "33": "Wiesbaden, Hessen, Germany",
        "34": "Wiesbaden, Hessen, Germany",
        "35": "Auckland, Auckland, New Zealand",
        "36": "Wiesbaden, Hessen, Germany",
        "37": "Montgiscard, Midi-Pyrenees, France",
        "38": "Wiesbaden, Hessen, Germany",
        "39": "Gieu00dfen, Hessen, Germany",
        "40": "Greifenstein, Hessen, Germany",
        "41": "Bremen, Bremen, Germany",
        "42": "Wiesbaden, Hessen, Germany",
        "43": "Heidelberg, Baden-Wu00fcrttemberg, Germany",
        "44": "Wiesbaden, Hessen, Germany",
        "45": "Breckenheim, Hessen, Germany",
        "46": "Zunsweier, Baden-Wu00fcrttemberg, Germany",
        "47": "Verden, Niedersachsen, Germany",
        "48": "Wiesbaden, Hessen, Germany",
        "49": "Vienna, Wien, Austria",
        "50": "Brandon, South Dakota, United States",
        "51": "Wiesbaden, Hessen, Germany",
        "52": "Bremen, Bremen, Germany",
        "53": "Wiesbaden, Hessen, Germany",
        "54": "Steeden, Hessen, Germany",
        "55": "Walluf, Hessen, Germany",
        "56": "Geisenheim, Hessen, Germany",
        "57": "Wiesbaden, Hessen, Germany",
        "58": "Wiesbaden, Hessen, Germany",
        "59": "Stuttgart, Baden-Wu00fcrttemberg, Germany",
        "60": "Radevormwald, Nordrhein-Westfalen, Germany",
        "61": "Steeden, Hessen, Germany",
        "62": "Oberursel, Hessen, Germany",
        "63": "Wiesbaden, Hessen, Germany",
        "64": "Wiesbaden, Hessen, Germany",
        "65": "Wiesbaden, Hessen, Germany",
        "66": "Siegen, Nordrhein-Westfalen, Germany",
        "67": "Witten, Nordrhein-Westfalen, Germany",
        "68": "Itzehoe, Schleswig-Holstein, Germany",
        "69": "Wiesbaden, Hessen, Germany",
        "70": "Freiburg im Breisgau, Baden-Wu00fcrttemberg, Germany",
        "71": "Wiesbaden, Hessen, Germany",
        "72": "Pu00e9cs, Pecs, Hungary",
        "73": "Marburg an der Lahn, Hessen, Germany",
        "74": "Wiesbaden, Hessen, Germany",
        "75": "Westerburg, Rheinland-Pfalz, Germany",
        "76": "Johannesburg, Gauteng, South Africa",
        "77": "Wiesbaden, Hessen, Germany",
        "78": "Hannover, Niedersachsen, Germany",
        "79": "Saginaw, Michigan, United States",
        "80": "Wiesbaden, Hessen, Germany",
        "81": "Johannesburg, Gauteng, South Africa",
        "82": "Hamburg, Hamburg, Germany",
        "83": "Wiesbaden, Hessen, Germany",
        "84": "Wiesbaden, Hessen, Germany",
        "85": "Wiesbaden, Hessen, Germany",
        "86": "Wiesbaden, Hessen, Germany",
        "87": "Wiesbaden, Hessen, Germany",
        "88": "Ludwigshafen am Rhein, Rheinland-Pfalz, Germany",
        "89": "Berlin, Berlin, Germany",
        "90": "Berlin, Berlin, Germany",
        "91": "Russell, undefined, New Zealand",
        "92": "Kiedrich, Hessen, Germany",
        "93": "Gieu00dfen, Hessen, Germany",
        "94": "Hildesheim, Niedersachsen, Germany",
        "95": "Hildesheim, Niedersachsen, Germany",
        "96": "Plochingen, Baden-Wu00fcrttemberg, Germany",
        "97": "Plochingen, Baden-Wu00fcrttemberg, Germany",
        "98": "Wiesbaden, Hessen, Germany",
        "99": "Medenbach, Hessen, Germany",
        "100": "Plochingen, Baden-Wu00fcrttemberg, Germany",
        "101": "Wiesbaden, Hessen, Germany",
        "102": "Hartheim, Baden-Wu00fcrttemberg, Germany",
        "103": "Wiesbaden, Hessen, Germany",
        "104": "Geisenheim, Hessen, Germany"
    },
    "alle_adressen_length": 105,
    "alle": [{
        "current_location": null,
        "hometown_location": null,
        "name": "Katrin Forytta",
        "uid": "515419023"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Matthias Heicke",
        "uid": "549885395"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 0
        },
        "name": "Meret Mueller",
        "uid": "569011024"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 1
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 2
        },
        "name": "Patrick Litsch",
        "uid": "583577848"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Miriam De",
        "uid": "585127721"
    },
    {
        "current_location": {
            "city": "Utrecht",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "id": "103157243058555",
            "name": "Utrecht, Utrecht",
            "geoid": 3
        },
        "hometown_location": {
            "city": "Utrecht",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "id": "103157243058555",
            "name": "Utrecht, Utrecht",
            "geoid": 4
        },
        "name": "Eline Rentinck",
        "uid": "595599117"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 5
        },
        "hometown_location": {
            "city": "Ankara",
            "state": "Ankara",
            "country": "Turkey",
            "zip": "",
            "id": "106478736056198",
            "name": "Ankara, Turkey",
            "geoid": 6
        },
        "name": "Ebru Ceyhan",
        "uid": "600042730"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Rabs Fatz",
        "uid": "606052083"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Melanie Schoppet",
        "uid": "607767912"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 7
        },
        "name": "Verena Flemming",
        "uid": "608581275"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 8
        },
        "hometown_location": null,
        "name": "Sarah Weinerth",
        "uid": "632018419"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Yvonne I. C. Su00f6derlund",
        "uid": "639785961"
    },
    {
        "current_location": {
            "city": "Bangkok",
            "state": "Krung Thep",
            "country": "Thailand",
            "zip": "",
            "id": "110585945628334",
            "name": "Bangkok, Thailand",
            "geoid": 9
        },
        "hometown_location": {
            "city": "Bogotu00e1",
            "state": "Cundinamarca",
            "country": "Colombia",
            "zip": "",
            "id": "102194039822307",
            "name": "Bogotu00e1, Colombia",
            "geoid": 10
        },
        "name": "Stephan Klein Gu00f3mez",
        "uid": "642153901"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Houten",
            "state": "Utrecht",
            "country": "Netherlands",
            "zip": "",
            "geoid": 11
        },
        "name": "Roosmarijn de Groot",
        "uid": "647366163"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Tessa Violet",
        "uid": "654037896"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lena Pfitzinger",
        "uid": "664764594"
    },
    {
        "current_location": {
            "city": "Montpellier",
            "state": "Languedoc-Roussillon",
            "country": "France",
            "zip": "",
            "id": "115100621840245",
            "name": "Montpellier, France",
            "geoid": 12
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 13
        },
        "name": "Agnieszka Kowalski",
        "uid": "684613604"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Judith Kunz",
        "uid": "690406622"
    },
    {
        "current_location": {
            "city": "Essen",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "108402229182110",
            "name": "Essen, Nordrhein-Westfalen",
            "geoid": 14
        },
        "hometown_location": {
            "city": "Bochum",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "106544749381682",
            "name": "Bochum, Germany",
            "geoid": 15
        },
        "name": "Anna FrOst",
        "uid": "723909599"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Anne Du00f6ring",
        "uid": "724959971"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Phillipp Henschke",
        "uid": "755893043"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lise Venet",
        "uid": "782084640"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Clemens Go",
        "uid": "1001131463"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lucia Hu00e4ndler",
        "uid": "1002380869"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Tilman Stief",
        "uid": "1026033861"
    },
    {
        "current_location": {
            "city": "Erbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "108639415825703",
            "name": "Erbach, Hessen, Germany",
            "geoid": 16
        },
        "hometown_location": {
            "city": "Erbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "108639415825703",
            "name": "Erbach, Hessen, Germany",
            "geoid": 17
        },
        "name": "Anja Faust",
        "uid": "1039324314"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 18
        },
        "name": "Lena Schilling",
        "uid": "1118155519"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Anna-Luisa Heinen",
        "uid": "1121825837"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 19
        },
        "hometown_location": null,
        "name": "Sarissa Labil",
        "uid": "1124704110"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Mike Luthardt",
        "uid": "1145694881"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 20
        },
        "name": "Svenja Schu00fctz",
        "uid": "1150745773"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 21
        },
        "name": "Julia Heyer",
        "uid": "1155277257"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Velten",
            "state": "Brandenburg",
            "country": "Germany",
            "zip": "",
            "id": "113559861991038",
            "name": "Velten",
            "geoid": 22
        },
        "name": "Esther Keidel",
        "uid": "1159037092"
    },
    {
        "current_location": {
            "city": "Jerusalem",
            "state": "Yerushalayim",
            "country": "Israel",
            "zip": "",
            "id": "106401656063896",
            "name": "Jerusalem, Israel",
            "geoid": 23
        },
        "hometown_location": null,
        "name": "Kyrill u05e7u05d9u05e8u05d9u05dc Ahlvers",
        "uid": "1159430744"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 24
        },
        "name": "Tobias Bauer",
        "uid": "1167428259"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 25
        },
        "hometown_location": null,
        "name": "Chantal Rheinheimer",
        "uid": "1176843674"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Uwe Bu00f6hm",
        "uid": "1181993021"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 26
        },
        "name": "Elisa Seip",
        "uid": "1185716888"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Christina Mey",
        "uid": "1193985452"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 27
        },
        "name": "Annika Geiu00df",
        "uid": "1198147613"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Roland Ollenberger",
        "uid": "1198327821"
    },
    {
        "current_location": {
            "city": "Darmstadt",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 28
        },
        "hometown_location": null,
        "name": "Sandra Hu00e4nsel",
        "uid": "1201635326"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Darmstadt",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 29
        },
        "name": "Micha Brockmann",
        "uid": "1202085567"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 30
        },
        "name": "Sandra Orth",
        "uid": "1215487867"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Nora Henschke",
        "uid": "1233270200"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 31
        },
        "name": "Franzi Sophie R",
        "uid": "1246563698"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 32
        },
        "name": "Corinna Eulberg",
        "uid": "1246746409"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Beate Maria Bracht",
        "uid": "1273070691"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 33
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 34
        },
        "name": "Marc Reif",
        "uid": "1278395189"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Eva Aardbei",
        "uid": "1295276970"
    },
    {
        "current_location": {
            "city": "Auckland",
            "state": "Auckland",
            "country": "New Zealand",
            "zip": "",
            "id": "101883149853721",
            "name": "Auckland, New Zealand",
            "geoid": 35
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 36
        },
        "name": "Brabra Lu00fcbbering",
        "uid": "1300551973"
    },
    {
        "current_location": {
            "city": "Montgiscard",
            "state": "Midi-Pyrenees",
            "country": "France",
            "zip": "",
            "id": "109088189125777",
            "name": "Montgiscard, Midi-Pyrenees, France",
            "geoid": 37
        },
        "hometown_location": null,
        "name": "Luc Gu00e9raud",
        "uid": "1315743040"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 38
        },
        "name": "Julia Link",
        "uid": "1342423654"
    },
    {
        "current_location": {
            "city": "Gieu00dfen",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110305888999535",
            "name": "Gieu00dfen, Germany",
            "geoid": 39
        },
        "hometown_location": null,
        "name": "Flo Reinecke",
        "uid": "1366306640"
    },
    {
        "current_location": {
            "city": "Greifenstein",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "107911935898693",
            "name": "Greifenstein",
            "geoid": 40
        },
        "hometown_location": {
            "city": "Bremen",
            "state": "Bremen",
            "country": "Germany",
            "zip": "",
            "id": "115221125158582",
            "name": "Bremen, Germany",
            "geoid": 41
        },
        "name": "Hartmut Constien",
        "uid": "1367469594"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 42
        },
        "name": "Katharina von Haugwitz",
        "uid": "1418110619"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Viktoria Hu00f6ges",
        "uid": "1424933495"
    },
    {
        "current_location": {
            "city": "Heidelberg",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "114466755232742",
            "name": "Heidelberg, Germany",
            "geoid": 43
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 44
        },
        "name": "Enya Gauch",
        "uid": "1427857241"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Breckenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "111815215511878",
            "name": "Breckenheim",
            "geoid": 45
        },
        "name": "Florian Schwarz",
        "uid": "1432591039"
    },
    {
        "current_location": {
            "city": "Zunsweier",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "104908456211489",
            "name": "Zunsweier, Baden-Wurttemberg, Germany",
            "geoid": 46
        },
        "hometown_location": null,
        "name": "Sandra Helena Meyer",
        "uid": "1438024794"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Juliane Henschke",
        "uid": "1449055675"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lena Schultz",
        "uid": "1455758927"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Verden",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "112162582134780",
            "name": "Verden, Germany",
            "geoid": 47
        },
        "name": "Annika Vetter",
        "uid": "1475807302"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 48
        },
        "name": "Jonathan Schmidt",
        "uid": "1479588492"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Svenja Vetter",
        "uid": "1481479079"
    },
    {
        "current_location": {
            "city": "Vienna",
            "state": "Wien",
            "country": "Austria",
            "zip": "",
            "id": "111165112241092",
            "name": "Vienna, Austria",
            "geoid": 49
        },
        "hometown_location": {
            "city": "Brandon",
            "state": "South Dakota",
            "country": "United States",
            "zip": "",
            "id": "106142586083813",
            "name": "Brandon, South Dakota",
            "geoid": 50
        },
        "name": "Madeleine Suchy",
        "uid": "1498230208"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 51
        },
        "name": "Anissa Sander",
        "uid": "1499499073"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Bremen",
            "state": "Bremen",
            "country": "Germany",
            "zip": "",
            "id": "115221125158582",
            "name": "Bremen, Germany",
            "geoid": 52
        },
        "name": "Anna Dittmer",
        "uid": "1508681974"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 53
        },
        "name": "Svenja Lorenz",
        "uid": "1510065437"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Steeden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "115930221751606",
            "name": "Steeden, Hessen, Germany",
            "geoid": 54
        },
        "name": "Fabian Fink",
        "uid": "1527611558"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lisa Unger",
        "uid": "1529933056"
    },
    {
        "current_location": {
            "city": "Walluf",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "116028331745026",
            "name": "Walluf, Hessen, Germany",
            "geoid": 55
        },
        "hometown_location": {
            "city": "Geisenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "109662679052177",
            "name": "Geisenheim",
            "geoid": 56
        },
        "name": "Julia Zschu00e4tzsch",
        "uid": "1555506007"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 57
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 58
        },
        "name": "Frederik Bissinger",
        "uid": "1574853006"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Stuttgart",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112089218817486",
            "name": "Stuttgart, Germany",
            "geoid": 59
        },
        "name": "Ina Kaufmann",
        "uid": "1581789376"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Radevormwald",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "geoid": 60
        },
        "name": "Franziska Elisabeth Bracht",
        "uid": "1595663373"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Sarah Bu00f6ttger",
        "uid": "1605518272"
    },
    {
        "current_location": {
            "city": "Steeden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "115930221751606",
            "name": "Steeden, Hessen, Germany",
            "geoid": 61
        },
        "hometown_location": null,
        "name": "Vanessa Kunath",
        "uid": "1606015650"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Carolina Schwarz",
        "uid": "1608076192"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Leonie Vogt",
        "uid": "1611933848"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Jana Tepper",
        "uid": "1622525728"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Julia Wolf",
        "uid": "1642223645"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Simone De",
        "uid": "1660447914"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Oberursel",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "107794739255070",
            "name": "Oberursel",
            "geoid": 62
        },
        "name": "Nicole Du00f6rner",
        "uid": "1705256168"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 63
        },
        "name": "Morten Nerlich",
        "uid": "1719537899"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 64
        },
        "hometown_location": null,
        "name": "Miriam Ku00f6nig",
        "uid": "1720159289"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 65
        },
        "hometown_location": null,
        "name": "Morgen La T",
        "uid": "1746503538"
    },
    {
        "current_location": {
            "city": "Siegen",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "106364406066894",
            "name": "Siegen, Germany",
            "geoid": 66
        },
        "hometown_location": {
            "city": "Witten",
            "state": "Nordrhein-Westfalen",
            "country": "Germany",
            "zip": "",
            "id": "111526388866101",
            "name": "Witten, Germany",
            "geoid": 67
        },
        "name": "Charlotte Kossler",
        "uid": "1780874872"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Judith Penelope Rehr",
        "uid": "1797660930"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Itzehoe",
            "state": "Schleswig-Holstein",
            "country": "Germany",
            "zip": "",
            "id": "110650918962346",
            "name": "Itzehoe, Germany",
            "geoid": 68
        },
        "name": "Alexander Kraft",
        "uid": "1798381011"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Pauline Keidel",
        "uid": "1802940384"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 69
        },
        "name": "Sascha Seitz",
        "uid": "1810521248"
    },
    {
        "current_location": {
            "city": "Freiburg im Breisgau",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "107094909321044",
            "name": "Freiburg Im Breisgau, Baden-Wurttemberg, Germany",
            "geoid": 70
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 71
        },
        "name": "Florian Best",
        "uid": "1817734300"
    },
    {
        "current_location": {
            "city": "Pu00e9cs",
            "state": "Pecs",
            "country": "Hungary",
            "zip": "",
            "id": "104083222960076",
            "name": "Pu00e9cs",
            "geoid": 72
        },
        "hometown_location": null,
        "name": "Bibi Tillmann",
        "uid": "1849787266"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Marburg an der Lahn",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "106842329347504",
            "name": "Marburg An Der Lahn, Hessen, Germany",
            "geoid": 73
        },
        "name": "Christina Heicke",
        "uid": "1849914432"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 74
        },
        "name": "Lythunder Deal",
        "uid": "100000063447941"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Johanna Florentyna B",
        "uid": "100000064854433"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Nadja Hu00e4mer",
        "uid": "100000088719464"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Leonie At",
        "uid": "100000107655083"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Westerburg",
            "state": "Rheinland-Pfalz",
            "country": "Germany",
            "zip": "",
            "id": "105593319474851",
            "name": "Westerburg",
            "geoid": 75
        },
        "name": "Myriam Scheiner",
        "uid": "100000119780452"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Carolin Tumbrink",
        "uid": "100000124106691"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Koch Sebastian",
        "uid": "100000131093127"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Tobias Lotz",
        "uid": "100000141339543"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Christine Schmidt",
        "uid": "100000157421742"
    },
    {
        "current_location": {
            "city": "Johannesburg",
            "state": "Gauteng",
            "country": "South Africa",
            "zip": "",
            "id": "108151539218136",
            "name": "Johannesburg, Gauteng",
            "geoid": 76
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 77
        },
        "name": "Anna Hu00f6nig",
        "uid": "100000178047127"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Anna Maubach",
        "uid": "100000208775510"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Jenny Meisterling",
        "uid": "100000210055636"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Jessica Ort",
        "uid": "100000216422250"
    },
    {
        "current_location": {
            "city": "Hannover",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "107926389240913",
            "name": "Hannover, Germany",
            "geoid": 78
        },
        "hometown_location": null,
        "name": "Simon Bru00fcckmann",
        "uid": "100000226364932"
    },
    {
        "current_location": {
            "city": "Saginaw",
            "state": "Michigan",
            "country": "United States",
            "zip": "",
            "id": "107838192572373",
            "name": "Saginaw, Michigan",
            "geoid": 79
        },
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 80
        },
        "name": "Lydi Fink",
        "uid": "100000287253817"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Friederike Reinecke",
        "uid": "100000295096145"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lara Go",
        "uid": "100000305349973"
    },
    {
        "current_location": {
            "city": "Johannesburg",
            "state": "Gauteng",
            "country": "South Africa",
            "zip": "",
            "id": "108151539218136",
            "name": "Johannesburg, Gauteng",
            "geoid": 81
        },
        "hometown_location": null,
        "name": "Esther Figge",
        "uid": "100000341866878"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Tasja Werle",
        "uid": "100000362636034"
    },
    {
        "current_location": {
            "city": "Hamburg",
            "state": "Hamburg",
            "country": "Germany",
            "zip": "",
            "id": "114829128532877",
            "name": "Hamburg, germany",
            "geoid": 82
        },
        "hometown_location": null,
        "name": "Sabrina Mia Muras",
        "uid": "100000372039500"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Kirsten Vom Ende",
        "uid": "100000453098777"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Theresa Sz",
        "uid": "100000489851172"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Paul Hentschel",
        "uid": "100000494499536"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lehmie Lehmann",
        "uid": "100000507783426"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 83
        },
        "hometown_location": null,
        "name": "Cameron Pauly",
        "uid": "100000550818701"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 84
        },
        "hometown_location": null,
        "name": "Alexandra Weinerth",
        "uid": "100000561054657"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Luise Brunner",
        "uid": "100000588845358"
    },
    {
        "current_location": null,
        "hometown_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 85
        },
        "name": "Lars Racky",
        "uid": "100000635197576"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 86
        },
        "hometown_location": null,
        "name": "Lucia Lorenz",
        "uid": "100000646500730"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Nalena Lindhorst",
        "uid": "100000659935032"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 87
        },
        "hometown_location": {
            "city": "Ludwigshafen am Rhein",
            "state": "Rheinland-Pfalz",
            "country": "Germany",
            "zip": "",
            "id": "106459612720032",
            "name": "Ludwigshafen Am Rhein, Rheinland-Pfalz, Germany",
            "geoid": 88
        },
        "name": "Markus Kilian",
        "uid": "100000691284304"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Angelika Mu00fcller",
        "uid": "100000699525016"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Seraina Fey",
        "uid": "100000708908136"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Anna Jung",
        "uid": "100000717031784"
    },
    {
        "current_location": {
            "city": "Berlin",
            "state": "Berlin",
            "country": "Germany",
            "zip": "",
            "geoid": 89
        },
        "hometown_location": {
            "city": "Berlin",
            "state": "Berlin",
            "country": "Germany",
            "zip": "",
            "geoid": 90
        },
        "name": "Jannis Kempe",
        "uid": "100000718778008"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Christina Brandt",
        "uid": "100000733826069"
    },
    {
        "current_location": {
            "city": "Russell",
            "country": "New Zealand",
            "zip": "",
            "geoid": 91
        },
        "hometown_location": {
            "city": "Kiedrich",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 92
        },
        "name": "Juliane Gugerel",
        "uid": "100000743373441"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Max Reitze",
        "uid": "100000744640178"
    },
    {
        "current_location": {
            "city": "Gieu00dfen",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 93
        },
        "hometown_location": null,
        "name": "Adrienne Weber",
        "uid": "100000748441854"
    },
    {
        "current_location": {
            "city": "Hildesheim",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "115991441748506",
            "name": "Hildesheim, Germany",
            "geoid": 94
        },
        "hometown_location": {
            "city": "Hildesheim",
            "state": "Niedersachsen",
            "country": "Germany",
            "zip": "",
            "id": "115991441748506",
            "name": "Hildesheim, Germany",
            "geoid": 95
        },
        "name": "Georg Benhu00f6fer",
        "uid": "100000756584018"
    },
    {
        "current_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 96
        },
        "hometown_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 97
        },
        "name": "Sebbistian Isenschlu00e4ger",
        "uid": "100000793860575"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 98
        },
        "hometown_location": null,
        "name": "Matthias Heuu00df",
        "uid": "100000869374259"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Maren Herrmann",
        "uid": "100000901233443"
    },
    {
        "current_location": {
            "city": "Medenbach",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "geoid": 99
        },
        "hometown_location": null,
        "name": "Kevin Loff",
        "uid": "100000911713303"
    },
    {
        "current_location": {
            "city": "Plochingen",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "112087492140850",
            "name": "Plochingen",
            "geoid": 100
        },
        "hometown_location": null,
        "name": "Felix Schultz",
        "uid": "100000940304491"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Rebekka Fink",
        "uid": "100000948273933"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 101
        },
        "hometown_location": null,
        "name": "Nico Heymer",
        "uid": "100000988451869"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Lara Lauber-Nu00f6ll",
        "uid": "100001023501105"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Markus Bu00fccher",
        "uid": "100001029047032"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Mari Demant",
        "uid": "100001047107829"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Sabrina Reuter",
        "uid": "100001139828833"
    },
    {
        "current_location": {
            "city": "Hartheim",
            "state": "Baden-Wu00fcrttemberg",
            "country": "Germany",
            "zip": "",
            "id": "104075542960971",
            "name": "Hartheim",
            "geoid": 102
        },
        "hometown_location": null,
        "name": "Natalie Salomon",
        "uid": "100001195400538"
    },
    {
        "current_location": {
            "city": "Wiesbaden",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "110497988970354",
            "name": "Wiesbaden, Germany",
            "geoid": 103
        },
        "hometown_location": null,
        "name": "Kulturpalast Wiesbaden",
        "uid": "100001232922608"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Maxoman Soldberg",
        "uid": "100001306672722"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Ilona Mu00f6bus",
        "uid": "100001348113620"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Johanna Maria Ju00fcres",
        "uid": "100001401288935"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Anna-Magdalena Schorling",
        "uid": "100001413930962"
    },
    {
        "current_location": null,
        "hometown_location": null,
        "name": "Jenny Schmid",
        "uid": "100001512968286"
    },
    {
        "current_location": {
            "city": "Geisenheim",
            "state": "Hessen",
            "country": "Germany",
            "zip": "",
            "id": "109662679052177",
            "name": "Geisenheim",
            "geoid": 104
        },
        "hometown_location": null,
        "name": "Luna Hilkenbach",
        "uid": "100001642845388"
    }]
};
