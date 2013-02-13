/**
 * Copyright (c) 2010 Jakob Westhoff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function( window ) {
    var sprintf = function( format ) {
        // Check for format definition
        if ( typeof format != 'string' ) {
            throw "sprintf: The first arguments need to be a valid format string.";
        }
        
        /**
         * Define the regex to match a formating string
         * The regex consists of the following parts:
         * percent sign to indicate the start
         * (optional) sign specifier
         * (optional) padding specifier
         * (optional) alignment specifier
         * (optional) width specifier
         * (optional) precision specifier
         * type specifier:
         *  % - literal percent sign
         *  b - binary number
         *  c - ASCII character represented by the given value
         *  d - signed decimal number
         *  f - floating point value
         *  o - octal number
         *  s - string
         *  x - hexadecimal number (lowercase characters)
         *  X - hexadecimal number (uppercase characters)
         */
        var r = new RegExp( /%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxX])/g );

        /**
         * Each format string is splitted into the following parts:
         * 0: Full format string
         * 1: sign specifier (+)
         * 2: padding specifier (0/<space>/'<any char>)
         * 3: if the padding character starts with a ' this will be the real 
         *    padding character
         * 4: alignment specifier
         * 5: width specifier
         * 6: precision specifier including the dot
         * 7: precision specifier without the dot
         * 8: type specifier
         */
        var parts      = [];
        var paramIndex = 1;
        while ( part = r.exec( format ) ) {
            // Check if an input value has been provided, for the current
            // format string
            if ( paramIndex >= arguments.length ) {
                throw "sprintf: At least one argument was missing.";
            }

            parts[parts.length] = {
                /* beginning of the part in the string */
                begin: part.index,
                /* end of the part in the string */
                end: part.index + part[0].length,
                /* force sign */
                sign: ( part[1] == '+' ),
                /* is the given data negative */
                negative: ( parseInt( arguments[paramIndex] ) < 0 ) ? true : false,
                /* padding character (default: <space>) */
                padding: ( part[2] == undefined )
                         ? ( ' ' ) /* default */
                         : ( ( part[2].substring( 0, 1 ) == "'" ) 
                             ? ( part[3] ) /* use special char */
                             : ( part[2] ) /* use normal <space> or zero */
                           ),
                /* should the output be aligned left?*/
                alignLeft: ( part[4] == '-' ),
                /* width specifier (number or false) */
                width: ( part[5] != undefined ) ? part[5] : false,
                /* precision specifier (number or false) */
                precision: ( part[7] != undefined ) ? part[7] : false,
                /* type specifier */
                type: part[8],
                /* the given data associated with this part converted to a string */
                data: ( part[8] != '%' ) ? String ( arguments[paramIndex++] ) : false
            };
        }

        var newString = "";
        var start = 0;
        // Generate our new formated string
        for( var i=0; i<parts.length; ++i ) {
            // Add first unformated string part
            newString += format.substring( start, parts[i].begin );
            
            // Mark the new string start
            start = parts[i].end;

            // Create the appropriate preformat substitution
            // This substitution is only the correct type conversion. All the
            // different options and flags haven't been applied to it at this
            // point
            var preSubstitution = "";
            switch ( parts[i].type ) {
                case '%':
                    preSubstitution = "%";
                break;
                case 'b':
                    preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 2 );
                break;
                case 'c':
                    preSubstitution = String.fromCharCode( Math.abs( parseInt( parts[i].data ) ) );
                break;
                case 'd':
                    preSubstitution = String( Math.abs( parseInt( parts[i].data ) ) );
                break;
                case 'f':
                    preSubstitution = ( parts[i].precision == false )
                                      ? ( String( ( Math.abs( parseFloat( parts[i].data ) ) ) ) )
                                      : ( Math.abs( parseFloat( parts[i].data ) ).toFixed( parts[i].precision ) );
                break;
                case 'o':
                    preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 8 );
                break;
                case 's':
                    preSubstitution = parts[i].data.substring( 0, parts[i].precision ? parts[i].precision : parts[i].data.length ); /* Cut if precision is defined */
                break;
                case 'x':
                    preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 16 ).toLowerCase();
                break;
                case 'X':
                    preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 16 ).toUpperCase();
                break;
                default:
                    throw 'sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
            }

            // The % character is a special type and does not need further processing
            if ( parts[i].type ==  "%" ) {
                newString += preSubstitution;
                continue;
            }

            // Modify the preSubstitution by taking sign, padding and width
            // into account

            // Pad the string based on the given width
            if ( parts[i].width != false ) {
                // Padding needed?
                if ( parts[i].width > preSubstitution.length ) 
                {
                    var origLength = preSubstitution.length;
                    for( var j = 0; j < parts[i].width - origLength; ++j ) 
                    {
                        preSubstitution = ( parts[i].alignLeft == true ) 
                                          ? ( preSubstitution + parts[i].padding )
                                          : ( parts[i].padding + preSubstitution );
                    }
                }
            }

            // Add a sign symbol if neccessary or enforced, but only if we are
            // not handling a string
            if ( parts[i].type == 'b' 
              || parts[i].type == 'd' 
              || parts[i].type == 'o' 
              || parts[i].type == 'f' 
              || parts[i].type == 'x' 
              || parts[i].type == 'X' ) {
                if ( parts[i].negative == true ) {
                    preSubstitution = "-" + preSubstitution;
                }
                else if ( parts[i].sign == true ) {
                    preSubstitution = "+" + preSubstitution;
                }
            }

            // Add the substitution to the new string
            newString += preSubstitution;
        }

        // Add the last part of the given format string, which may still be there
        newString += format.substring( start, format.length );

        return newString;
    };

    // Register the new sprintf function as a global function, as well as a
    // method to the String object.
    window.sprintf = sprintf;
    String.prototype.sprintf = function() {
        var newArguments = Array.prototype.slice.call( arguments );
        newArguments.unshift( String( this ) );
        return sprintf.apply( undefined, newArguments );
    }
})( window );
Backbone.Model.prototype.idAttribute = '_id';
Backbone.Model.prototype.toJSON = function() {
  if (this.includeInJSON){
    var attributes = _.pick(this.attributes, this.includeInJSON);
    for (attr in attributes){
      var val = attributes[attr];
      if (val instanceof Backbone.Model && val.shouldBeIdRefInJSON){
        attributes[attr] = val.id;
      }
    }
    return attributes;
  }else{
    return this.attributes;
  }
};
(function(){
  // keep qsl function as a closure with context variable "selector"
  // faster to set the variable "selector", than creating a closure everytime
  var selector;
  function qsl(){
    return this.querySelector(selector);
  }

  // extend jQuery
  // if qsl is available, use it
  // otherwise just use jQuery.find
  jQuery.fn.extend({
    single: document.querySelector ? 
      function(s){
        selector = s;
        return this.map(qsl);
      } 
    :
      function(s){
        return this.find(s);
      }
  }); 

})();



