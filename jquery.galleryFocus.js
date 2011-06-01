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
		
Options (defaults in parentheses):   
- radius: (400) - Set the radius of influence around your cursor
- fadeTo: (0.2) - Set the minimum opacity value to fade elements to
- invert: (false) - Set to false objects will gradually fade out further from the cursors center point, when set to true the opposite effect happens.
- overlay: (false) - When set to true this will generate an overlay around your cursor to visualize the sphere of influence

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

/*
	## TODO
	- optimizations
	- fix bug when window resize, need to recalculate the global.e positions (unfortunately)
		- this bug is also present if any of the elements move position themselves...
			- attach data to dom elements with jquery data and update on position change / window resize
			- or ... recalculate positions every tick! (less optimized, but fixes bugs)
	- horizontal / vertical lock modes
	- square mode
	- assignable 'mouse' object from any x,y coordinate or html object. (possibly multiple sources?)
	- figure out how to handle multiple instances of galleryFocus (doesn't seem to work?)
	
	## BEFORE LAUNCH
	- Refactor & clean up code, add comments
	- push to GIT and mediaupstream.com
	- tweet & email link to friends
	
*/
(function($){
	
	var global = {
		o : {},
		e : [],
		mouse : {},
		overlay : null
	};
	
	var defaults = {
		radius: 400,
		fadeTo: 0.2, // the minimum opacity value to fade elements to
		invert: false, // invert the opacity
		overlay: false // displays an overlay around the cursor
	};
	
	var methods = {
    init : function( options ) {
			
			global.o = $.extend(defaults, options);
			
			this.each(function(i, el){
				global.e[i] = {
					'el': $(el),
					'opacity': 1.0,
					'pos': {}
				};
				var p = global.e[i].el.offset();
				global.e[i].pos.left 	 = p.left;
				global.e[i].pos.top 	 = p.top;
				global.e[i].pos.width  = global.e[i].el.outerWidth();
				global.e[i].pos.height = global.e[i].el.outerHeight();
				global.e[i].pos.right  = Math.floor(p.left+global.e[i].pos.width);
				global.e[i].pos.bottom = Math.floor(p.top+global.e[i].pos.height);
				// get center of object
				global.e[i].pos.x = Math.floor(p.left+(global.e[i].pos.width/2));
				global.e[i].pos.y = Math.floor(p.top+(global.e[i].pos.height/2));
			});
			
			$(document).mousemove(function(c){
				calculateMouse(c);
				$.each(global.e, function(i, el){
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
					var length = distance(mouse, el.pos);
					
					var opacity = global.o.fadeTo;
					if(global.o.invert){
						opacity = toFloat(percentOf(length, global.o.radius));
					} else {
						opacity = toFloat(invertPercent(percentOf(length, global.o.radius)));
					}
					
					if(opacity < global.o.fadeTo){ opacity = global.o.fadeTo; }
					setOpacity(el, opacity);
				});
			});
			
			// return this;
			
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
				if(p.left < mouse.left ||
					 p.top < mouse.top ||
					 p.right > mouse.right ||
					 p.bottom > mouse.bottom ){ 
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
				var dist 	= Math.sqrt( dx*dx + dy*dy );	// distance using Pythagoras theorem
				return dist;
			};

			var setOpacity = function(element, value){
				element.opacity = value;
				element.el.css('opacity', value);
			}
			
			var sineWave = function(i){
				return Math.sin(0.3 * i);
			};

			var calculateMouse = function(e){
				mouse = {
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
						top: mouse.top,
						left: mouse.left,
						width: global.o.radius*2,
						height: global.o.radius*2
					});
				}
			};
			
		},
		overlay: function(value){
			global.o.overlay = value;
			if(value == false){
				global.overlay.hide();
			} else {
				if(global.overlay != null){
					global.overlay.show();
				}
			}
		},
    set : function(key, value) {
			if(typeof global.o[key] != 'undefined'){
				global.o[key] = value;
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