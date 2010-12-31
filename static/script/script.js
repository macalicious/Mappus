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
DataRecord.prototype.search = function(param){
  param = this.raise('before_search', param);
  obj = this.find(param);
  obj = this.raise('after_search', obj);
  return obj;
};




var $j = jQuery.noConflict();
var gmap;

function unproto(obj){
  console.log("obj", obj, jQuery.type(obj));
  if(jQuery.type(obj)=="object" || jQuery.type(obj)=="array"){
    
    if(obj.__proto__){
      obj.__proto__ = null;
    }
    for(var i in obj){
      obj[i] = unproto(obj[i]);
    } 
  }
  return obj;
}


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
  var cluster;
  var $this = this;
  
  this.options = {
    cluster: true,
    gridSize: 30,
    maxZoom: 12,
    hide_marker_on_search: true,
    instantSearch: true
  };
  
  
  this.initialize = function(){
    $j('#progress').animate({backgroundPosition: '0% 30%'}, 30000);
    
    var chain = new Chain([
      ui.body,
      ui.map,
      function(){
        $this.sidebar = new Sidebar($j('#datenliste'));
        this.is.done();
      },
      plugins.initialize,
      function(){
        if(options.cluster){
          var mcOptions = {gridSize: $this.options.gridSize, maxZoom: $this.options.maxZoom};
          cluster = new MarkerClusterer(gmap, [], mcOptions);
        }
      },
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
      
      $this.lastSearch = "";
      $j("#searchbar input").keydown(function(e) {
        var last = $this.lastSearch;
        setTimeout(function(){
          var value = $j("#searchbar input")[0].value;

          if(options.instantSearch || e.keyCode == 13) {
            if(last != value){
              $this.lastSearch = value;
              fn.search(value);
            }
          }
        }, 100);
        
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
           var a = string==null ? [0,0] : string.split(",");
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

  
  this.fn = {
    search: function(query){
      var result = record.search(query);

      $this.sidebar.search(result); 
      if($this.options.hide_marker_on_search) render(result);
    }
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
    /*
    var Straße = obj.strasse ? obj.strasse : " - ";
    var Ort = obj.plz && obj.ort ? obj.plz + " " + obj.ort : " - ";
    var Land = obj.land ? obj.land : " - ";
    var Adresse = Straße + ", " + Ort + ", " + Land;
    obj.adresse = Adresse;
    */
  };
  this.record.after_add = function(obj){
    sidebar.add(obj); 
    //obj.dom.data('record', obj);
  };
  this.record.after_search = function(obj){
    
  }
  
  this.render = function(rec){
    var data = rec || this.record.all();
    cluster.clearMarkers();
    
    var markers = [];
    var each_location = this.plugins.get("facebook").each_location;
    for(var key in data){
      each_location(data[key], function(loc){
        markers.push(loc.marker);
      });
    }
    cluster.addMarkers(markers);
  }
  
  
  var Sidebar = function(dom){
    this.dom = dom;
    this.opend = [];
  };
  Sidebar.prototype = {
    add: function(obj){
      var li = $j('<li class="item"></li>'); 
      var aside = $j('<aside></aside>');
      var name = $j('<strong>'+obj.name+'</strong>');
      var adressen = $j('<ul class="adressen slide"></ul>').click(function(){return false;});
      
      if(obj.hometown_location){
        var home = true;
        var home_img = $j('<img alt="hometown" title="hometown" src="image/Home.png" />');
        var home_li = $j('<li><a href="#"><img alt="hometown" title="hometown" src="image/Home.png" /> ' + obj.hometown_location.name + "</a></li>");
      }
      if(obj.current_location){
        var current = true;
        var current_img = $j('<img alt="current location" title="current location" src="image/Nod32.png" />')
        var current_li = $j('<li><a href="#"><img alt="current location" title="current location" src="image/Nod32.png" /> ' + obj.current_location.name + "</a></li>");
      }
      
      this.dom.append(li);
        li.append(aside);
          if (home) aside.append(home_img);
          if (current) aside.append(current_img);
        li.append(name);
        li.append(adressen);
          if (home) adressen.append(home_li);
          if (current) adressen.append(current_li);
         
      
      $sidebar = this;
      obj.sidebar = {};
      obj.sidebar.isOpen = false;
      obj.sidebar.open = function(){
        $sidebar.open(obj);
      }
      obj.sidebar.close = function(){
        $sidebar.close(obj);
      }
      obj.sidebar.show = function(){
        $sidebar.show(obj);
      }
      obj.sidebar.hide = function(){
        $sidebar.hide(obj);
      }
      
      li.click(obj.sidebar.open);
      
      obj.sidebar.visible = true;
      obj.sidebar.dom = li;
      return li;
    },
    open: function(obj){
      if(obj.sidebar.isOpen) {
        obj.sidebar.close();
        return;
      }
      
      this.close_all();      
      
      var slide = obj.sidebar.dom.find("ul");
      obj.sidebar.dom.animate({
          'margin-bottom': slide.height()+5
          }, "fast");
      slide.slideDown("fast");
      
      obj.sidebar.isOpen = true;
      obj.sidebar.dom.addClass("active");
      this.opend.push(obj);
    },
    close_all: function(){
      if (this.opend == []) {return;};
      for(var key in this.opend){
        this.opend[key].sidebar.close();
      }
    },
    close: function(obj){
      if(!obj.sidebar.isOpen) return;
      var rkey = -1;
      for(var key in this.opend){
        if(this.opend[key] == obj) rkey = key;
      }
      this.opend.splice(rkey, 1);
      
      obj.sidebar.isOpen = false;
      obj.sidebar.dom.animate({"margin-bottom": 0},"fast");
      obj.sidebar.dom.find('.slide').slideUp("fast");
      obj.sidebar.dom.removeClass("active");
    },
    search: function(obj_array){
      var all = $this.record.all();
      for(var key in all){
        all[key].sidebar.hide();   
      }
      
      for(var key in obj_array){
        if(obj_array[key] == all[obj_array[key].id]) obj_array[key].sidebar.show();   
      }
    },
    show: function(obj){
      obj.sidebar.visible = true;
      obj.sidebar.dom.show();
    },
    hide: function(obj){
      obj.sidebar.visible = false;
      obj.sidebar.dom.hide();
    }
  };
  this.sidebar = null; // have to be init
  
  
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
          render: this.render
  };
})();

/* 
var Geocoder = function(){
  
  var quee = [];
  
  this.geocode = function(query, gfn){
    
    
 
    
    if(typeof(query) == "string"){ geocode_clintside(query, gfn); };
    if(typeof(query) == "object"){ geocode_serverside(query, gfn); };
    
  };
 
  function code(){
   
  }
 
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
         var a = string==null ? [0,0] : string.split(",");
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
  
}; 
*/
 
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
          /*
              TODO remove fb_window_skip
          */
          if(fb_freunde){
            login();
          }else{
            x.empty();
            x.append($j("<h3>Facebook</h3><hr />"));
            x.append($j('<section class="content"><img src="image/facebook_connect.gif" alt="facebook connect" class="button"/></section>').click(login));
          }
          break
        case "loading":
          var x = x.find(".content").empty();
          parent.log.trace(x);
          x.append($j('<div>Wird geladen </span> <img src="image/loadinfo.net.gif" alt="loading" class="loading"/></div>').css("text-align", "center"));
          break;
        case "result":
          /*
              TODO remove fb_result_skip
          */
          if(fb_freunde){
            options.click_anzeigen();
          }else{  
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
          }
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
      /*
        TODO remove login_skip
      */
      if(fb_freunde){
        fb_login_cb({session: true});
      }else{
        FB.login(fb_login_cb, { perms: 'friends_hometown,friends_location' });
      }
      
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
      //var query = FB.Data.query("select uid, name, current_location, hometown_location from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
      //query.wait(cb);
      cb(fb_freunde.alle);
      /*
        FIXME remove facebook dummydaten
      */
    };
    
    function each_location(freund, fn){
      if(freund.current_location){
        fn(freund.current_location);  
      };
      if(freund.hometown_location && freund.current_location != freund.hometown_location){
        fn(freund.hometown_location); 
      };
    }
    
      
      /*
      var html = $j("<address></address>");
      html.append('<span>'+freund.name+'</span>').append("<br />");
      html.append('<span>'+loc.city+", "+loc.state+", "+loc.country+'</span>').append("<br />");

      
      var obj = {
        title: freund.name,
        point: loc.point,
        html: html[0]
      };
      */
      
      //markers.push(marker);

      //var infowindow = new parent.set_infowindow(dataobj);
      //parent.record.set(dataobj.id, "infowindow", infowindow);
    
    function fb_geocode(positionen, freunde){
      parent.log.trace("fb geocode result: ", positionen );
      
      for(var key in freunde.mit_adresse){
        var freund = freunde.mit_adresse[key];
        each_location(freund, function(loc){
          loc.point = positionen[loc.geoid];
          loc.marker = new parent.Marker({point:loc.point, title:freund.name});
        });
        parent.record.add(freund);
      };
      modal.close();
      parent.render();
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
      modal: this.modal,
      each_location: each_location
      //add_marker_for_friend: add_marker_for_friend
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


//var fb_freunde2 "[{"uid":"515419023","name":"Katrin Forytta","current_location":null,"hometown_location":null},{"uid":"549885395","name":"Matthias Heicke","current_location":null,"hometown_location":null},{"uid":"569011024","name":"Meret Mueller","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"583577848","name":"Patrick Litsch","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"585127721","name":"Miriam De","current_location":null,"hometown_location":null},{"uid":"595599117","name":"Eline Rentinck","current_location":{"city":"Utrecht","state":"Utrecht","country":"Netherlands","zip":"","id":"103157243058555","name":"Utrecht, Utrecht"},"hometown_location":{"city":"Utrecht","state":"Utrecht","country":"Netherlands","zip":"","id":"103157243058555","name":"Utrecht, Utrecht"}},{"uid":"606052083","name":"Rabs Fatz","current_location":null,"hometown_location":null},{"uid":"607767912","name":"Melanie Schoppet","current_location":null,"hometown_location":null},{"uid":"608581275","name":"Verena Flemming","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"632018419","name":"Sarah Weinerth","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"633541181","name":"Yvonne Laub","current_location":null,"hometown_location":{"city":"Lacey","state":"New Jersey","country":"United States","zip":""}},{"uid":"639785961","name":"Yvonne I. C. Söderlund","current_location":null,"hometown_location":null},{"uid":"642153901","name":"Stephan Klein Gómez","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Bogotá","state":"Cundinamarca","country":"Colombia","zip":"","id":"102194039822307","name":"Bogotá, Colombia"}},{"uid":"647366163","name":"Roosmarijn de Groot","current_location":{"city":"Utrecht","state":"Utrecht","country":"Netherlands","zip":"","id":"103157243058555","name":"Utrecht, Utrecht"},"hometown_location":{"city":"Houten","state":"Utrecht","country":"Netherlands","zip":"","id":"104082222960717","name":"Houten"}},{"uid":"654037896","name":"Tessa Violet","current_location":null,"hometown_location":null},{"uid":"664764594","name":"Lena Pfitzinger","current_location":{"city":"Berlin","state":"Schleswig-Holstein","country":"Germany","zip":"","id":"109486955737943","name":"Berlin"},"hometown_location":null},{"uid":"684613604","name":"Agnieszka Kowalski","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"690406622","name":"Judith Kunz","current_location":null,"hometown_location":null},{"uid":"706551505","name":"André Stolper","current_location":{"city":"Dreihausen","state":"Hessen","country":"Germany","zip":"","id":"108550362508262","name":"Dreihausen, Hessen, Germany"},"hometown_location":{"city":"Oestrich-Winkel","state":"Hessen","country":"Germany","zip":"","id":"112532682092674","name":"Oestrich-Winkel"}},{"uid":"723909599","name":"Anna FrOst","current_location":{"city":"Essen","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"108402229182110","name":"Essen, Nordrhein-Westfalen"},"hometown_location":{"city":"Bochum","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"106544749381682","name":"Bochum, Germany"}},{"uid":"724959971","name":"Anne Döring","current_location":null,"hometown_location":null},{"uid":"755893043","name":"Phillipp Henschke","current_location":null,"hometown_location":null},{"uid":"761850136","name":"Maren Christine Kimmerle","current_location":null,"hometown_location":null},{"uid":"782084640","name":"Lise Venet","current_location":null,"hometown_location":null},{"uid":"1001131463","name":"Clemens Go","current_location":null,"hometown_location":null},{"uid":"1002380869","name":"Lucia Händler","current_location":null,"hometown_location":null},{"uid":"1026033861","name":"Tilman Stief","current_location":null,"hometown_location":null},{"uid":"1039324314","name":"Anja Faust","current_location":null,"hometown_location":{"city":"Erbach","state":"Hessen","country":"Germany","zip":"","id":"108639415825703","name":"Erbach, Hessen, Germany"}},{"uid":"1077079794","name":"Tobias Sturm","current_location":null,"hometown_location":null},{"uid":"1079531545","name":"Dimitar 'Mitko' Gruev","current_location":null,"hometown_location":{"city":"Varna","state":"Varna","country":"Bulgaria","zip":"","id":"114974968516694","name":"Varna, Bulgaria"}},{"uid":"1118155519","name":"Lena Schilling","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1121825837","name":"Anna-Luisa Heinen","current_location":null,"hometown_location":null},{"uid":"1124704110","name":"Sarissa Labil","current_location":null,"hometown_location":null},{"uid":"1145694881","name":"Mike Luthardt","current_location":null,"hometown_location":null},{"uid":"1150745773","name":"Svenja Schütz","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1155277257","name":"Julia Heyer","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1159037092","name":"Esther Keidel","current_location":null,"hometown_location":null},{"uid":"1159430744","name":"Kyrill Ahlvers","current_location":{"city":"Jerusalem","state":"Yerushalayim","country":"Israel","zip":"","id":"106401656063896","name":"Jerusalem, Israel"},"hometown_location":null},{"uid":"1167428259","name":"Tobias Bauer","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1176843674","name":"Chantal Rheinheimer","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"1181993021","name":"Uwe Böhm","current_location":null,"hometown_location":null},{"uid":"1185716888","name":"Elisa Seip","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1193985452","name":"Christina Mey","current_location":null,"hometown_location":null},{"uid":"1198147613","name":"Annika Geiß","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1198327821","name":"Roland Ollenberger","current_location":null,"hometown_location":null},{"uid":"1201635326","name":"Sandra Hänsel","current_location":{"city":"Darmstadt","state":"Hessen","country":"Germany","zip":""},"hometown_location":null},{"uid":"1202085567","name":"Micha Brockmann","current_location":null,"hometown_location":{"city":"Darmstadt","state":"Hessen","country":"Germany","zip":""}},{"uid":"1215487867","name":"Sandra Orth","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1233270200","name":"Nora Henschke","current_location":{"city":"Erfurt","state":"Thüringen","country":"Germany","zip":"","id":"106039462768303","name":"Erfurt, Germany"},"hometown_location":null},{"uid":"1246563698","name":"Franzi Sophie R","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1246746409","name":"Corinna Eulberg","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1273070691","name":"Beate Maria Bracht","current_location":null,"hometown_location":null},{"uid":"1278395189","name":"Marc Reif","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1278740615","name":"Steffen Wilde","current_location":{"city":"Nidderau","state":"Hessen","country":"Germany","zip":"","id":"108068085882074","name":"Nidderau"},"hometown_location":{"city":"Frankfurt","state":"Hessen","country":"Germany","zip":"","id":"110221372332205","name":"Frankfurt, Germany"}},{"uid":"1279341526","name":"Jack Unseld","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":null},{"uid":"1282156431","name":"Lisa Jansen","current_location":null,"hometown_location":null},{"uid":"1295276970","name":"Eva Aardbei","current_location":null,"hometown_location":null},{"uid":"1300551973","name":"Brabra Lübbering","current_location":{"city":"Auckland","state":"Auckland","country":"New Zealand","zip":"","id":"101883149853721","name":"Auckland, New Zealand"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1315743040","name":"Luc Géraud","current_location":{"city":"Montgiscard","state":"Midi-Pyrenees","country":"France","zip":"","id":"109088189125777","name":"Montgiscard, Midi-Pyrenees, France"},"hometown_location":null},{"uid":"1342423654","name":"Julia Link","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1366306640","name":"Flo Reinecke","current_location":{"city":"Gießen","state":"Hessen","country":"Germany","zip":"","id":"110305888999535","name":"Gießen, Germany"},"hometown_location":null},{"uid":"1367469594","name":"Hartmut Constien","current_location":{"city":"Greifenstein","state":"Hessen","country":"Germany","zip":"","id":"107911935898693","name":"Greifenstein"},"hometown_location":{"city":"Bremen","state":"Bremen","country":"Germany","zip":"","id":"115221125158582","name":"Bremen, Germany"}},{"uid":"1374702916","name":"Sarah Sche","current_location":null,"hometown_location":{"city":"Schifferstadt","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"105517302816097","name":"Schifferstadt"}},{"uid":"1418110619","name":"Katharina von Haugwitz","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1424933495","name":"Viktoria Höges","current_location":null,"hometown_location":null},{"uid":"1427857241","name":"Enya Gauch","current_location":{"city":"Heidelberg","state":"Baden-Württemberg","country":"Germany","zip":"","id":"114466755232742","name":"Heidelberg, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1432591039","name":"Florian Schwarz","current_location":null,"hometown_location":{"city":"Breckenheim","state":"Hessen","country":"Germany","zip":"","id":"111815215511878","name":"Breckenheim"}},{"uid":"1438024794","name":"Sandra Helena Meyer","current_location":{"city":"Zunsweier","state":"Baden-Württemberg","country":"Germany","zip":"","id":"104908456211489","name":"Zunsweier, Baden-Wurttemberg, Germany"},"hometown_location":null},{"uid":"1442392420","name":"Alex Hinkelmann","current_location":{"city":"Mühlheim","state":"Hessen","country":"Germany","zip":"","id":"109411972417050","name":"Mühlheim, Hessen, Germany"},"hometown_location":{"city":"Bad Hersfeld","state":"Hessen","country":"Germany","zip":"","id":"114521575231531","name":"Bad Hersfeld, Germany"}},{"uid":"1449055675","name":"Juliane Henschke","current_location":null,"hometown_location":null},{"uid":"1455758927","name":"Lena Schultz","current_location":null,"hometown_location":null},{"uid":"1475807302","name":"Annika Vetter","current_location":null,"hometown_location":{"city":"Verden","state":"Niedersachsen","country":"Germany","zip":"","id":"112162582134780","name":"Verden, Germany"}},{"uid":"1479588492","name":"Jonathan Schmidt","current_location":null,"hometown_location":null},{"uid":"1481479079","name":"Svenja Vetter","current_location":null,"hometown_location":null},{"uid":"1498230208","name":"Madeleine Suchy","current_location":{"city":"Vienna","state":"Wien","country":"Austria","zip":"","id":"111165112241092","name":"Vienna, Austria"},"hometown_location":{"city":"Brandon","state":"South Dakota","country":"United States","zip":"","id":"106142586083813","name":"Brandon, South Dakota"}},{"uid":"1499499073","name":"Anissa Sander","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1504992906","name":"Adam Ogbai","current_location":null,"hometown_location":null},{"uid":"1508681974","name":"Anna Dittmer","current_location":{"city":"Bremen","state":"Bremen","country":"Germany","zip":"","id":"115221125158582","name":"Bremen, Germany"},"hometown_location":{"city":"Steeden","state":"Hessen","country":"Germany","zip":"","id":"115930221751606","name":"Steeden, Hessen, Germany"}},{"uid":"1510065437","name":"Svenja Lorenz","current_location":{"city":"Bonn","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"115162238495931","name":"Bonn, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1527611558","name":"Fabian Fink","current_location":null,"hometown_location":null},{"uid":"1529933056","name":"Lisa Unger","current_location":null,"hometown_location":null},{"uid":"1543193487","name":"Maria Rathjen","current_location":null,"hometown_location":{"city":"Hamburg","state":"Hamburg","country":"Germany","zip":"","id":"148966791815869","name":"Hamburg, Germany"}},{"uid":"1555506007","name":"Julia Zschätzsch","current_location":{"city":"Walluf","state":"Hessen","country":"Germany","zip":"","id":"116028331745026","name":"Walluf, Hessen, Germany"},"hometown_location":{"city":"Geisenheim","state":"Hessen","country":"Germany","zip":"","id":"109662679052177","name":"Geisenheim"}},{"uid":"1574853006","name":"Frederik Bissinger","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1581789376","name":"Ina Kaufmann","current_location":null,"hometown_location":{"city":"Stuttgart","state":"Baden-Württemberg","country":"Germany","zip":"","id":"112089218817486","name":"Stuttgart, Germany"}},{"uid":"1595663373","name":"Franziska Elisabeth Bracht","current_location":{"city":"Wuppertal","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"101882733186088","name":"Wuppertal, Germany"},"hometown_location":null},{"uid":"1605518272","name":"Sarah Böttger","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"1606015650","name":"Vanessa Kunath","current_location":{"city":"Steeden","state":"Hessen","country":"Germany","zip":"","id":"115930221751606","name":"Steeden, Hessen, Germany"},"hometown_location":null},{"uid":"1611933848","name":"Leonie Vogt","current_location":null,"hometown_location":null},{"uid":"1622525728","name":"Jana Tepper","current_location":null,"hometown_location":null},{"uid":"1627568965","name":"Julien Hadley Jack","current_location":null,"hometown_location":null},{"uid":"1642885205","name":"Constantin Eisinger","current_location":null,"hometown_location":null},{"uid":"1660447914","name":"Sim De","current_location":null,"hometown_location":null},{"uid":"1705256168","name":"Nicole Dörner","current_location":null,"hometown_location":null},{"uid":"1719537899","name":"Morten Nerlich","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1720159289","name":"Miriam König","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"1746503538","name":"Lars Thomsen","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"1780874872","name":"Charlotte Kossler","current_location":{"city":"Siegen","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"106364406066894","name":"Siegen, Germany"},"hometown_location":{"city":"Witten","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"111526388866101","name":"Witten, Germany"}},{"uid":"1798381011","name":"Alexander Kraft","current_location":{"city":"Kiel","state":"Schleswig-Holstein","country":"Germany","zip":"","id":"106247256080274","name":"Kiel, Germany"},"hometown_location":{"city":"Stadthagen","state":"Niedersachsen","country":"Germany","zip":"","id":"109948099035396","name":"Stadthagen, Germany"}},{"uid":"1802940384","name":"Pauline Keidel","current_location":null,"hometown_location":null},{"uid":"1810521248","name":"Sascha Seitz","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1817734300","name":"Florian Best","current_location":{"city":"Freiburg im Breisgau","state":"Baden-Württemberg","country":"Germany","zip":"","id":"107094909321044","name":"Freiburg Im Breisgau, Baden-Wurttemberg, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"1849914432","name":"Christina Heicke","current_location":null,"hometown_location":{"city":"Marburg an der Lahn","state":"Hessen","country":"Germany","zip":"","id":"106842329347504","name":"Marburg An Der Lahn, Hessen, Germany"}},{"uid":"100000033268300","name":"Tatjana Scholz","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100000063447941","name":"Lythunder Deal","current_location":null,"hometown_location":null},{"uid":"100000064854433","name":"Johanna Florentyna B","current_location":null,"hometown_location":null},{"uid":"100000088719464","name":"Nadja Hämer","current_location":null,"hometown_location":null},{"uid":"100000097684101","name":"Lilly Lodato","current_location":null,"hometown_location":null},{"uid":"100000097783647","name":"Chau Nguyen","current_location":null,"hometown_location":{"city":"Darmstadt","state":"Hessen","country":"Germany","zip":""}},{"uid":"100000107655083","name":"Leonie At","current_location":null,"hometown_location":null},{"uid":"100000119780452","name":"Myriam Scheiner","current_location":null,"hometown_location":{"city":"Westerburg","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"105593319474851","name":"Westerburg"}},{"uid":"100000124106691","name":"Carolin Tumbrink","current_location":null,"hometown_location":null},{"uid":"100000131093127","name":"Koch Sebastian","current_location":null,"hometown_location":null},{"uid":"100000141339543","name":"Tobias Lotz","current_location":null,"hometown_location":null},{"uid":"100000157421742","name":"Christine Schmidt","current_location":null,"hometown_location":null},{"uid":"100000159364759","name":"Kevin Nicholas","current_location":null,"hometown_location":null},{"uid":"100000178047127","name":"Anna Hönig","current_location":{"city":"Johannesburg","state":"Gauteng","country":"South Africa","zip":"","id":"108151539218136","name":"Johannesburg, Gauteng"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100000208775510","name":"Anna Maubach","current_location":null,"hometown_location":null},{"uid":"100000210055636","name":"Jenny Meisterling","current_location":null,"hometown_location":null},{"uid":"100000216422250","name":"Jessica Ort","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"100000226364932","name":"Simon Brückmann","current_location":{"city":"Hanover","state":"Niedersachsen","country":"Germany","zip":"","id":"110081962354501","name":"Hanover, Germany"},"hometown_location":null},{"uid":"100000287253817","name":"Ella Fink","current_location":{"city":"Saginaw","state":"Michigan","country":"United States","zip":"","id":"107838192572373","name":"Saginaw, Michigan"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100000295096145","name":"Friederike Reinecke","current_location":null,"hometown_location":null},{"uid":"100000305349973","name":"Lara Go","current_location":null,"hometown_location":null},{"uid":"100000341866878","name":"Esther Figge","current_location":null,"hometown_location":null},{"uid":"100000349687578","name":"Silas Tpr","current_location":null,"hometown_location":null},{"uid":"100000362636034","name":"Tasja Werle","current_location":null,"hometown_location":null},{"uid":"100000372039500","name":"Sabrina Mia Muras","current_location":null,"hometown_location":null},{"uid":"100000383870848","name":"Vladi Kromm","current_location":null,"hometown_location":null},{"uid":"100000414723870","name":"Kathrin Berkel","current_location":null,"hometown_location":null},{"uid":"100000453098777","name":"Kirsten Vom Ende","current_location":null,"hometown_location":null},{"uid":"100000489487266","name":"Johanna Rohloff","current_location":null,"hometown_location":null},{"uid":"100000494499536","name":"Paul Hentschel","current_location":null,"hometown_location":null},{"uid":"100000507783426","name":"Lehmie Lehmann","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":null},{"uid":"100000550818701","name":"Cameron Pauly","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"100000551322111","name":"Marcel Finger","current_location":null,"hometown_location":{"city":"Münster","state":"Nordrhein-Westfalen","country":"Germany","zip":""}},{"uid":"100000561054657","name":"Alexandra Weinerth","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"100000588845358","name":"Luise Brunner","current_location":null,"hometown_location":null},{"uid":"100000598562040","name":"Lucie Enne","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":{"city":"Hockenheim","state":"Baden-Württemberg","country":"Germany","zip":"","id":"105639222802467","name":"Hockenheim"}},{"uid":"100000635197576","name":"Lars Racky","current_location":null,"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100000646500730","name":"Lucia Lorenz","current_location":null,"hometown_location":null},{"uid":"100000659935032","name":"Nalena Lindhorst","current_location":null,"hometown_location":null},{"uid":"100000691284304","name":"Markus Kilian","current_location":{"city":"Frankfurt","state":"Hessen","country":"Germany","zip":"","id":"110221372332205","name":"Frankfurt, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100000699525016","name":"Angelika Müller","current_location":null,"hometown_location":null},{"uid":"100000700997962","name":"Nathalie Kirchner","current_location":{"city":"Horrenberg","state":"Baden-Württemberg","country":"Germany","zip":"","id":"110371552315144","name":"Horrenberg, Baden-Wurttemberg, Germany"},"hometown_location":{"city":"Breckenheim","state":"Hessen","country":"Germany","zip":"","id":"111815215511878","name":"Breckenheim"}},{"uid":"100000708908136","name":"Seraina Fey","current_location":null,"hometown_location":null},{"uid":"100000717031784","name":"Anna Lisa","current_location":null,"hometown_location":null},{"uid":"100000718778008","name":"Jannis Kempe","current_location":{"city":"Berlin","state":"Berlin","country":"Germany","zip":""},"hometown_location":{"city":"Berlin","state":"Berlin","country":"Germany","zip":""}},{"uid":"100000724363219","name":"Simone Kneiffel","current_location":{"city":"Kaiserslautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"110347315653376","name":"Kaiserslautern, Germany"},"hometown_location":{"city":"Kaiserslautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"110347315653376","name":"Kaiserslautern, Germany"}},{"uid":"100000733826069","name":"Christina Brandt","current_location":null,"hometown_location":null},{"uid":"100000743373441","name":"Juliane Gugerel","current_location":{"city":"Russell","country":"New Zealand","zip":""},"hometown_location":{"city":"Kiedrich","state":"Hessen","country":"Germany","zip":""}},{"uid":"100000744640178","name":"Max Reitze","current_location":{"city":"Münster","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"112144845468135","name":"Münster"},"hometown_location":{"city":"Balhorn","state":"Hessen","country":"Germany","zip":"","id":"109410555757223","name":"Balhorn, Hessen, Germany"}},{"uid":"100000748441854","name":"Adrienne Weber","current_location":{"city":"Gießen","state":"Hessen","country":"Germany","zip":""},"hometown_location":null},{"uid":"100000756584018","name":"Georg Muck","current_location":{"city":"Hildesheim","state":"Niedersachsen","country":"Germany","zip":"","id":"115991441748506","name":"Hildesheim, Germany"},"hometown_location":{"city":"Hildesheim","state":"Niedersachsen","country":"Germany","zip":"","id":"115991441748506","name":"Hildesheim, Germany"}},{"uid":"100000793860575","name":"Sebbistian Schmid","current_location":{"city":"Oberursel","state":"Hessen","country":"Germany","zip":"","id":"107794739255070","name":"Oberursel"},"hometown_location":{"city":"Plochingen","state":"Baden-Württemberg","country":"Germany","zip":"","id":"112087492140850","name":"Plochingen"}},{"uid":"100000819013897","name":"Thomas Farmer","current_location":null,"hometown_location":null},{"uid":"100000869374259","name":"Matthias Heuß","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"100000901233443","name":"Maren Herrmann","current_location":null,"hometown_location":null},{"uid":"100000911713303","name":"Kevin Loff","current_location":{"city":"Medenbach","state":"Hessen","country":"Germany","zip":""},"hometown_location":null},{"uid":"100000940304491","name":"Felix Schultz","current_location":{"city":"Plochingen","state":"Baden-Württemberg","country":"Germany","zip":"","id":"112087492140850","name":"Plochingen"},"hometown_location":null},{"uid":"100000948273933","name":"Rebekka Fink","current_location":null,"hometown_location":null},{"uid":"100000988451869","name":"Nico Heymer","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null},{"uid":"100001023501105","name":"Lara Lauber-Nöll","current_location":null,"hometown_location":null},{"uid":"100001029047032","name":"Markus Bücher","current_location":null,"hometown_location":null},{"uid":"100001047107829","name":"Mari Demant","current_location":null,"hometown_location":null},{"uid":"100001132808358","name":"Florian Pieper","current_location":{"city":"Spaichingen","state":"Baden-Württemberg","country":"Germany","zip":"","id":"103096789730425","name":"Spaichingen"},"hometown_location":{"city":"Spaichingen","state":"Baden-Württemberg","country":"Germany","zip":"","id":"103096789730425","name":"Spaichingen"}},{"uid":"100001139828833","name":"Sabrina Reuter","current_location":null,"hometown_location":null},{"uid":"100001162743184","name":"Tobias Hey","current_location":null,"hometown_location":null},{"uid":"100001195400538","name":"Natalie Salomon","current_location":{"city":"Hartheim","state":"Baden-Württemberg","country":"Germany","zip":"","id":"104075542960971","name":"Hartheim"},"hometown_location":null},{"uid":"100001227041709","name":"Christian Verdion","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":null},{"uid":"100001247051900","name":"Alina Schneider","current_location":{"city":"Kaiserslautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"110347315653376","name":"Kaiserslautern, Germany"},"hometown_location":{"city":"Kaiserslautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"110347315653376","name":"Kaiserslautern, Germany"}},{"uid":"100001306672722","name":"Maxoman Soldberg","current_location":null,"hometown_location":null},{"uid":"100001348113620","name":"Ilona Möbus","current_location":null,"hometown_location":null},{"uid":"100001377694923","name":"Jean Le Clochard","current_location":{"city":"Berlin","state":"Berlin","country":"Germany","zip":"","id":"111175118906315","name":"Berlin, Germany"},"hometown_location":null},{"uid":"100001401288935","name":"Johanna Maria Jüres","current_location":null,"hometown_location":null},{"uid":"100001413930962","name":"Anna-Magdalena Schorling","current_location":null,"hometown_location":null},{"uid":"100001435235921","name":"Jami Schorling","current_location":null,"hometown_location":null},{"uid":"100001437038110","name":"Melanie Zuzej","current_location":null,"hometown_location":null},{"uid":"100001512968286","name":"Jenny Schmid","current_location":null,"hometown_location":null},{"uid":"100001545432108","name":"Sarah Neumann","current_location":{"city":"Wassenberg","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"112145418801111","name":"Wassenberg"},"hometown_location":{"city":"Mönchengladbach","state":"Nordrhein-Westfalen","country":"Germany","zip":"","id":"104067582964044","name":"Mönchengladbach"}},{"uid":"100001553920680","name":"Marius Lohn","current_location":{"city":"Walluf","state":"Hessen","country":"Germany","zip":"","id":"116028331745026","name":"Walluf, Hessen, Germany"},"hometown_location":null},{"uid":"100001563283469","name":"Tessa Schneider","current_location":{"city":"Kaiserslautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"110347315653376","name":"Kaiserslautern, Germany"},"hometown_location":{"city":"Kaiserlautern","state":"Rheinland-Pfalz","country":"Germany","zip":"","id":"109095329111898","name":"Kaiserlautern, Rheinland-Pfalz, Germany"}},{"uid":"100001565679677","name":"Stephan Engelmann","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":{"city":"Kleinkmehlen","state":"Brandenburg","country":"Germany","zip":"","id":"107388429296776","name":"Kleinkmehlen, Brandenburg, Germany"}},{"uid":"100001605336702","name":"Vitali Kaiser","current_location":{"city":"Karlsruhe","state":"Baden-Württemberg","country":"Germany","zip":"","id":"106073139432990","name":"Karlsruhe, Germany"},"hometown_location":{"city":"Pforzheim","state":"Baden-Württemberg","country":"Germany","zip":"","id":"103782216327335","name":"Pforzheim"}},{"uid":"100001642845388","name":"Luna Hilkenbach","current_location":{"city":"Geisenheim","state":"Hessen","country":"Germany","zip":"","id":"109662679052177","name":"Geisenheim"},"hometown_location":null},{"uid":"100001686167508","name":"Jessica Böhles","current_location":null,"hometown_location":null},{"uid":"100001764259505","name":"Jochen Stabenow","current_location":null,"hometown_location":null},{"uid":"100001782972791","name":"Christian Hänel","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"}},{"uid":"100001789455817","name":"Denise Niemietz","current_location":{"city":"Wiesbaden","state":"Hessen","country":"Germany","zip":"","id":"110497988970354","name":"Wiesbaden, Germany"},"hometown_location":null}]"

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