(function(){
  
  // also allow for jQuery.single, use document as base node
  // use qsl if available, otherwise use jQuery(selector)
  jQuery.single = 
  document.querySelector ? 
    function(selector){
      return this(document.querySelector(selector));
    } 
  : 
    function(selector){
      return this(selector);
    };
})();
var WebRemixer = {
  Util: {},
  Routers: {},
  Views: {},
  Models: {},
  Collections: {}
};
WebRemixer.Views.Ruler = Backbone.View.extend({
  className: 'ruler',
  
  events: {
    click : 'onClick'
  },
  
  initialize: function() {
    _.bindAll(this);
  
    this.$markings = $('<div/>').addClass('markings').appendTo(this.el);
    this.$timeHand = $('<div/>').addClass('timeHand').appendTo(this.el);
  
    var remix = this.model.get('remix');
    
    this.listenTo(remix, {
      'change:duration' : this.render,
      'change:playTime' : this.onPlaytimeChange
    });
    remix.trigger('change:playTime', remix, remix.get('playTime'));
    this.render();
  },
  
  onClick: function(event){
    var remix = this.model.get('remix');
    
    var playing = remix.get('playing');
    var playTime = ((event.pageX - this.$el.offset().left) / WebRemixer.PX_PER_SEC);
    
    if (playing){
      remix.set('playing', false);
      remix.set({
        playTime: playTime,
        playing: true
      });
    }else{
      remix.set('playTime', playTime); 
    }
  },
  
  onPlaytimeChange: function(model, val){
    this.$timeHand.css(
      'left', WebRemixer.EMS_PER_SEC * val + 'em'
    );
  },
  
  render: function() {
    this.$markings.empty();
    for (var i = 0, duration = this.model.get('remix').get('duration'); i <= duration; ++i){
      this.$markings.append($('<div/>').text(i).append('<div/>'));
    }
  }
});
WebRemixer.Views.TimelineClip = Backbone.View.extend({
  className: 'timeline-clip',
  
  events: {
    'dragstop': 'onDragStop',
    'resizestop': 'onResizeStop',
    'click .toggle-loop': 'toggleLoop',
    'click .duplicate': 'duplicate',
    'click .delete': 'del'
  },
  
  initialize: function(){
    _.bindAll(this);
  
  
    var grid = [WebRemixer.PX_PER_SEC / 8, 1];

    this.$el.data('view', this).prop(
      'id', this.model.cid
    ).draggable({
      containment: '.timelines',
      stack: '.' + this.className,
      snap: '.timeline',
//      snapTolerance: WebRemixer.PX_PER_SEC / 16,
      grid: grid,
      helper: this.getDraggableHelper
    }).resizable({
      //containment: 'parent',
      handles: 'e,w',
      grid: grid
    }).css(
      'position', 'absolute'
    );
    //set position to absolute, fix for draggable
    
    /*var menu = $(
      '<ul class="timeline-clip-menu">' +
      '<li><a href="#">Item 1</a></li>' +
      '<li><a href="#">Item 2</a></li>' +
      '</ul>'
    ).menu();*/
    
    this.$loopIndicator = $('<div/>').addClass('loop-indicator').appendTo(this.el);
    
    var $buttons = $('<div/>').addClass('buttons');
    
    var $loopLabel = $('<label for="%s"/>'.sprintf(Math.random().toString(36))).appendTo($buttons);

    $buttons.append(
    
      $('<input id="%s" type="checkbox" class="toggle-loop"/>'.sprintf($loopLabel.attr('for'))).appendTo($buttons).button({
        icons: {
          primary: 'ui-icon-refresh'
        },
        label: 'Loop',
        text: false
      }),
      
      $('<button class="duplicate"/>').button({
        icons: {
          primary: 'ui-icon-copy'
        },
        label: 'Duplicate',
        text: false
      }),
      
      $('<button class="delete"/>').button({
        icons: {
          primary: 'ui-icon-close'
        },
        label: 'Delete',
        text: false
      })
      
    ).appendTo(this.el);
    
    
    
    this.listenTo(this.model, {
                change : this.render,
      'change:timeline': this.onTimelineChange,
      'change:selected': this.onSelectedChange
    });
    
    this.model.trigger('change change:selected');
  },
  
  onSelectedChange: function(){
    if (this.model.get('selected')){
      this.$el.addClass('ui-selected');
    }else{
      this.$el.removeClass('ui-selected');
    }
  },
  
  getDraggableHelper: function(){
    this.origDraggableParent = this.$el.parent();
    
    var offset = this.$el.offset();
    
    return this.$el.appendTo(this.$el.closest('.timelines')).offset(offset);
  },
  
  onDragStop: function(){
    if (this.origDraggableParent){
      this.$el.appendTo(this.origDraggableParent);
      this.model.set('startTime', (this.$el.position().left - this.origDraggableParent.offset().left) / WebRemixer.PX_PER_SEC);
      this.origDraggableParent = null;
    }
  },
  
  onResizeStop: function(){
    this.model.set({
      startTime: this.$el.position().left / WebRemixer.PX_PER_SEC,
      duration: this.$el.width() / WebRemixer.PX_PER_SEC
    });
  },
  
  toggleLoop: function(){
    this.model.set('loop', !this.model.get('loop'));
  },
  
  duplicate: function(timeDelta){
    var selected = this.model.get('selected');
  
    var clone = new WebRemixer.Models.TimelineClip({
      clip: this.model.get('clip'),
      startTime: this.model.get('startTime') + (typeof timeDelta === 'number' && timeDelta || this.model.get('duration')),
      duration: this.model.get('duration'),
      loop: this.model.get('loop'),
      selected: selected
    })
    
    this.model.get('timeline').get('timelineClips').add(clone);

    if (selected){
      this.model.set('selected', false);
    }   
  },
  
  del: function(){
    this.model.destroy();
  },
  
  onTimelineChange: function(){
    this.onDragStop();
    this.render();
  },

  render: function(){
    var clip = this.model.get('clip');
    var video = clip.get('video');
    
    this.$loopIndicator.css({
      'background-size': WebRemixer.EMS_PER_SEC * (this.model.get('loop') ? 
        clip.get('cutDuration') :  
        video.get('duration')
        ) + 'em' + ' 100%'
    });
    
    this.$el.css({
      background: 'url("%s")'.sprintf(video.get('thumbnail')),
      left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
      width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
    }).attr({
      'data-title': clip.get('title')
    });
  }
  
});
WebRemixer.Views.ClipPlayer = Backbone.View.extend({
  className: 'clip-player',
    
  events: {
 
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.render();
  },

  render: function(){
    
  }
});
WebRemixer.Views.MainMenu = Backbone.View.extend({
  className: 'main-menu',
  
  events: {
   
  },
  
  initialize: function(){
    _.bindAll(this); 
    this.$menuBar = $('<ul/>').appendTo(this.el);
    this.$fileMenu = $('<ul/>').appendTo($('<li><button>File</button></li>').appendTo(this.$menuBar)).append(
      '<li><a href="#Open...">Open...</a></li>'
    );
    this.$editMenu = $('<ul/>').appendTo($('<li><button>Edit</button></li>').appendTo(this.$menuBar)).append(
      '<li><a href="#">Delete</a></li>',
      '<li><a href="#">Duplicate</a></li>'
    );
    this.$shareMenu = $('<ul/>').appendTo($('<li><button>Share</button></li>').appendTo(this.$menuBar)).append(
      '<li><a href="#">Delete</a></li>',
      '<li><a href="#">Duplicate</a></li>'
    );
    this.$menuBar.menubar({
      autoExpand: true,
			buttons: true
    });
  },

  render: function(){
    
  }
  
});
WebRemixer.Views.Video = Backbone.View.extend({
  className: 'video',
  
  initialize: function(){
  
    this.$el.data('view', this);
  
    this.listenTo(this.model, 'change', this.render);
    
    this.model.trigger('change');
  },
  
  getFormattedDuration: function(){
    var duration = this.model.get('duration');
    return '%d:%02d'.sprintf(duration / 60, duration % 60);
  },
  
  render: function(){
    this.$el.css({
      backgroundImage: 'url("%s")'.sprintf(this.model.get('thumbnail'))
    }).attr({
      'data-title': this.model.get('title'),
      'data-duration': this.getFormattedDuration()
    });
  }
});
WebRemixer.Views.VideoPlayer = Backbone.View.extend({
  className: 'video-player',
    
  events: {
 
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.$video = $('<iframe/>').hide().prop({
      id: Math.random().toString(36),
      src: 'http://www.youtube.com/embed/%s?origin=http://%s&enablejsapi=1&html5=1&autoplay=1&controls=1'.sprintf(this.model.get('video').get('sourceVideoId'),location.host)
    }).appendTo(this.el);
    
    this.player = new YT.Player(this.$video.prop('id'), {
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange
      }
    });
    
    this.listenTo(this.model, {
      'change:playing' : this.onPlayingChange,
      'change:playTime': this.onPlayTimeChange,
               destroy : this.remove
    });
  },
  
  onPlayTimeChange: function(){
    var playTime = this.model.get('playTime');
    // check to make sure playTime is not undefined
    if (playTime >= 0){
      this.seek(playTime);
      this.model.set('playTime', undefined, {silent: true});
    }
  },
  
  onPlayingChange: function(){
    if (this.model.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  seek: function(t){
    this.player.seekTo(t, true);
  },
  
  play: function(t){
    this.player.playVideo();
  },
  
  pause: function(){
    this.player.pauseVideo();
  },
  
  setVolume: function(vol){
    this.player.setVolume(vol);
  },
  
  getVolume: function(){
    return this.player.getVolume();
  },

  onPlayerReady: function(){
    this.model.set('ready', true);
  },
  
  onPlayerStateChange: function(event){
    if (event.data != YT.PlayerState.PAUSED && !this.model.get('playing')){
      this.pause();
    }
  },

  render: function(){
    
  }
});
WebRemixer.Views.VideoFinder = Backbone.View.extend({
  className: 'video-finder',
    
  events: {
    'dialogopen' : 'onOpen',
    'dialogclose' : 'onClose',
    'change .search': 'onSearchChange',
    'click .video': 'onVideoClick'
  },
  
  initialize: function(){
    _.bindAll(this);
    $(this.onLoad);
    
    this.$search = $('<input class="search" type="text"/>').appendTo(
      $('<div data-label="Search"/>').appendTo(this.el)
    );
    this.$searchResults = $('<div class="search-results"/>').appendTo(this.el);
    
    
    this.listenTo(this.model, 'change:open', this.onVisibilityChange);
    this.listenTo(this.model.get('videos'), {
        add: this.onVideosAdd,
      reset: this.onVideosReset
    });
    
    this.render();
    //this.$search.val('kaskade');
    //this.onSearchChange();
  },
  
  onVideosAdd: function(model){
    this.$searchResults.append(
      new WebRemixer.Views.Video({
        model: model
      }).el
    );
  },
  
  onVideosReset: function(){
    this.$searchResults.children('.video').each(function(){
      $(this).data('view').remove();
    });
  },
  
  onOpen: function(){
    this.model.set('open', true);
  },
  
  onClose: function(){
    this.model.set('open', false);
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.dialog('open');
    }else{
      this.$el.dialog('close');
    }
  },
  
  onVideoClick: function(event){
    this.model.set('video', $(event.currentTarget).data('view').model);
  },
  
  onSearchChange: function(){
    if (this.xhr){
      this.xhr.abort();
    }
    this.model.get('videos').reset();
    this.xhr = $.getJSON('http://gdata.youtube.com/feeds/api/videos', {
      v: 2.1,
      alt: 'jsonc',
      q: this.$search.val()
    }, this.onSearchLoad); 
  },
  
  onSearchLoad: function(res){
    var videos = this.model.get('videos');
    videos.reset();
    var items = res.data.items;
    for (var i = 0; i < items.length; ++i){
      var data = items[i];
      videos.add(
        new WebRemixer.Models.Video({
          sourceVideoId: data.id,
          title: data.title,
          duration: data.duration,
          thumbnail: data.thumbnail.hqDefault
        })
      );
    }
  },
    
  onLoad: function(){
    this.$el.appendTo(document.body).dialog({
      title: 'Find Video',
      autoOpen: false,
      modal: true,
      width: 960,
      height: 600,
      buttons: { 
        Okay: _.bind(this.$el.dialog, this.$el, 'close')
      } 
    });
  },
  
  render: function(){
    
  }
});
WebRemixer.Views.PlayControls = Backbone.View.extend({
  className: "play-controls",
    
  events: {
    'click .play' : 'onPlayClick',
    'click .stop' : 'onStopClick',
    'click .restart' : 'onRestartClick'
  },
  


  initialize: function(){
    _.bindAll(this);
  
    this.$el.append(
    
      $('<button class="restart"/>').button({
    		text: false,
    		icons: {
    			primary: 'ui-icon-seek-start'
    		},
    		label: 'Restart'
    	}),
    	
      this.$play = $('<button class="play"/>').button({
      	text: false,
      	icons: {
      		primary: 'ui-icon-play'
      	},
      	label: 'Play'
      }),
     
      $('<button class="stop"/>').button({
      	text: false,
      	icons: {
      		primary: 'ui-icon-stop'
      	},
      	label: 'Stop'
      })

      
    	
    );
    
    this.listenTo(this.model.get('remix'), 'change:playing', this.onPlayingChange);
  },
  
  onPlayingChange: function(){
  
    var playing = this.model.get('remix').get('playing');
  
    if (playing){
      this.$play.button('option', {
        icons: {
          primary: 'ui-icon-pause'
        },
        label: 'Pause'
      });
    }else{
      this.$play.button('option', {
        icons: {
          primary: 'ui-icon-play'
        },
        label: 'Play'
      });
    }
    
  },
  
  onPlayClick: function(){
    var remix = this.model.get('remix');
    remix.set('playing', !remix.get('playing'));
  },
  
  onStopClick: function(){
    this.model.get('remix').set({
      playing: false,
      playTime: 0
    });
  },
  
  onRestartClick: function(){
    var remix = this.model.get('remix');
    if (remix.get('playing')){
      remix.set({
        playing: false,
        playTime: 0
      }).set('playing', true);
    }else{
      remix.set('playTime', 0);
    }
  }
  
});
WebRemixer.Views.ClipManager = Backbone.View.extend({
  className: 'clip-manager',
    
  events: {
    'click .clip .inspect' : 'onInspectClick',
             'click .clip' : 'onInspectClick',
         'click .new-clip' : 'createNewClip'
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.$newClip = $('<button class="new-clip"/>').button({
      icons: {
        primary: 'ui-icon-plus'
      },
      label: 'New Clip',
      text: false
    }).appendTo(this.el);
      
    this.$clips = $('<div/>').addClass('clips').appendTo(this.el);
  
    this.listenTo(this.model, 'change:open', this.onVisibilityChange);  
    this.listenTo(this.model.get('remix').get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
    
    this.model.trigger('change:open');
  
    this.render();
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.addClass('open');
    }else{
      this.$el.removeClass('open');
    }
  },
  
  createNewClip: function(){
    var clip = new WebRemixer.Models.Clip({

    });
    
    this.model.get('remix').get('clips').add(clip);
    
    this.inspect(clip);
  },
  
  onClipsAdd: function(model){
    this.$clips.append(
      new WebRemixer.Views.Clip({
        model: model
      }).el
    );
  },
  
  onClipsRemove: function(model){
    this.$clips.single('#' + model.cid).data('view').remove();
  },
  
  onInspectClick: function(event){
    this.inspect($(event.currentTarget).closest('.clip').data('view').model);
  },
  
  inspect: function(clip){
    this.model.get('remix').get('clipInspector').set({
      open: true,
      clip: clip
    });
  },
  
  render: function(){
    
  }
});
WebRemixer.Views.Remix = Backbone.View.extend({
  className: 'remix',
    
  events: {
    'change .title' : 'onTitleInputChange',
    'selectablestart' : 'onSelectStart',
    'selectableselecting' : 'onSelecting',
    'selectableunselecting' : 'onUnselecting',
    'selectableselected' : 'onSelected',
    'selectableunselected' : 'onUnselected',
    'selectablestop' : 'onSelectStop',
    'menuselect' : 'onMenuSelect',
    'contextmenu .timeline-clips' : 'onContextMenu',
    'contextmenu .selection' : 'onContextMenu',
    'mousedown .timelines' : 'onTimelinesMousedown',
    'click .toggle-clip-manager': 'onToggleClipManagerClick'
  },
  


  initialize: function(){
    _.bindAll(this);
  
    this.$el.attr({
      id: this.model.cid
    });
    
    this.$title = $('<input/>').addClass('title').attr('placeholder', 'Title Your Remix').appendTo(this.el);
    
    this.$contextMenu = $('<ul/>')
      .addClass('context-menu')
      .append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate</a></li>')
      .append('<li data-cmd="delete"><a><span class="ui-icon ui-icon-close"></span>Delete</a></li>')
      .menu()
      .appendTo(this.el);
      
    this.mainMenu = new WebRemixer.Views.MainMenu({
      model: this.model.get('mainMenu')
    });
    this.mainMenu.$el.appendTo(this.el);
    
    this.playControls = new WebRemixer.Views.PlayControls({
      model: this.model.get('playControls')
    });
    this.playControls.$el.appendTo(this.el);
    
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model.get('ruler')
    });
    this.ruler.$el.appendTo(this.el);
    
    this.clipManager = new WebRemixer.Views.ClipManager({
      model: this.model.get('clipManager')
    });
    this.clipManager.model.set('open', true);
    this.clipManager.$el.appendTo(this.el);
    
    this.clipInspector = new WebRemixer.Views.ClipInspector({
      model: this.model.get('clipInspector')
    });
    
    this.$toggleClipManager = $('<button class="toggle-clip-manager"/>')
      .button({
        icons: {
          primary: 'ui-icon-video'
        },
        label: 'Clip Manager',
        text: false
      }).appendTo(this.el);
    
    this.$timelines = $('<div/>')
      .addClass('timelines')
      .selectable({
        filter: '.timeline-clip'
      }).appendTo(this.el);
      
    this.listenTo(this.model.get('timelines'), {
      add: this.onTimelinesAdd,
      remove: this.onTimelinesRemove
    });
    
    this.listenTo(this.model, 'change:title', this.onTitleChange);
    this.model.trigger('change:title');
    
    this.render();
  },
  
  onTitleInputChange: function(){
    this.model.set('title', this.$title.val());
    
    this.$title.blur();
  },
  
  onTitleChange: function(){
    this.$title.val(this.model.get('title'));
  },
  
  onToggleClipManagerClick: function(){
    var cm = this.model.get('clipManager');
    cm.set('open', !cm.get('open'));
  },
  
  onTimelinesAdd: function(model){
    var view = new WebRemixer.Views.Timeline({
      model: model
    });
  
    //insert timeline in the correct position
    this.$timelines.children('.timeline').each(function(){
      if ($(this).attr('data-order') > model.get('order')){
        view.$el.insertBefore(this);
        return false;
      }
    });
    
    //if not inserted, insert the timeline
    if (!view.$el.parent().length){
      this.$timelines.append(view.el);
    }
  },
  
  onTimelinesRemove: function(model){
    this.$timelines.single('#' + model.cid).data('view').remove();
  },
  
  onContextMenu: function(event){
    event.stopPropagation();
    event.preventDefault();
    
    this.$contextMenu.css({
      left: event.pageX,
      top: event.pageY
    }).addClass('show');
  },
  
  onMenuSelect : function(event, ui){
  
    this.$contextMenu.removeClass('show');
    
    switch (ui.item.attr('data-cmd')){
      case 'duplicate':
        this.$timelines.children('.timeline').each(function(){
          $(this).data('view').duplicateSelection();
        });
        this.shiftSelectionRight();
      break;
      
      case 'delete':
        this.$timelines.children('.timeline').each(function(){
          $(this).data('view').deleteSelection();
        });
      break;
      
    }
  },
  
  shiftSelectionRight: function(){
    var curSelection = this.model.get('selection');
    curSelection.offset.left += curSelection.width;
    this.model.trigger('change:selection');
  },
  
  onTimelinesMousedown: function(){
    this.$contextMenu.removeClass('show');
  },
  
  onSelecting: function(event, ui){
    $(ui.selecting).data('view').model.set('selected', true);
  },
  
  onSelected: function(event, ui){
    $(ui.selected).data('view').model.set('selected', true);
  },
  
  onUnselecting: function(event, ui){
    $(ui.unselecting).data('view').model.set('selected', false);
  },
  
  onUnselected: function(event, ui){
    $(ui.unselected).data('view').model.set('selected', false);
  },
  
  onSelectStart: function(){
    _.defer(this.afterSelectStart);
  },
  
  afterSelectStart: function(){
    this.$helper = $.single('body > .ui-selectable-helper');
    this.updateSelection(true);
  },
  
  updateSelection: function(repeat){
    this.model.set('selection', {
      offset: this.$helper.offset(),
      width: this.$helper.width(),
      height: this.$helper.height()
    });
    if (repeat){
      this.updateSelectionTimeoutID = _.delay(this.updateSelection, 50, true);
    }
  },

  onSelectStop: function(event, ui){
    this.updateSelection();
    clearTimeout(this.updateSelectionTimeoutID);
  },

  render: function(){
    
  }
});
WebRemixer.Views.Timeline = Backbone.View.extend({
  className: 'timeline',
  
  events: {
    'click .toggle-height' : 'onToggleHeightClick',
    'drop .timeline-clips' : 'onDrop'
  },

  initialize: function(){
    _.bindAll(this);
  
    this.$el
      .prop(
        'id', this.model.cid
      ).attr(
        'data-order', this.model.get('order')
      )
      .data('view', this);
      
    this.$header = $('<div/>')
      .addClass('header')
      .attr(
        'data-title', 'Timeline %s'.sprintf(this.model.get('order'))
      )
      .appendTo(this.el);
      
    this.$toggleHeight = $('<button class="toggle-height"/>')
      .button({
        icons: {
          primary: 'ui-icon-circle-triangle-s'
        },
        label: 'Collapse',
        text: false
      }).appendTo(this.$header);
      
    this.$timelineClips = $('<div/>').addClass('timeline-clips').droppable({
      accept: '.clip, .timeline-clip',
      tolerance: 'pointer'
    }).appendTo(this.el);
      
    $('<div/>').addClass('selection').appendTo(this.el);
    

    this.listenTo(this.model, {
      'change:collapsed': this.onCollapsedChange,
      'change:remix': this.onRemixChange,
      'change:order': this.onOrderChange
    });
    this.listenTo(this.model.get('timelineClips'), {
      add: this.onTimelineClipsAdd,
      remove: this.onTimelineClipsRemove
    });
  },
  
  onOrderChange: function(){
    var order = this.model.get('order');
  
    this.$el.attr(
      'data-order', order
    );
    
    this.$header.attr(
      'data-title', 'Timeline %s'.sprintf(order)
    );
  },
  
  onRemixChange: function(){
    var prevRemix = this.model.previous('remix');
    if (prevRemix){
      this.stopListening(prevRemix);
    }
    
    var remix = this.model.get('remix');
  
    if (remix){
      this.listenTo(remix, 'change:selection', this.onSelectionChange);
    }
  },
  
  onTimelineClipsAdd: function(model){
    this.$timelineClips.append(
      new WebRemixer.Views.TimelineClip({
        model: model
      }).el
    );
  },
  
  onTimelineClipsRemove: function(model){
    this.$timelineClips.single('#' + model.cid).data('view').remove();
  },

  onToggleHeightClick: function(){
    this.model.set('collapsed', !this.model.get('collapsed'));
  },
  
  onCollapsedChange: function(){
    var collapsed = this.model.get('collapsed');
    
    if (collapsed){
      this.$el.addClass('collapsed');
      this.$toggleHeight.button('option', {
					label: 'Expand',
					icons: {
						primary: 'ui-icon-circle-triangle-n'
					}
    	});
    }else{
      this.$el.removeClass('collapsed');
      this.$toggleHeight.button('option', {
				label: 'Collapse',
				icons: {
					primary: 'ui-icon-circle-triangle-s'
				}
			});
    }
  },
  
  duplicateSelection: function(){
    var $selectedClips = this.getSelectedClips();
    if (!$selectedClips) return;
    
    var duration = this.model.get('selection').duration;
    
    $selectedClips.each(function(){
      $(this).data('view').duplicate(duration);
    })
    
  },
  
  deleteSelection: function(){
    var $selectedClips = this.getSelectedClips();
    if (!$selectedClips) return;
    
    $selectedClips.each(function(){
      $(this).data('view').del();
    });
  },
  
  getSelectedClips: function(){
    var selection = this.model.get('selection');
    if (!selection) return;
    
    var $selectedClips = this.$timelineClips.find('.timeline-clip.ui-selected');

    return $selectedClips.size() && $selectedClips;
  },
  
  onSelectionChange: function(){
  
    var selection = this.model.get('remix').get('selection');
    
    var offset = this.$el.offset();
    var height = this.$el.height();
    
    var $selection = this.$el.single('.selection');

    //make sure selection is at least 1x1 and check for the 3 types of intersections
    if (selection.width >= 1 && selection.height >= 1 &&
        ((selection.offset.top >= offset.top && selection.offset.top <= offset.top + height)
        || (selection.offset.top + selection.height >= offset.top && selection.offset.top + selection.height <= offset.top + height)
        || (selection.offset.top <= offset.top && selection.offset.top + selection.height >= offset.top + height))) {
      $selection.css({
        left: selection.offset.left,
        width: selection.width
      });
      this.model.set('selection', {
        startTime: (selection.offset.left - this.$timelineClips.offset().left) / WebRemixer.PX_PER_SEC,
        duration: selection.width / WebRemixer.PX_PER_SEC
      });
    }else{
      $selection.css(
        'width', 0
      );
      this.model.set('selection', {
        startTime: 0,
        duration: 0
      });
    }
  },
  
  onDrop: function(event, ui){
    var view = ui.draggable.data('view');
    
    if (view instanceof WebRemixer.Views.TimelineClip){
      var curTimeline = view.model.get('timeline');
      if (curTimeline !== this.model){
        curTimeline.get('timelineClips').remove(view.model);
        this.model.get('timelineClips').add(view.model);
      }
    }else if (view instanceof WebRemixer.Views.Clip){
      this.model.get('timelineClips').add(
          new WebRemixer.Models.TimelineClip({
            clip: view.model,
            startTime: (ui.offset.left - this.$timelineClips.offset().left) / WebRemixer.PX_PER_SEC,
            loop: true
          })
      );
    }
  },
  
  render: function(){
    
  }
});
WebRemixer.Views.ClipInspector = Backbone.View.extend({
  className: 'clip-inspector',
    
  events: {
    'dialogopen' : 'onOpen',
    'dialogclose' : 'onClose',
    'change .clip-title' : 'onTitleInputChange',
    'slide .cut' : 'onCutSlide',
    'slidestop .cut' : 'onCutSlide',
    'click .clip-video' : 'onVideoClick'
  },
  
  initialize: function(){
    _.bindAll(this);
    
    new WebRemixer.Views.VideoFinder({
      model: this.model.get('videoFinder')
    });
    
    this.$title = $('<input class="clip-title" type="text" placeholder="Title"/>')
      .appendTo(
        this.el
      );
      
      
    
    var $cutContainer = $('<div class="cut"/>').appendTo($('<div data-label="Cut"/>').appendTo(this.el));
    
    this.$cutSlider = $('<div class="cut-slider"/>').slider({
      range: true,
      min: 0
    }).appendTo($cutContainer);
    
    this.$cutStart = $('<span class="cut-start"/>').appendTo($cutContainer);
    this.$cutEnd = $('<span class="cut-end"/>').appendTo($cutContainer);
    
    
    this.$video = $('<div class="clip-video"/>').appendTo(
      $('<div data-label="Video"/>').appendTo(this.el)
    );
    
    
    
    
    
    this.listenTo(this.model, {
      'change:open': this.onVisibilityChange,
      'change:clip': this.onClipChange
    });
    this.listenTo(this.model.get('videoFinder'), 'change:video', this.onVideoFinderVideoChanged);
    
    $(this.onLoad);
  
    this.render();
  },
  
  onVideoFinderVideoChanged: function(){
    var videoFinder = this.model.get('videoFinder');
  
    this.model.get('clip').set('video', 
      videoFinder.get('video')
    );
    
    videoFinder.set('open', false);
  },
  
  onVideoClick: function(){
    this.model.get('videoFinder').set('open', true);
  },
  
  onCutSlide: function(event, ui){
    var values = (ui && ui.values) || this.$cutSlider.slider('option', 'values');
  
    var start = values[0];
    var end = values[1];
    
    if (end - start < 1){
      return;
    }
  
    var clip = this.model.get('clip');
    
    var video = clip.get('video');
    
    if (video){
      var duration = video.get('duration');
    
      this.$cutStart.css({
        left: (start / duration) * 100 + "%"
      }).text('%d:%02d'.sprintf(start / 60, start % 60));
      
      this.$cutEnd.css({
        left: (end / duration) * 100 + "%"
      }).text('%d:%02d'.sprintf(end / 60, end % 60));
    }
    
    clip.set({
      cutStart: start,
      cutDuration: end - start
    });
  },
  
  onLoad: function(){
    this.$el.appendTo(document.body).dialog({
      title: 'Edit Clip',
      autoOpen: false,
      modal: true,
      width: 600,
      height: 500,
      buttons: { 
        Okay: _.bind(this.$el.dialog, this.$el, 'close')
      } 
    });
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.dialog('open');
    }else{
      this.$el.dialog('close');
      this.removeBlankClips();
    }
  },
  
  removeBlankClips: function(){
    var clip = this.model.get('clip');
    if (!clip.get('video')){
      clip.destroy();
    }
  },
  
  onOpen: function(){
    this.model.set('open', true);
  },
  
  onClose: function(){
    this.model.set('open', false);
  },
  
  onClipChange: function(){
    var clip = this.model.get('clip');
    var cutStart = clip.get('cutStart');
  
    this.$title.val(clip.get('title'));
    var video = clip.get('video');
    
    this.$cutSlider.slider('option', {
      values: [cutStart, cutStart + clip.get('cutDuration')]
    });
    
    var previousClip = this.model.previous('clip');
    if (previousClip){
      this.stopListening(previousClip);
    }
    
    this.listenTo(clip, 'change:title', this.onClipTitleChange);
    this.listenTo(clip, 'change:video', this.onClipVideoChange);
    
    //kickstart it
    this.onCutSlide();
    clip.trigger('change:video');
  },
  
  onClipVideoChange: function(){
    var clip = this.model.get('clip');
    var video = clip.get('video');
    
    var oldView = this.$video.children().data('view');
    if (oldView){
      oldView.remove();
    }

    if (video){
      this.$video.append(
        new WebRemixer.Views.Video({
          model: video
        }).el
      );
      
      var previousVideo = clip.previous('video');
    
      if (previousVideo && clip.get('title') == previousVideo.get('title')){
        clip.set('title', video.get('title'));
      }
    
      this.$cutSlider.slider('option', {
        max: video.get('duration')
      });
      
      this.onCutSlide();
    }else{
      this.model.get('videoFinder').set('open', true);
    }
  },
  
  onTitleInputChange: function(){
    var clip = this.model.get('clip');
    clip.set('title', this.$title.val() || clip.get('video').get('title'));
    this.onClipTitleChange();
  },
  
  onClipTitleChange: function(){
    this.$title.val(this.model.get('clip').get('title'));
  },
  
  render: function(){
    
  }
});
WebRemixer.Views.Clip = Backbone.View.extend({
  
  className: 'clip',
  
  events: {
    'dragstart'     : 'onDragStart',
    'click .delete' : 'onDeleteClick'
  },
  
  initialize: function(){
    _.bindAll(this);
    
    this.$el
      .attr({
        id: this.model.cid
      })
      .data('view', this)
      .draggable({
        snap: '.timeline',
        grid: [WebRemixer.PX_PER_SEC / 8, 1],
        helper: 'clone',
        appendTo: document.body
      });
      
    $('<div/>').addClass('buttons').append(
      $('<button class="inspect"/>').button({
        icons: {
          primary: 'ui-icon-pencil'
        },
        label: 'Inspect',
        text: false
      }),
      $('<button class="delete"/>').button({
        icons: {
          primary: 'ui-icon-close'
        },
        label: 'Delete',
        text: false
      })
    ).appendTo(this.el);
      
    this.listenTo(this.model, {
      change: this.render
    });
    
    this.render();
  },
  
  onDeleteClick: function(){
    this.model.destroy();
  },
  
  onDragStart: function(){
    if (!this.model.get('video')){
      return false;
    }
  },
  
  render: function(){
    var video = this.model.get('video');
    
    if (video){
      this.$el.css({
        backgroundImage: 'url("%s")'.sprintf(video.get('thumbnail'))
      });
    }
    
    this.$el.attr({
      'data-title': this.model.get('title'),
      'data-duration': this.model.get('cutDuration') + 's'
    });
  }
});
$(function(){
  new WebRemixer.Routers.Remix();
  Backbone.history.start({pushState: true});
});
WebRemixer.preloadDelay = .5;
WebRemixer.EMS_PER_SEC = 8;
$(function(){
  WebRemixer.PX_PER_SEC = WebRemixer.EMS_PER_SEC * parseFloat($(document.body).css('fontSize'));
});
WebRemixer.Util.intersects = function(lineClip1, lineClip2){
  var start1 = lineClip1.get('startTime');
  var end1 = start1 + lineClip1.get('duration') + WebRemixer.preloadDelay;
  
  var start2 = lineClip2.get('startTime');
  var end2 = start2 + lineClip2.get('duration');

  if (
    // if second clip starts within the first clip  
    (start2 > start1 && start2 < end1)
    
    // if second clip ends within the first clip
    || (end2 > start1 && end2 < end1)
    
    // if second clip is large enough to contain the first clip
    || (start2 <= start1 && end2 >= end1)
    
  ){ 
    return true;
  }
  
};


  


