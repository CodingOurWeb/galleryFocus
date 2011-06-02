galleryFocus
==============
A jQuery plugin that fades html elements based on their proximity to a source
*by Derek Anderson - http://mediaupstream.com*


### BASIC USAGE

    `$('#gallery img').galleryFocus();`


### OPTIONS

    $('#gallery img').galleryFocus({
      // 'radius' - default: 400 - set the source radius size
      'radius': 800,
      
      // 'fadeTo' - default: 0.2 - the min/max value to fade elements to
      // depending on the value of 'invert'
      'fadeTo': 0.0,
      
      // 'source' - default: 'cursor' - if set to a class or ID
      // the source will be the center of that DOM element
      'source': '#source-div',
      
      // 'invert' - default: false - Inverts the direction in which elements
      // fade from the 'source'  
      'invert': true,
      
      // 'overlay' - default: false - displays an overlay to visualize the 
      // 'source' influence
      'overlay': true
    });


### METHODS

- overlay (value)
- update ()
- source (value)
- set (key, value)
- get (key)

**Usage is as follows:**  

*toggle overlay on/off*  
    `$('#gallery img').galleryFocus('overlay', true);`

*updates cached positions of all elements, may be required in some cases*  
    `$('#gallery img').galleryFocus('update');`

*set to 'cursor' to bind source to the cursor, or set to a single DOM element eg: '#some-div' or '.a-single-element'*  
    `$('#gallery img').galleryFocus('source', 'cursor');`

*changes the options value*  
    `$('#gallery img').galleryFocus('set', 'radius','200');`

*returns the options value*  
    `$('#gallery img').galleryFocus('get','radius');`

