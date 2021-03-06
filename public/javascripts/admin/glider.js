/**
 * @author Bruno Bornsztein <bruno@missingmethod.com>
 * @copyright 2007 Curbly LLC
 * @package Glider
 * @license MIT
 * @url http://www.missingmethod.com/projects/glider/
 * @version 0.0.4
 * @dependencies prototype.js 1.5.1+, effects.js
 * @author Konstantin Gredeskoul (added change observers support)
 */
/* Thanks to Andrew Dupont for refactoring help and code cleanup - http://andrewdupont.net/  */

Glider = Class.create();
Object.extend(Object.extend(Glider.prototype, Abstract.prototype), {
    initialize: function(wrapper, options){
        this.scrolling = false;
        this.wrapper = $(wrapper);
        this.scroller = this.wrapper.down('div.scroller');
        this.sections = this.wrapper.getElementsBySelector('li.section');
        this.options = Object.extend({
            controlsEvent: 'click',
            duration: 1.0,
            frequency: 3
        }, options || {});
        
        this.sections.each(function(section, index){
            section._index = index;
        });
        
        this.events = {
            click: this.click.bind(this)
        };
        
        this.addObservers();
        if (this.options.initialSection) 
            this.moveTo(this.options.initialSection, this.scroller, {
                duration: this.options.duration
            }); // initialSection should be the id of the section you want to show up on load
        if (this.options.autoGlide) 
            this.start();
    },
    
    addObservers: function(){
        this.controls = this.wrapper.getElementsBySelector('.controls a');
        this.controls.invoke('observe', this.options.controlsEvent, this.events.click);
     this.changeObservers = this.options.changeObservers || [];
    },
  
    click: function(event){
        this.stop();
        var element = Event.findElement(event, 'a');
        if (this.scrolling) 
            this.scrolling.cancel();
        
        moveTo = this.wrapper.down('#' + element.href.split("#")[1])
        this.moveTo(moveTo, this.scroller, {
            duration: this.options.duration
        });
        Event.stop(event);
        
        this.controls.each(function(control){
            if (control == element) {
                control.addClassName("active")
            }
            else {
                control.removeClassName("active")
            }
        });
    },
    
    moveTo: function(element, container, options){
        this.current = $(element);
     this.notifyObservers()  
        
        Position.prepare();
        var containerOffset = Position.cumulativeOffset(container), elementOffset = Position.cumulativeOffset($(element));
        
        this.scrolling = new Effect.SmoothScroll(container, {
            duration: options.duration,
            x: (elementOffset[0] - containerOffset[0]),
            y: (elementOffset[1] - containerOffset[1])
        });
        return false;
    },
    
    next: function(){
        if (this.current) {
            var currentIndex = this.current._index;
            var nextIndex = (this.sections.length - 1 == currentIndex) ? 0 : currentIndex + 1;
        }
        else 
            var nextIndex = 1;
        
        this.moveTo(this.sections[nextIndex], this.scroller, {
            duration: this.options.duration
        });
        
        // NOTE: jonk (05/05/2009) => modify so that it will always stop and turn off autoglide. This is somewhat hardcoded, but is what I always want to happen for this site, so it works
        this.stop();
        this.options.autoGlide = false
    },
    
    previous: function(){
        if (this.current) {
            var currentIndex = this.current._index;
            var prevIndex = (currentIndex == 0) ? this.sections.length - 1 : currentIndex - 1;
        }
        else 
            var prevIndex = this.sections.length - 1;
        
        this.moveTo(this.sections[prevIndex], this.scroller, {
            duration: this.options.duration
        });

        // NOTE: jonk (05/05/2009) => modify so that it will always stop and turn off autoglide. This is somewhat hardcoded, but is what I always want to happen for this site, so it works
        this.stop();
        this.options.autoGlide = false
    },
    
    stop: function(){
        clearTimeout(this.timer);
    },
    
    start: function(){
        this.periodicallyUpdate();
    },
    
    periodicallyUpdate: function(){
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.next();
        }
        this.timer = setTimeout(this.periodicallyUpdate.bind(this), this.options.frequency * 1000);
    },
  
    notifyObservers: function(){
        if (this.current) {
         var curIndex = this.current._index;
            this.changeObservers.each(function(observer, index){
                observer.notify(curIndex);
            });
        }
    },

  addKeyPressObserver:function() {
    glider = this;
    Event.observe(document, 'keypress', function(event) {
      var key = event.keyCode || event.which;
      if (key == Event.KEY_LEFT) {
        glider.previous();
      } else if (key == Event.KEY_RIGHT) {
        glider.next();
      }    
    });
  }
  

    
});

Effect.SmoothScroll = Class.create();
Object.extend(Object.extend(Effect.SmoothScroll.prototype, Effect.Base.prototype), {
    initialize: function(element){
        this.element = $(element);
        var options = Object.extend({
            x: 0,
            y: 0,
            mode: 'absolute'
        }, arguments[1] ||
        {});
        this.start(options);
    },
    setup: function(){
        if (this.options.continuous && !this.element._ext) {
            this.element.cleanWhitespace();
            this.element._ext = true;
            this.element.appendChild(this.element.firstChild);
        }
        
        this.originalLeft = this.element.scrollLeft;
        this.originalTop = this.element.scrollTop;
        
        if (this.options.mode == 'absolute') {
            this.options.x -= this.originalLeft;
            this.options.y -= this.originalTop;
        }
    },
    update: function(position){
        this.element.scrollLeft = this.options.x * position + this.originalLeft;
        this.element.scrollTop = this.options.y * position + this.originalTop;
    }
});


PageRangeUpdater = Class.create();
Object.extend(Object.extend(PageRangeUpdater.prototype, Abstract.prototype), {
  initialize: function(element, perPage, visible, total){
      this.element = $(element);
      this.perPage = perPage;  // how many items per section that glides
      this.visible = visible;  // how many items are visible at one time
      this.total = total;      // how many items total in the list
  },
  
  notify: function(sectionIndex) {
    from = this.perPage * sectionIndex + 1
    to = from + (this.visible - 1);
    to = to > this.total ? this.total : to
    this.element.innerHTML = "" + from + " - " + to
  }
});

MessageArrayUpdater = Class.create();
Object.extend(Object.extend(MessageArrayUpdater.prototype, Abstract.prototype), {
    initialize: function(element, messages){
      this.element = $(element);
      this.messages = messages;
  },
  
  notify: function(sectionIndex) {
     this.element.innerHTML = this.messages.length > sectionIndex ? this.messages[sectionIndex] : "";
  }
});