WebRemixer.Util.Model = {};

WebRemixer.Util.Model.saveChanged = function(){
  var attrs = _.pick(this.toJSON(), _.keys(this.changedAttributes()));
  if (!_.isEmpty(attrs)){
    this.save(undefined, {patch: true, attrs: attrs});
  }
};
WebRemixer.Routers.Remix = Backbone.Router.extend({

  routes: {
    "new": "newRemix",
    ":id": "getRemix"
  },

  newRemix: function() {
    
    var remixModel = new WebRemixer.Models.Remix();
    
    var remixView = new WebRemixer.Views.Remix({
      model: remixModel
    });
    
    remixView.$el.appendTo(document.body);
    
    var timelines = remixModel.get('timelines');
    
    // add some timelines to begin
    for (var count = 5; count--;){
      timelines.add(new WebRemixer.Models.Timeline());
    }
  },

  getRemix: function(id) {
    var attrs = {};
    attrs[Backbone.Model.prototype.idAttribute] = id;
    var remixModel = new WebRemixer.Models.Remix(attrs);
    
    var remixView = new WebRemixer.Views.Remix({
      model: remixModel
    });
    
    remixView.$el.appendTo(document.body);
    
    remixModel.fetch();
  }

});
WebRemixer.Models.Video = Backbone.Model.extend({

  urlRoot: 'videos',
  
  defaults: {
    source: 'youtube'
  },
  
  includeInJSON: ['source', 'sourceVideoId'],

  initialize: function(){
    _.bindAll(this, 'gotVideoData');
    
    
    if (!this.get('title')){
      $.getJSON('https://gdata.youtube.com/feeds/api/videos/%s'.sprintf(this.get('sourceVideoId')), { 
        v: 2.1,
        alt: 'jsonc' 
      }, this.gotVideoData);
    }
  },
  
  gotVideoData: function(res){
    var data = res.data;
    this.set({
      title: data.title,
      duration: data.duration,
      thumbnail: data.thumbnail.hqDefault
    });
  }
});
WebRemixer.Models.Clip = Backbone.Model.extend({

  urlRoot: 'clips',

  defaults: {
    cutStart: 0,
    cutDuration: 5,
    title: 'New Clip'
  },
  
  shouldBeIdRefInJSON: true,
  
  includeInJSON: ['remix', 'title', 'video', 'cutStart', 'cutDuration'],

  initialize: function(){
    this.listenTo(this, {
      change: this.onChange,
      'change:video': this.onVideoChange 
    });
    
    this.trigger('change:video');
  },
  
  onChange: WebRemixer.Util.Model.saveChanged,
  
  onVideoChange: function(){
    var video = this.get('video');
    
    var previousVideo = this.previous('video');
    if (previousVideo){
      this.stopListening(previousVideo);
    }
    
    if (video){
      this.listenTo(video, {
         change: _.bind(this.trigger, this, 'change'),
        'change:title': this.onVideoTitleChange
      });
      
      video.trigger('change:title');
    }
  },
  
  onVideoTitleChange: function(){
    var title = this.get('title');
    if (!title || title == this.defaults.title){
      this.set('title', this.get('video').get('title'));
    }
  }
  
});
WebRemixer.Models.TimelineClip = Backbone.Model.extend({

  urlRoot: 'timeline-clips',
  
  shouldBeIdRefInJSON: true,
  
  includeInJSON: ['remix', 'timeline', 'clip', 'startTime', 'duration', 'loop'],
    
  initialize: function(){
    _.bindAll(this, 'prepareToPlay', 'play', 'pause');
  
    var clip = this.get('clip');

    if (!this.get('duration')){
      this.set('duration', clip.get('cutDuration'));
    }
    
    this.set('clipPlayer', 
      new WebRemixer.Models.ClipPlayer({
        clip: clip
      })
    );
    
  
    // trigger a change event, everytime our clip changes
    this.listenTo(clip, {
      change: _.bind(this.trigger, this, "change"),
      destroy: this.destroy
    });
    
    this.listenTo(this, {
      change: this.onChange,
      'change:timeline': this.onTimelineChange,
      'change:remix': this.onRemixChange
    });
  },

  onChange: WebRemixer.Util.Model.saveChanged,
  
  onRemixChange: function(){
    var prevRemix = this.previous('remix');
    if (prevRemix){
      this.stopListening(prevRemix);
    }
    var remix = this.get('remix');
    if (remix){
      this.listenTo(remix, 'change:playing', this.onRemixPlayingChange);
    }
    this.get('clipPlayer').set('remix', remix);
  },
  
  onRemixPlayingChange: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
  
    var remix = this.get('remix');
    
    var delay = this.get('startTime') - remix.get('playTime');
    
    if (remix.get('playing')){
      if (delay >= 0){
        this.playTimeout = setTimeout(this.prepareToPlay, Math.max(0, delay - WebRemixer.preloadDelay) * 1000);
      }else if (-delay <= this.get('duration')){
        this.play();
      }
    }else{
      this.pause();
    }
  },
  
  prepareToPlay: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }

    var remix = this.get('remix');
    
    remix.set('realTimeNeeded', true);
    
    var delay = this.get('startTime') - remix.get('playTime');
    
    this.get('clipPlayer').set({
      playTime: 0
    });
    
    this.playTimeout = setTimeout(this.play, delay * 1000);
  },
  
  play: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
    
    var remix = this.get('remix');
    
    remix.set('realTimeNeeded', true);
    
    var passed = remix.get('playTime') - this.get('startTime');
    
    var pauseDelay = this.get('duration') - passed;
    
    if (pauseDelay >= 0){
      var loop = this.get('loop') && this.get('duration') > this.get('clip').get('cutDuration');
       
      this.get('clipPlayer').set({
        loop: loop,
        playTime: loop ? passed % this.get('clip').get('cutDuration') : passed,
        playing: true
      });
      this.playTimeout = setTimeout(this.pause, pauseDelay * 1000);
    }else{
      this.pause();
    }
  },
  
  pause: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
    this.get('clipPlayer').set('playing', false);
  },
  
  onTimelineChange: function(){
    var timeline = this.get('timeline');
    var remix = timeline ? timeline.get('remix') : null;
    this.set('remix', remix);
    this.get('clipPlayer').set('remix', remix);
  }
});
WebRemixer.Models.Timeline = Backbone.Model.extend({

  urlRoot: 'timelines',
  
  shouldBeIdRefInJSON: true,
  
  includeInJSON: ['remix', 'order'],

  initialize: function(){
    this.set({
      timelineClips : new WebRemixer.Collections.TimelineClips(),
      selection : {
        startTime: 0,
        duration: 0
      }
    });
     
    this.listenTo(this.get('timelineClips'), {
      add: this.onTimelineClipsAdd,
      remove: this.onTimelineClipsRemove
    });
    
    this.listenTo(this, {
      change: this.onChange,
      'change:remix': this.onRemixChange
    });
    
    this.trigger('change:remix');
  },
  
  onChange: WebRemixer.Util.Model.saveChanged,
  
  onRemixChange: function(){
    if (this.collection){
      if (!this.get('order')){
        this.set('order', this.collection.indexOf(this) + 1);
      }
    }
  },
  
  onTimelineClipsAdd: function(model){
    model.set('timeline', this);
  },
  
  onTimelineClipsRemove: function(model){
    model.set('timeline', null);
  }
  
});
WebRemixer.Models.Ruler = Backbone.Model.extend({
  initialize: function(){
  
  }
});
WebRemixer.Models.ClipPlayer = Backbone.Model.extend({

  initialize: function(){
    _.bindAll(this);
    this.listenTo(this, {
      'change:playing': this.onPlayingChange,
      'change:playTime': this.onPlayTimeChange
    });
  },
  
  getFreePlayer: function(){
    return (
      this.get('remix').get('playerManager')
          .get('videoPlayersByVideo')[this.get('clip').get('video').cid]
          .where({
            owner: null
          })[0]
    );
  },

  onPlayingChange: function(){
    if (this.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  onPlayTimeChange: function(){
    var playTime = this.get('playTime');
    
    if (playTime != undefined){
      //reserve a player if we haven't already
      var videoPlayer = this.get('videoPlayer');
      if (!videoPlayer){
        videoPlayer = this.getFreePlayer();
        if (videoPlayer){
          videoPlayer.set({
            owner: this
          });
          this.set('videoPlayer', videoPlayer);
        }
      }
      
      if (videoPlayer){
        videoPlayer.set({
          playTime: this.get('clip').get('cutStart') + playTime
        });
      }
      
      this.set('playTime', undefined, {silent: true});
    }
  },
  
  play: function(){
    this.pause();
  
    var videoPlayer = this.get('videoPlayer2') || this.getFreePlayer();
    
    var clip = this.get('clip');
    
    var clipDuration = clip.get('cutDuration');
    
    var playTime = (this.get('playTime') || 0) % clipDuration;
    
    videoPlayer.set({
      owner: this,
      playTime: clip.get('cutStart') + playTime,
      playing: true
    });
    
    if (this.get('loop')){
      var timeTillLoop = clipDuration - playTime;
      this.loopTime = new Date() * 1 + timeTillLoop * 1000;
      this.loopTimeout = setTimeout(this.prepareToLoop, Math.max(0, timeTillLoop - WebRemixer.preloadDelay) * 1000);
    }
    
    this.set({
      playTime: undefined,
      videoPlayer: videoPlayer,
      videoPlayer2: undefined
    }, {silent: true});
  },
  
  prepareToLoop: function(){
    var videoPlayer = this.getFreePlayer();
    
    videoPlayer.set({
      owner: this,
      playTime: this.get('clip').get('cutStart')
    });
    this.set('videoPlayer2', videoPlayer);
    
    if (this.loopTimeout){
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined;
    }
    this.loopTimeout = setTimeout(this.play, this.loopTime - new Date() * 1);
  },
  
  pause: function(){
    if (this.loopTimeout){
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined;
    }
  
    var videoPlayer = this.get('videoPlayer');
    if (videoPlayer){
      videoPlayer.set({
        owner: null,
        playTime: undefined,
        playing: false
      });
      
      this.set('videoPlayer', null);
    }
  }
});
WebRemixer.Models.MainMenu = Backbone.Model.extend({

  initialize: function(){
    
  }
  
});
WebRemixer.Models.VideoPlayer = Backbone.Model.extend({

  defaults: {
    owner: null
  },

  initialize: function(){
    
  }
});
WebRemixer.Models.PlayerManager = Backbone.Model.extend({

  defaults: {
    duration: 200
  },

  initialize: function(){
    _.bindAll(this);
    
    this.allocatePlayers = _.debounce(this.allocatePlayers, 250);
  
    this.set({
      videoPlayersByVideo: {},
     timelineClipsByVideo: {}
    });
        
    this.listenTo(this.get('remix').get('timelines'), {
      add: this.onTimelinesAdd
    });
  },
  
  onTimelinesAdd: function(model){
    this.listenTo(model.get('timelineClips'), {
      add: this.onTimelineClipsAdd,
      remove: this.onTimelineClipsRemove
    });
  },
  
  allocatePlayers: function(){
    var timelineClipsByVideo = this.get('timelineClipsByVideo');
    for (var cid in timelineClipsByVideo){
      var timelineClips = timelineClipsByVideo[cid];
      
      var needed = 0;
      for (var i = timelineClips.length; i--; ){
        var curr = timelineClips.at(i);
        var intersections = 0;
        for (var z = timelineClips.length; z--; ){
          var other = timelineClips.at(z);
          if (WebRemixer.Util.intersects(curr, other)){
            intersections += (other.get('loop') && other.get('duration') > other.get('clip').get('cutDuration')) ? 2 : 1;
          }
        }
        needed = Math.max(needed, intersections);
      }
      
      this.allocatePlayersForVideo(timelineClips.video, needed);
    }
  },
  
  allocatePlayersForVideo: function(video, needed){
    var videoPlayersByVideo = this.get('videoPlayersByVideo');
  
    var videoPlayers = videoPlayersByVideo[video.cid];
    
    if (!videoPlayers){
      videoPlayers = videoPlayersByVideo[video.cid] = new WebRemixer.Collections.VideoPlayers();
    }
    
    if (videoPlayers.length < needed){
      do {
        var videoPlayer = 
          new WebRemixer.Models.VideoPlayer({
            video: video
          });
        videoPlayers.add(videoPlayer);
        
        //instantiate view so flash/html5 videoPlayer gets appended to dom
        new WebRemixer.Views.VideoPlayer({
          el: $("<div/>").appendTo(document.body),
          model: videoPlayer
        });
      } while (videoPlayers.length < needed);
    }else if (videoPlayers.length > needed){
      do {
        videoPlayers.pop().destroy();
      } while (videoPlayers.length > needed);
    }
  },
  
  onTimelineClipsAdd: function(model){
    var video = model.get('clip').get('video');
    var timelineClipsByVideo = this.get('timelineClipsByVideo');
  
    var timelineClips = timelineClipsByVideo[video.cid];
    if (!timelineClips){
      timelineClips = timelineClipsByVideo[video.cid] = new WebRemixer.Collections.TimelineClips();
      timelineClips.video = video;
    }
    
    timelineClips.add(model);
    
    this.listenTo(model, {
     'change destroy' : this.allocatePlayers
    });
    
    this.allocatePlayers();
  },
  
  onTimelineClipsRemove: function(model){
    this.stopListening(model);
  
    this.get('timelineClipsByVideo')[model.get('clip').get('video').cid].remove(model);
    
    this.allocatePlayers();
  }
  
});
WebRemixer.Models.VideoFinder = Backbone.Model.extend({
  initialize: function(){
    this.set('videos', new WebRemixer.Collections.Videos());
  }
});
WebRemixer.Models.PlayControls = Backbone.Model.extend({
  initialize: function(){
  
  }
});
WebRemixer.Models.ClipManager = Backbone.Model.extend({

  initialize: function(){
    
  }
});
WebRemixer.Models.Remix = Backbone.Model.extend({
  urlRoot: 'remixes',
  
  includeInJSON: ['title'],

  defaults: {
    duration: 200,
    playTime: 0
  },
  
  shouldBeIdRefInJSON: true,

  initialize: function(){
  
    _.bindAll(this, 'playProcedure', 'onGotChildren');

    var opts = {
      remix: this
    };
    
    this.set({
            mainMenu: new WebRemixer.Models.MainMenu(opts),
        playControls: new WebRemixer.Models.PlayControls(opts),
               ruler: new WebRemixer.Models.Ruler(opts),
         clipManager: new WebRemixer.Models.ClipManager(opts),
       clipInspector: new WebRemixer.Models.ClipInspector(opts),
           timelines: new WebRemixer.Collections.Timelines(),
               clips: new WebRemixer.Collections.Clips()
    });
    
    this.set({
       playerManager: new WebRemixer.Models.PlayerManager(opts)
    });
    
    this.listenTo(this.get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
    
    this.listenTo(this.get('timelines'), {
      add: this.onTimelinesAdd,
      remove: this.onTimelinesRemove
    });
    
    this.listenTo(this, {
      change: this.onChange,
      'change:playing': this.onPlayingChange,
      'change:realTimeNeeded': this.onRealTimeNeededChange
    });
    
    this.listenTo(this.get('clips'), 'change', this.onClipsChange);
    this.listenTo(this.get('timelines'), 'change', this.onTimelinesChange);
    
    if (this.id) {
      this.fetchChildren();
    }else{
      this.save();
    }
  },
  
  fetchChildren: function(){
    if (!this.id) return;
    
    $.get('%s/children'.sprintf(this.url()), this.onGotChildren);
  },
  
  onGotChildren: function(res){
    console.log(res);
  },
  
  onChange: WebRemixer.Util.Model.saveChanged,
  
  /*
  onTimelinesChange: function(){
    this.save(undefined, {
      attrs: {
        clips: this.get('timelines').pluck(Backbone.Model.prototype.idAttribute)
      }
    }, {patch: true});
  },
  */
  
  onRealTimeNeededChange: function(){
    if (this.get('realTimeNeeded')){
      this.playProcedure();
      this.set('realTimeNeeded', false, {silent: true});
    }
  },
  
  onClipsAdd: function(model){
    model.set('remix', this);
  },
  
  onClipsRemove: function(model){
    model.set('remix', undefined);
  },
  
  onTimelinesAdd: function(model){
    model.set('remix', this);
  },
  
  onTimelinesRemove: function(model){
    model.set('remix', undefined);
  },
  
  onPlayingChange: function(){
    if (this.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  play: function(){
    this.playStartTime = new Date() * 1 - this.get('playTime') * 1000;
    this.playInterval = setInterval(this.playProcedure, 0);
  },
  
  playProcedure: function(){
    this.set('playTime', ((new Date() * 1) - this.playStartTime) / 1000);
  },
  
  pause: function(){
    if (this.playInterval){
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }
  }
  
});
WebRemixer.Models.ClipInspector = Backbone.Model.extend({

  initialize: function(){
    this.set('videoFinder', new WebRemixer.Models.VideoFinder({
      
    }));
  }
});
WebRemixer.Collections.Videos = Backbone.Collection.extend({
  model: WebRemixer.Models.Video
});
WebRemixer.Collections.Clips = Backbone.Collection.extend({
  model: WebRemixer.Models.Clip
});
WebRemixer.Collections.TimelineClips = Backbone.Collection.extend({
  model: WebRemixer.Models.TimelineClip
});
WebRemixer.Collections.VideoPlayers = Backbone.Collection.extend({
  model: WebRemixer.Models.VideoPlayer
});
WebRemixer.Collections.Timelines = Backbone.Collection.extend({
  model: WebRemixer.Models.Timeline
});