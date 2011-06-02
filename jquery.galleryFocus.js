/*
galleryFocus v0.1 - http://mediaupstream.com/sandbox/gallery-focus
by Derek Anderson - http://med iaupstream.com

To use this plugin:  
- Include jQuery and this file in your document
- Apply galleryFocus to a selection of HTML elements:
	- $('#gallery img').galleryFocus();
- You can override the default behaviour by passing an array of options to the galleryFocus() call:
	- $('#gallery img').galleryFocus({radius:900, fadeTo:0.0, invert:true, overlay:true});
- You can also change the behaviour dynamically using these provided methods:
	- 'overlay' - Toggle the overlay on|off
		- usage: $('#gallery img').galleryFocus('overlay', true);
	- 'set' - Set method to adjust any of the options
		- usage: $('#gallery img').galleryFocus('set', 'radius', 350);
		- the second paramater is the option, and the 3rd is it's value you want to set
	- 'get' - Get the value of an option, eg: $('#gallery img').galleryFocus('get', 'radius'); returns the current radius
	- 'update' - You might want to call this after updating settings, if you are not using source: 'cursor', to get proper element positions
		
Options (defaults in parentheses):   
- radius: (400) - Set the radius of influence around your cursor
- fadeTo: (0.2) - Set the minimum opacity value to fade elements to
- source: ('cursor') - The 'source': defaults to using your cursor position as the source, optionally set to a single DOM element, eg: '#source-box'
- invert: (false) - Set to false objects will gradually fade out further from the cursors center point, when set to true the opposite effect happens.
- overlay: (false) - When set to true this will generate an overlay around your cursor to visualize the sphere of influence


## TODO
- optimizations
- horizontal / vertical lock modes
- square mode
- figure out how to handle multiple instances of galleryFocus (doesn't seem to work?)
- write better documentation


  )   _. mmeeoowwrr!
 (___)''
 / ,_,/
/'"\ )\

MIT License
----------------------------------------------------------------------------
Copyright (c) 2011 Derek Anderson, http://mediaupstream.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function($){
	
	var global = {
		o : {},
		e : [],
		source : {},
		overlay : null
	};
	
	var checkRefresh = function(){
		if(global.o.source == 'cursor'){
			return false;
		}
		$.fn.galleryFocus(global.o);
	};
	
	var calculatePosition = function(local){
		var p = local.el.offset();
		if(p.left == local.pos.left && p.top == local.pos.top){
			return local.pos; // this element hasn't changed (probably)
		}
		var position = {
			left: p.left,
			top: p.top,
			width: local.el.outerWidth(),
			height: local.el.outerHeight()
		};
		position.right  = Math.floor(p.left+position.width);
		position.bottom = Math.floor(p.top+position.height);
		// get center of object
		position.x = Math.floor(p.left+(position.width/2));
		position.y = Math.floor(p.top+(position.height/2));
		return position;
	};
			
	var setFocus = function(elements){
		$.each(elements, function(i, el){
			// recalculate element positions, (not performant!)
			if(typeof elements[i] == 'undefined'){ return true; }
			elements[i].pos = calculatePosition(elements[i]);
			
			if(!testInBox(el)){ 
				// todo - consider using this check for performance improvments?
				// if(el.opacity != global.o.fadeTo){
					if(global.o.invert){
						setOpacity(el, 1.0);
					} else {
						setOpacity(el, global.o.fadeTo);
					}
				// }
				return true;
			}
			
			el.pos = elements[i].pos;
			
			var length = distance(global.source, el.pos);
			
			var opacity = global.o.fadeTo;
			if(global.o.invert){
				opacity = toFloat(percentOf(length, global.o.radius));
			} else {
				opacity = toFloat(invertPercent(percentOf(length, global.o.radius)));
			}
			
			if(opacity < global.o.fadeTo){ opacity = global.o.fadeTo; }
			setOpacity(el, opacity);
		});
	};
	
	var createOverlay = function(){
		var style = {
			'position':'absolute',
			'top':0,
			'left':0,
			'width':0,
			'height':0,
			'z-index':999,
			'-moz-border-radius': '1000px',
			'-webkit-border-radius': '1000px',
			'-khtml-border-radius': '1000px',
			'border-radius': '1000px',
			'border':'2px solid rgba(80, 80, 80, 0.30)',
			'pointer-events':'none'
		};

		$('<div id="gallery-focus-radius">').css(style).appendTo('body');
		global.overlay = $('#gallery-focus-radius');
	};

	var testInBox = function(el){
		var p = el.pos;
		if(p.left < global.source.left ||
			 p.top < global.source.top ||
			 p.right > global.source.right ||
			 p.bottom > global.source.bottom ){ 
			return false; 
		}
		return true;
	};
	
	var percentOf = function(a, b){
		return Math.floor((a/b)*100);
	};

	var toFloat = function(num){
		return (num/100);
	};

	var invertPercent = function(num){
		return (100-num);
	};

	var distance = function(p, q){ 
		var dx		= p.x - q.x;	// horizontal difference 
		var dy		= p.y - q.y;	// vertical difference 
		var dist 	= Math.sqrt( dx*dx + dy*dy );	// distance using Pythagorean theorem
		return dist;
	};

	var setOpacity = function(element, value){
		element.opacity = value;
		element.el.css('opacity', value);
	};

	var calculateMouse = function(e){
		global.source = {
			x: e.pageX,
			y: e.pageY,
			left: e.pageX - global.o.radius,
			top: e.pageY - global.o.radius,
			right: e.pageX + global.o.radius,
			bottom: e.pageY + global.o.radius
		};
		if(global.o.overlay){
			if(global.overlay == null){
				createOverlay();
			}
			global.overlay.css({
				top: global.source.top,
				left: global.source.left,
				width: global.o.radius*2,
				height: global.o.radius*2
			});
		}
	};
	
	var setupSource = function(){
		
		var bindTo = $(global.o.source);
		
		if($(bindTo).length == 1){		
			$(document).unbind('.galleryFocus');
			var position = calculatePosition({el: bindTo, pos: {top:0, left:0}});
			calculateMouse({pageX: position.x, pageY: position.y});
			setFocus(global.e);
		} else {
			// bind to the cursor position
			$(document).bind('mousemove.galleryFocus', function(c){
				calculateMouse(c);
				setFocus(global.e);
			});
		}
	};
	
	var methods = {
    init : function( options ) {
			var defaults = {
				radius: 400,
				fadeTo: 0.2, 	 // the minimum opacity value to fade elements to
				source: 'cursor', // set to a single DOM element to use as the 'source', defaults to using your cursor position as the source
				invert: false, // invert the opacity
				overlay: false // displays an overlay around the cursor
			};
			// merge options, save to global option array
			global.o = $.extend(defaults, options);
			// loop through all elements, cache results
			this.each(function(i, el){
				global.e[i] = {
					'el': $(el),
					'opacity': 1.0,
					'pos': {}
				};
				global.e[i].pos = calculatePosition(global.e[i]);
			});
			// setup the radius source, either the cursor or a DOM element
			setupSource();
			return this;
		},
		
		overlay: function(value){
			global.o.overlay = value;
			if(value == false){
				global.overlay.hide();
			} else {
				if(global.overlay == null){
					calculateMouse(global.source);
				}
				checkRefresh();
				global.overlay.show();
			}
		},
		
		update: function(value){
			$.fn.galleryFocus(global.o); // calls 'init' with current global options
		},
		
		source: function(value){
			global.o.source = value;
			$.fn.galleryFocus(global.o);
		},
		
    set : function(key, value) {
			if(typeof global.o[key] != 'undefined'){
				global.o[key] = value;
				checkRefresh();
			}
		},
		
		get : function(key) {
			if(typeof global.o[key] != 'undefined'){
				return global.o[key];
			}
		}
  };
	
	$.fn.galleryFocus = function(method){
		
		// Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.galleryFocus' );
    }
	};
	
})(jQuery);