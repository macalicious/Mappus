var ENV = {
  isProduction: function(){
    return false;
  },
  version: "b1.3"
}

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
        $this.log.info("init Sidebar");
        $this.sidebar = new Sidebar($j('#datenliste'));
        this.is.done();
      },
      plugins.initialize,
      function(){
        $this.log.info("init Cluster");
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
          r += '<a id="feedback" href="javascript:MyOtziv.mo_show_box();">Leave feedback</a>';
          r += '<aside id="aside">';
            r += '<div id="searchbar">';
              //r += '<button class="add"><div class="inner">+</div></button>';
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
          //var myLatlng = new google.maps.LatLng(50.08408, 8.2383918); //center:wiesbaden
          var myLatlng = new google.maps.LatLng(30,60);
          
          var myOptions = {
            zoom: 2,
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
      
      for(var key in plugins){
        plugins[key].initialize(function(){
          _this.is.done();
        });
      };
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
   function seperate(locArray, cbFunction, geocoderr){
     var limit = 50;
     Object.size = function(obj) {
         var size = 0, key;
         for (key in obj) {
             if (obj.hasOwnProperty(key)) size++;
         }
         return size;
     };
     Object.to_a = function(obj) {
          var array = [];
          for (key in obj) {
              array.push(obj[key]);
          }
          return array;
      };
     
     locArray = Object.to_a(locArray);
     
     if(locArray.length > limit){
       var result = [];
       var fnArray = [];
       
       function push(n){
         var part_of_locArray = locArray.slice(0,n);
            locArray.splice(0, n);

            fnArray.push(function(){
              $this_ = this;
              geocoderr(part_of_locArray, function(res){
                var x = Object.to_a(res);
                result = result.concat(x);
                $this_.is.done();
              });
            });
       };
       
       while (locArray.length > limit){
         push(limit)
       };
       push(locArray.length);
       
       fnArray.push(function(){
         cbFunction(result);
       });
       var chain = new Chain(fnArray);
       chain.start();
     }else{
       geocoder(locArray, cbFunction);
     }
   }
   
   if(typeof(query) == "string"){ geocode_clintside(query, gfn); };
   if(typeof(query) == "object"){ seperate(query, gfn, function(queryy, gfnn){geocode_serverside(queryy, gfnn);}); };
   
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
      var img = $j('<img alt="" src="' +obj.pic_square + '" class="prof" />');
      var name = $j('<strong>'+obj.name+'</strong>');
      var adressen = $j('<ul class="adressen slide"></ul>').click(function(){return false;});
      
      function center(loc){
        gmap.panTo(loc.marker.position); 
        setTimeout(function(){
          gmap.setZoom(10);
        },1000); 
        gmap.panTo(loc.marker.position);
      };
      
      function animate(loc){
        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
          loc.marker.setAnimation(null)
        },3000);
      };
      
      if(obj.hometown_location){
        var home = true;
        var home_img = $j('<img alt="hometown" title="hometown" src="image/Home.png" class="loc"/>');
        var home_li = $j('<li><a href="#"><img alt="hometown" title="hometown" src="image/Home.png" class="loc" /> ' + obj.hometown_location.name + "</a></li>");
        home_li.click(function(){center(obj.hometown_location); animate(obj.hometown_location);});
      }
      if(obj.current_location){
        var current = true;
        var current_img = $j('<img alt="current location" title="current location" src="image/Nod32.png" class="loc"/>')
        var current_li = $j('<li><a href="#"><img alt="current location" title="current location" src="image/Nod32.png"  class="loc" /> ' + obj.current_location.name + "</a></li>");
        current_li.click(function(){center(obj.current_location); animate(obj.current_location);});
      }
      
      this.dom.append(li);
        li.append(aside);
          if (home) aside.append(home_img);
          if (current) aside.append(current_img);
        li.append(img);
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
    },
    slideOut: function(){
      $j("#aside").animate({
          right: "0px"
        }, 200);
      $j("#map_canvas").animate({
            marginRight: "300px"
        }, 200);  
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
            'margin-left': -(w/2), //-(w_sidebar/2),
            'margin-top': -(h/2+50)
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
          render: this.render,
         sidebar: function(){return $this.sidebar}
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
        
        if (ENV.isProduction()){
          //mappus
          FB.init({appId: '189881351027756', status: true, cookie: true,xfbml: true});
        }else{
          //jupiter-map
          FB.init({appId: '116990711651134', status: true, cookie: true,xfbml: true});
        }
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
    
    /*
    function query(fn){
      parent.log.info("facebook plugin: query");
      var query = FB.Data.query("select uid, name, current_location, hometown_location, picture from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
          query.wait(function(result){ fn(result); });
    };
    */
    var modal_content;
    var modal;
    
    function ui(name, options){
      var x = modal_content;
      switch(name){
        case "facebook":
          /*
              TODO remove fb_window_skip
          */
          if(typeof(fb_freunde)!="undefined"){
            login();
          }else{
            x.empty();
            x.append($j('<h3>Mappus mit Facebook</h3><hr />'));
            var d = $j('<div class="content"></div>').appendTo(x);
            d.append($j('<div style="text-align:center; margin-bottom:20px;">' 
              + '<img alt="" src="image/intro.png" style="width:300px;"/>'
              + '<br />'
              + '</div>'));
            d.append($j('<hr />'
              + '<p>Verbinde deinen Facebook-Account mit Mappus und sehe wo deine Freunde wohnen.'
              + '<br /><br />'
              + '<img src="image/facebook_connect.gif" alt="facebook connect" class="button"/>'
              + '<br /><small id="nodatasaved">Es werden weder von dir noch von deinen Freunden Daten gespeichert.</small>'
              + '</p>').click(login));
            
          }
          break
        case "loading":
          
          var z = x.find(".content").empty();
          console.log(z);
          parent.log.trace("loading", z);
          z.append($j('<div>Wird geladen </span> <img src="image/loadinfo.net.gif" alt="loading" class="loading"/></div>').css("text-align", "center"));
          break;
        case "result":
          /*
              TODO remove fb_result_skip
          */
          if(typeof(fb_freunde)!="undefined"){
            options.click_anzeigen();
          }else{  
            var z = x.find(".content").empty();
            var freunde = options.freunde;
            //x.append($j("<h3>Facebook</h3><hr />"));
            //x.append($j('<section class="content"><img src="facebook_connect.gif" alt="facebook connect" class="button"/></section>')
          
            var geladen = $j('<p></p>').appendTo(z);
            geladen.append($j('<span><b>'+freunde.alle.length+'</b> Freunde &nbsp; </span>'));
            geladen.append($j('<span><b>'+freunde.mit_adresse.length+'</b> Freunde mit Adresse &nbsp; </span>'));
            geladen.append($j('<span><b>'+freunde.alle_adressen_length+'</b> Adressen gesamt &nbsp; </span>'));
          
            var form = $j('<fieldset class="large" id="form"></fieldset>').html(
              '<span class="input"><input type="checkbox" id="home" checked value="home" /> <label for="home">Heimatort</label></span>'
              + ' <span class="input"><input type="checkbox" id="current" checked value="current" /> <label for="current">Aktueller Wohnort</label></span>'
              + '<br/>der Freunde auf der Karte anzeigen.'
            ).appendTo(z);
          
            var weiter = modal_content.next().append($j(' <a href="javascript:;" class="big">Anzeigen</a>')).click(options.click_anzeigen);
          }
          break;
        case "allgemein":
          x.empty();
          $j('<h3>...</h3><hr/>').appendTo(x);
          $j('<p>...</p>').appendTo(x);
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
      if(typeof(fb_freunde)!="undefined"){
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
          click_anzeigen: function(){ alert(555); anzeigen(freunde); }
        });
        //parent.log.trace("Facebook Query in JSON: ", JSON.stringify(freunde['mit_adresse']));
      };
    
      function anzeigen(freunde){
        parent.log.trace("fb_plugin anzeigen", freunde);
        
        // which locations should be shown?
        var home = false, current = false;
        modal_content.find(":checked").each(function(key, item){
          if(item.value=="home"){home=true;};
          if(item.value=="current"){current=true;};
        });
      
        parent.log.trace("adressen: ", freunde.alle_adressen);
        
        ui("loading");
        parent.geocode(freunde.alle_adressen, function(pos){fb_geocode(pos, freunde, home, current);});
        parent.log.trace("adressen JSon: ", freunde.alle_adressen);
      };
      
    };
    
    function fb_querry(cb){
      if(typeof(fb_freunde)!="undefined"){
        cb(fb_freunde.alle);
      }else{
        var query = FB.Data.query("select uid, name, current_location, hometown_location, pic_square from user where uid in (SELECT uid2 FROM friend WHERE uid1 = {0} )", FB.Helper.getLoggedInUser());
        query.wait(cb);
      }
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
      parent.sidebar().slideOut();
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
      nav.append($j('<a href="javascript:;" class="active">Los!</a>').click(function(){modal_change(1)}));
      nav.append($j('<a href="javascript:;">about</a>').click(function(){modal_change(0)}));
      
      
      var content = $j('<section></section>').appendTo(box);
      modal_content = content;
      ui("facebook");
      
      var footer = $j("<footer><hr/></footer>").appendTo(box);
      $j('<small>v ' + ENV.version + '</small>').appendTo(footer);
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
   function initialize(fn){
     fn();
   };

   return {
     initialize: initialize
   };
 })());

  
 
 
$j(document).ready(function($){
  $mapper.initialize();
  new DevTool();
});


//http://Jupiterrr:carsten1@members.dyndns.org/nic/update?hostname=jupiterrr.dyndns.org&myip=141.3.192.99&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG