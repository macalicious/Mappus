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
        parent.log.trace("Facebook Query in JSON: ", JSON.stringify(freunde));
      };
    
      function anzeigen(freunde){
      
        // which locations should be shown?
        var home = false, current = false;
        modal_content.find(":checked").each(function(key, item){
          if(item.value=="home"){home=true;};
          if(item.value=="current"){current=true;};
        });
      
        parent.log.trace("adressen: ", freunde.alle_adressen);
      
        ui("loading");
        parent.geocode(freunde.alle_adressen, function(pos){fb_geocode(pos, freunde, home, current);});
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

var fb_freunde = [{
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
        "name": "Wiesbaden, Germany"
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
        "name": "Wiesbaden, Germany"
    },
    "hometown_location": {
        "city": "Wiesbaden",
        "state": "Hessen",
        "country": "Germany",
        "zip": "",
        "id": "110497988970354",
        "name": "Wiesbaden, Germany"
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
        "name": "Utrecht, Utrecht"
    },
    "hometown_location": {
        "city": "Utrecht",
        "state": "Utrecht",
        "country": "Netherlands",
        "zip": "",
        "id": "103157243058555",
        "name": "Utrecht, Utrecht"
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
        "name": "Wiesbaden, Germany"
    },
    "hometown_location": {
        "city": "Ankara",
        "state": "Ankara",
        "country": "Turkey",
        "zip": "",
        "id": "106478736056198",
        "name": "Ankara, Turkey"
    },
    "name": "Ebru Ceyhan",
    "uid": "600042730"
},
{
    "current_location": null,
    "hometown_location": null,
    "name": "Rabs Fatz",
    "...er-Nu00f6ll",
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
        "name": "Hartheim"
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
        "name": "Wiesbaden, Germany"
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
        "name": "Geisenheim"
    },
    "hometown_location": null,
    "name": "Luna Hilkenbach",
    "uid": "100001642845388"
}];