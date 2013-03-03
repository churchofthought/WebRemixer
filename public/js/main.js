var WebRemixer = {
	Config: {},
	Util: {},
	Routers: {},
	Views: {},
	Models: {},
	Collections: {}
};
WebRemixer.EMS_PER_SEC = 8;
$(function(){
	WebRemixer.PX_PER_SEC = WebRemixer.EMS_PER_SEC * parseFloat($(document.body).css('fontSize'));
});

// models
WebRemixer.Models.idAttribute = '_id';


// -- configurable constants -- //
// model save delay
WebRemixer.Config.saveOnChangeDelay = 500;
WebRemixer.Config.preloadDelay = .5;
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
$(function(){
	WebRemixer.router = new WebRemixer.Routers.Remix();
	Backbone.history.start({pushState: true});
});
WebRemixer.Routers.Remix = Backbone.Router.extend({

	routes: {
			new : "newRemix",
		":id" : "getRemix"
	},

	newRemix: function() {
		
		var remix = new WebRemixer.Models.Remix();
		
		new WebRemixer.Views.Remix({
			model: remix
		}).$el.appendTo(document.body);

		remix.save();
		remix.once('change:' + remix.idAttribute, this.onNewRemixSaved);
	},

	onNewRemixSaved: function(model){
		for (var count = 6; count--;){
			new WebRemixer.Models.Timeline({remix: model}).save();
		}
	},

	getRemix: function(id) {
		var attrs = {};
		attrs[WebRemixer.Models.idAttribute] = id;

		var remix = new WebRemixer.Models.Remix(attrs);
		
		new WebRemixer.Views.Remix({
			model: remix
		}).$el.appendTo(document.body);
		
		remix.fetch();
	}

});
// give every view access to common elements and window width / height
WebRemixer.Util.$window = $(window);
WebRemixer.Util.$html = $(document.documentElement);

WebRemixer.Util.$window.resize(function(){
	WebRemixer.Util.winWidth = WebRemixer.Util.$window.width();
	WebRemixer.Util.winHeight = WebRemixer.Util.$window.height();
}).trigger('resize');

$(function(){
	WebRemixer.Util.$body = $(document.body);
});
WebRemixer.View = Backbone.View.extend({
	constructor: function(){
		_.bindAll(this);

		Backbone.View.apply(this, arguments);

		this.$el
			.prop('id', this.model.cid)
			.data('view', this);
	}
});

HTMLDocument.prototype.createSVGElement = _.partial(HTMLDocument.prototype.createElementNS, 'http://www.w3.org/2000/svg');
WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',

	events: {
		mousedown: 'onMouseDown',
		mousemove: 'onMouseMove',
		mouseup: 'onMouseUp'
	},

	initialize: function(){
		this.$svg = document.createSVGElement('svg');

		var $defs = document.createSVGElement('defs');
		$defs.appendChild(this.createGridPattern());


		this.$pointPath = document.createSVGElement('path');
		this.$pointPath.className.baseVal = 'pointPath';

		this.$svg.appendChild($defs);
		this.$svg.appendChild(this.createBackground());
		this.$svg.appendChild(this.$pointPath);
		this.$el.append(this.$svg);

		this.$tooltip = $('<div/>').prop('className', 'tooltip').appendTo(this.el);

		this.listenTo(this.model, 'change:points', this.onPointsChange);
	},

	createGridPattern: function(){
		var $pattern = document.createSVGElement('pattern');

		$pattern.id = 'automation-grid';
		$pattern.setAttribute('patternUnits', 'userSpaceOnUse');
		$pattern.setAttribute('width', '1em');
		$pattern.setAttribute('height', '1em');

		var $rect = document.createSVGElement('rect');
		$rect.className.baseVal = 'vertical-rule';
		$rect.setAttribute('width', 1);
		$rect.setAttribute('height', '100%');
		$pattern.appendChild($rect);

		$rect = document.createSVGElement('rect');
		$rect.className.baseVal = 'horizontal-rule';
		$rect.setAttribute('width', '100%');
		$rect.setAttribute('height', 1);
		$pattern.appendChild($rect);

		return $pattern;
	},

	createBackground: function(){
		var $bg = document.createSVGElement('rect');
		$bg.className.baseVal = 'bg';
		$bg.setAttribute('width', '100%');
		$bg.setAttribute('height', '100%');

		return $bg;
	},

	pointFromEvent: function(event){
		var offs = this.$el.offset();
		return [event.pageX - offs.left, event.pageY - offs.top];
	},

	onMouseDown: function(event){
		this.mousedownPoint = this.pointFromEvent(event);
		if (event.target.className.baseVal == 'point'){
			this.$draggingPoint = event.target;
			event.stopPropagation();
			event.preventDefault();
		}
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);

		var height = this.$el.height();

		this.$tooltip.css({
			left: mousePoint[0],
			top: mousePoint[1]
		}).text('(' +
			(Math.floor(100 * mousePoint[0] / WebRemixer.PX_PER_SEC)/ 100) + ',' +
			(Math.floor(10000 * (height - mousePoint[1]) / height) / 100) +
		')');

		if (this.$draggingPoint){
			event.stopPropagation();
			event.preventDefault();

			this.$draggingPoint.setAttribute('cx', mousePoint[0]);
			this.$draggingPoint.setAttribute('cy', mousePoint[1]);


			var points = this.model.get('points');

			var draggedPoint = this.$draggingPoint.point;

			var curIndex = _.sortedIndex(points, draggedPoint, function(p){
				return p[0];
			});

			var newIndex = _.sortedIndex(points, mousePoint, function(p){
				return p[0];
			});

			draggedPoint[0] = mousePoint[0];
			draggedPoint[1] = mousePoint[1];

			var diff = newIndex - curIndex;

			if (diff > 1){
				points.splice(newIndex - 1, 0, points.splice(curIndex, 1)[0]);
			}else if (diff < 0){
				points.splice(newIndex, 0, points.splice(curIndex, 1)[0]);
			}

			this.drawPath(points);
		}
	},

	onMouseUp: function(event){
		if (this.mousedownPoint && !this.$draggingPoint){
			var point = this.pointFromEvent(event);
			if (_.isEqual(this.mousedownPoint, point)){
				this.addPoint(point);
			}
		}

		this.mousedownPoint = undefined;
		this.$draggingPoint = undefined;
	},

	addPoint: function(point){
		var points = this.model.get('points');

		points.splice(_.sortedIndex(points, point, function(p){
			return p[0];
		}), 0, point);

		this.drawPoint(point);
		this.drawPath(points);
	},

	drawPoint: function(point){
		var $point = document.createSVGElement('circle');
		$point.className.baseVal = 'point';
		$point.setAttribute('cx', point[0]);
		$point.setAttribute('cy', point[1]);
		$point.setAttribute('r', '.3em');

		point.$point = $point;
		$point.point = point;

		this.$svg.appendChild($point);
	},

	drawPath: function(points){
		this.$pointPath.setAttribute('d', 'M' + points.join('L'));
	},

	onPointsChange: function(automationData, points){



	}
});
WebRemixer.Views.Clip = WebRemixer.View.extend({
	
	className: 'clip',
	
	events: {
		  dragstart     : 'onDragStart',
		'click .delete' : 'onDeleteClick'
	},
	
	initialize: function(){
		/*this.$el
			.draggable({
				snap: '.timeline',
				grid: [WebRemixer.PX_PER_SEC / 8, 1],
				helper: 'clone',
				appendTo: document.body
			});*/
			
		$('<div/>').prop('className', 'buttons').append(
			$('<button/>').prop('className', 'inspect').button({
				icons: {
					primary: 'ui-icon-pencil'
				},
				label: 'Inspect',
				text: false
			}),
			$('<button/>').prop('className', 'delete').button({
				icons: {
					primary: 'ui-icon-close'
				},
				label: 'Delete',
				text: false
			})
		).appendTo(this.el);
			
		this.listenTo(this.model, 'change', this.render);
		
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
			this.$el.css('background-image', 'url("' + video.get('thumbnail') + '")');
		}
		
		this.$el.attr({
			'data-title': this.model.get('title'),
			'data-duration': this.model.get('cutDuration') + 's'
		});
	}
});
WebRemixer.Views.ClipInspector = WebRemixer.View.extend({
	className: 'clip-inspector',
		
	events: {
		dialogopen : 'onOpen',
		dialogclose : 'onClose',
		'change .clip-title' : 'onTitleInputChange',
		'slide .cut' : 'onCutSlide',
		'slidestop .cut' : 'onCutSlide',
		'click .clip-video' : 'onVideoClick'
	},
	
	initialize: function(){
		new WebRemixer.Views.VideoFinder({
			model: this.model.get('videoFinder')
		});
		
		this.$title = $('<input type="text"/>')
		.prop('className', 'clip-title')
		.attr('placeholder', 'Title')
		.appendTo(this.el);
			
			
		
		var $cutContainer = $('<div/>').prop('className', 'cut').appendTo($('<div/>').attr('data-label', 'Cut').appendTo(this.el));
		
		this.$cutSlider = $('<div/>').prop('className', 'cut-slider').slider({
			range: true,
			min: 0
		}).appendTo($cutContainer);
		
		this.$cutStart = $('<span/>').prop('className', 'cut-start').appendTo($cutContainer);
		this.$cutEnd = $('<span/>').prop('className', 'cut-end').appendTo($cutContainer);
		
		
		this.$video = $('<div/>').prop('className', 'clip-video').appendTo(
			$('<div/>').attr('data-label', 'Video').appendTo(this.el)
		);
		
		
		
		
		
		this.listenTo(this.model, {
			'change:open': this.onVisibilityChange,
			'change:clip': this.onClipChange
		});
		this.listenTo(this.model.get('videoFinder'), 'change:video', this.onVideoFinderVideoChanged);
		
		$(this.onLoad);
	},
	
	onVideoFinderVideoChanged: function(videoFinder, video){

		if (video){
			this.model.get('clip').set('video', video);
			videoFinder.set('open', false);
		}
		
	},
	
	onVideoClick: function(){
		this.model.get('videoFinder').set({
			video: undefined,
			open: true
		});
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
	
	onVisibilityChange: function(clipInspector, open){
		if (open){
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
		this.model.set('open', true, {silent: true});
	},
	
	onClose: function(){
		this.model.set('open', false, {silent: true});
	},
	
	onClipChange: function(clipInspector, clip){
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
		this.onClipVideoChange(clip, clip.get('video'));
	},
	
	onClipVideoChange: function(clip, video){
		
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
		
			if (previousVideo && clip.get('title') === previousVideo.get('title')){
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

	onClipTitleChange: function(clip, title){
		this.$title.val(title);
	},
	
	onTitleInputChange: function(){
		var clip = this.model.get('clip');
		var title = this.$title.val();
		clip.set('title', _.isEmpty(title) ? clip.get('video').get('title') : title);
	},
	
	
});
WebRemixer.Views.ClipManager = WebRemixer.View.extend({
	className: 'clip-manager',
		
	events: {
		'click .clip .inspect' : 'onInspectClick',
						 'click .clip' : 'onInspectClick',
				 'click .new-clip' : 'createNewClip',
							sortout    : 'onSortOut',
							sortover   : 'onSortOver',
							sortupdate : 'onSortUpdate'
	},

	initialize: function(){
		this.onSortUpdate = _.wrap(this.onSortUpdate, _.defer);

		this.$newClip = $('<button/>').prop('className', 'new-clip').button({
			icons: {
				primary: 'ui-icon-plus'
			},
			label: 'New Clip',
			text: false
		}).appendTo(this.el);
			
		this.$clips = $('<div/>').prop('className', 'clips').sortable({
			tolerance: 'pointer'
		}).appendTo(this.el);
	
		this.listenTo(this.model, 'change:open', this.onVisibilityChange);

		var remix = this.model.get('remix');

		this.listenTo(remix.get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});

		this.listenTo(remix, 'change:clipIds', this.onClipIdsChange);
		
		this.onVisibilityChange(this.model, this.model.get('open'));

		$(this.onLoad);
	},

	onLoad: function(){
		this.$el.appendTo(document.body);
	},

	onSortOver: function(event, ui){
		ui.item.addClass('over-manager');
	},

	onSortOut: function(event, ui){
		ui.item.removeClass('over-manager');
	},
	
	onVisibilityChange: function(clipManager, open){
		if (open){
			this.$el.addClass('open');
		}else{
			this.$el.removeClass('open');
		}
	},
	
	createNewClip: function(){
		var clip =
			new WebRemixer.Models.Clip({
				remix: this.model.get('remix')
			});

		clip.save();

		this.inspect( clip );
	},

	onClipIdsChange: function(remix, clipIds){
		var $clips = this.$clips;

		$clips.children('.clip').each(function(){
			var $this = $(this);

			var order = $this.data('view').model.get('order');

			$clips.children('.clip').each(function(){
				if (order < $(this).data('view').model.get('order')){
					$this.insertBefore(this);
					return false;
				}
			});

		});

	},

	onSortUpdate: function(event, ui){
		this.model.get('remix').set('clipIds',
			this.$clips.children('.clip').map(function(){
				return $(this).data('view').model.id;
			}).get()
		);
	},

 	onClipsAdd: function(clip){
		this.listenTo(clip, 'change:' + clip.idAttribute, this.onSortUpdate);

		var view = new WebRemixer.Views.Clip({
			model: clip
		});

		var order = clip.get('order');

		if (order >= 0){
			//insert clip in the correct position
			this.$clips.children('.clip').each(function(){
				if (order < $(this).data('view').model.get('order')){
					view.$el.insertBefore(this);
					return false;
				}
			});
		}

		//if not inserted, insert the clip
		if (!view.$el.parent().length){
			this.$clips.append(view.el);
		}
	},

	onClipsRemove: function(clip){
		this.stopListening(clip);

		this.$clips.single('#' + clip.cid).data('view').remove();
	},
	
	onInspectClick: function(event){
		this.inspect($(event.currentTarget).closest('.clip').data('view').model);
	},
	
	inspect: function(clip){
		this.model.get('remix').get('clipInspector').set({
			open: true,
			clip: clip
		});
	}
});
WebRemixer.Views.ClipPlayer = WebRemixer.View.extend({
	className: 'clip-player'
});
WebRemixer.Views.MainMenu = WebRemixer.View.extend({
	className: 'main-menu',
	
	initialize: function(){
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
	}
});
WebRemixer.Views.PlayControls = WebRemixer.View.extend({
	className: 'play-controls',
		
	events: {
		'click .play' : 'onPlayClick',
		'click .stop' : 'onStopClick',
		'click .restart' : 'onRestartClick'
	},
	


	initialize: function(){	
		this.$el.append(
		
			$('<button/>').prop('className', 'restart').button({
				text: false,
				icons: {
					primary: 'ui-icon-seek-start'
				},
				label: 'Restart'
			}),
			
			this.$play = $('<button/>').prop('className', 'play').button({
				text: false,
				icons: {
					primary: 'ui-icon-play'
				},
				label: 'Play'
			}),
		 
			$('<button/>').prop('className', 'stop').button({
				text: false,
				icons: {
					primary: 'ui-icon-stop'
				},
				label: 'Stop'
			})

			
			
		);
		
		this.listenTo(this.model.get('remix'), 'change:playing', this.onPlayingChange);
	},
	
	onPlayingChange: function(remix, playing){
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
		remix.trigger('change:playTime');
	}
	
});
WebRemixer.Views.Remix = WebRemixer.View.extend({
	className: 'remix',
		
	events: {
		'change .title' : 'onTitleInputChange',
		'click .toggle-clip-manager': 'onToggleClipManagerClick'
	},
	


	initialize: function(){
		this.$title = $('<input type="text"/>').prop('className', 'title').attr('placeholder', 'Title Your Remix').appendTo(this.el);
			
		this.mainMenu = new WebRemixer.Views.MainMenu({
			model: this.model.get('mainMenu')
		});
		this.mainMenu.$el.appendTo(this.el);
		
		this.playControls = new WebRemixer.Views.PlayControls({
			model: this.model.get('playControls')
		});
		this.playControls.$el.appendTo(this.el);
		
		this.ruler = new WebRemixer.Views.Ruler({
			model: this.model.get('ruler'),
			$remix: this.el
		});
		this.ruler.$el.appendTo(this.el);

		this.timelineManager = new WebRemixer.Views.TimelineManager({
			model: this.model.get('timelineManager')
		});
		this.timelineManager.$el.appendTo(this.el);
		
		this.clipManager = new WebRemixer.Views.ClipManager({
			model: this.model.get('clipManager')
		});
		this.clipManager.model.set('open', true);
		
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
		
		this.listenTo(this.model, 'change:title', this.onTitleChange);
		
		this.onTitleChange(this.model, this.model.get('title'));
	},
	
	onTitleInputChange: function(){
		this.model.set('title', this.$title.val());
		
		this.$title.blur();
	},
	
	onTitleChange: function(remix, title){
		this.$title.val(title);
	},
	
	onToggleClipManagerClick: function(){
		var cm = this.model.get('clipManager');
		cm.set('open', !cm.get('open'));
	}
});
WebRemixer.Views.Ruler = WebRemixer.View.extend({
	className: 'ruler',
	
	events: {
		click : 'onClick'
	},
	
	initialize: function() {
		var remix = this.model.get('remix');

		this.$markings = $('<div/>').prop('className', 'markings').appendTo(this.el);
		this.$timeHand = $('<div/>').prop('className', 'timeHand').appendTo(this.options.$remix);
	
		
		
		this.listenTo(remix, {
			'change:duration' : this.render,
			'change:playTime' : this.onPlayTimeChange,
			'change:playing'  : this.onPlayingChange
		});

		this.render();

		this.onPlayTimeChange(remix, remix.get('playTime'));
	
		WebRemixer.Util.$window.scroll(this.onScroll);
	},

	onScroll: function(){
		this.$el.css('transform', 'translate3d(0,' + WebRemixer.Util.$window.scrollTop() + 'px,0)');
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
	
	onPlayTimeChange: function(remix, playTime){
		
		if (WebRemixer.Util.$body){
			WebRemixer.Util.$body.add(WebRemixer.Util.$html).stop(true, true).animate({
				scrollLeft: Math.max(0, WebRemixer.PX_PER_SEC * playTime + this.$el.prop('offsetLeft') - WebRemixer.Util.winWidth / 2)
			});
		}

		this.$timeHand.css('transform', 'translate3d(' + (WebRemixer.EMS_PER_SEC * playTime) + 'em' + ',0,0)');
	},
	
	render: function() {
		this.$markings.empty();
		for (var i = 0, duration = this.model.get('remix').get('duration'); i <= duration; ++i){
			this.$markings.append($('<div/>').text(i).append('<div/>'));
		}
	}
});
WebRemixer.Views.Timeline = WebRemixer.View.extend({
	className: 'timeline',
	
	events: {
		'click .toggle-height' : 'onToggleHeightClick',
		'drop .timeline-clips' : 'onDrop'
	},

	initialize: function(){
			
		this.$header = $('<div/>')
			.prop('className', 'header')
			.appendTo(this.el);
			
		this.$toggleHeight = $('<button/>').prop('className', 'toggle-height')
			.button({
				icons: {
					primary: 'ui-icon-circle-triangle-s'
				},
				label: 'Collapse',
				text: false
			}).appendTo(this.$header);

		this.automationData = new WebRemixer.Views.AutomationData({
			model: this.model.get('automationData')
		});
		this.automationData.$el.appendTo(this.el);

		this.$timelineClips = $('<div/>').prop('className', 'timeline-clips').droppable({
			accept: '.clip, .timeline-clip',
			tolerance: 'pointer',
			hoverClass: 'ui-state-highlight'
		}).appendTo(this.el);
			
		$('<div/>').prop('className', 'selection').appendTo(this.el);
		
		this.listenTo(this.model, {
			'change:collapsed': this.onCollapsedChange,
			'change:remix': this.onRemixChange,
			'change:order': this.onOrderChange
		});
		this.listenTo(this.model.get('timelineClips'), {
			add: this.onTimelineClipsAdd,
			remove: this.onTimelineClipsRemove
		});

		this.onRemixChange(this.model, this.model.get('remix'));

		WebRemixer.Util.$window.scroll(this.onScroll);
	},

	onScroll: function(){
		this.$header.css('transform', 'translate3d(0,' + (-WebRemixer.Util.$window.scrollTop()) + 'px,0)');
	},
	
	onOrderChange: function(timeline, order){
		this.$header.attr(
			'data-title', 'Timeline ' + (order + 1)
		);
	},
	
	onRemixChange: function(timeline, remix){
		var prevRemix = this.model.previous('remix');
		if (prevRemix){
			this.stopListening(prevRemix);
		}
		
		if (remix){
			this.listenTo(remix, 'change:selection', this.onSelectionChange);
		}
	},
	
	onTimelineClipsAdd: function(timelineClip){
		var $timelineClip = $.single('#' + timelineClip.cid);

		if (!$timelineClip.length){
			$timelineClip = new WebRemixer.Views.TimelineClip({
				model: timelineClip
			}).el;
		}

		this.$timelineClips.append($timelineClip);
	},
	
	onTimelineClipsRemove: function(timelineClip){
		if (!timelineClip.get('timeline')){
			var view = this.$timelineClips.single('#' + timelineClip.cid).data('view');
			if (view){
				view.remove();
			}
		}
	},

	onToggleHeightClick: function(){
		this.model.set('collapsed', !this.model.get('collapsed'));
	},
	
	onCollapsedChange: function(timeline, collapsed){
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
		});
		
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
	
	onSelectionChange: function(remix, selection){
	
		var offset = this.$el.offset();
		var height = this.$el.height();
		
		var $selection = this.$el.single('.selection');

		//make sure selection is at least 1x1 and check for the 3 types of intersections
		if (selection.width >= 1 && selection.height >= 1 &&
				((selection.offset.top >= offset.top && selection.offset.top <= offset.top + height) ||
				(selection.offset.top + selection.height >= offset.top && selection.offset.top + selection.height <= offset.top + height) ||
				(selection.offset.top <= offset.top && selection.offset.top + selection.height >= offset.top + height))) {
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
		if (ui.draggable.hasClass('over-manager')){
			return;
		}

		var view = ui.draggable.data('view');
		
		if (view instanceof WebRemixer.Views.TimelineClip){
			view.model.set('timeline', this.model);
		}else if (view instanceof WebRemixer.Views.Clip){
			new WebRemixer.Models.TimelineClip({
				timeline: this.model,
				clip: view.model,
				startTime: (ui.offset.left - this.$timelineClips.offset().left) / WebRemixer.PX_PER_SEC,
				loop: true
			}).save();
		}
	}
});
WebRemixer.Views.TimelineClip = WebRemixer.View.extend({
	className: 'timeline-clip',
	
	events: {
		dragstop: 'onDragStop',
		resizestop: 'onResizeStop',
		'click .toggle-loop': 'toggleLoop',
		'click .duplicate': 'duplicate',
		'click .delete': 'del'
	},
	
	initialize: function(){
		var grid = [WebRemixer.PX_PER_SEC / 8, 1];

		this.$el.draggable({
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
		
		this.$loopIndicator = $('<div/>').prop('className', 'loop-indicator').appendTo(this.el);
		
		var $buttons = $('<div/>').prop('className', 'buttons');
		
		var loopId = Math.random().toString(36);
		var $loopLabel = $('<label/>').attr('for', loopId).appendTo($buttons);

		$buttons.append(
		
			$('<input type="checkbox"/>').prop({
					id: loopId,
					class: 'toggle-loop'
				}).appendTo($buttons).button({
				icons: {
					primary: 'ui-icon-refresh'
				},
				label: 'Loop',
				text: false
			}),
			
			$('<button/>').prop('className', 'duplicate').button({
				icons: {
					primary: 'ui-icon-copy'
				},
				label: 'Duplicate',
				text: false
			}),
			
			$('<button/>').prop('className', 'delete').button({
				icons: {
					primary: 'ui-icon-close'
				},
				label: 'Delete',
				text: false
			})
			
		).appendTo(this.el);
		
		
		
		this.listenTo(this.model, {
							 change : this.render,
		'change:timeline' : this.onTimelineChange,
		'change:selected' : this.onSelectedChange
		});

		this.render();

		this.onSelectedChange(this.model, this.model.get('selected'));
	},
	
	onSelectedChange: function(timelineClip, selected){
		if (selected){
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
			if (!this.$el.parent('.timeline-clips').length){
				this.$el.appendTo(this.origDraggableParent);
			}
			this.model.set('startTime', (this.$el.position().left - this.origDraggableParent.offset().left) / WebRemixer.PX_PER_SEC);
			this.origDraggableParent = undefined;
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
			timeline: this.model.get('timeline'),
			clip: this.model.get('clip'),
			startTime: this.model.get('startTime') + (typeof timeDelta === 'number' && timeDelta || this.model.get('duration')),
			duration: this.model.get('duration'),
			loop: this.model.get('loop'),
			selected: selected
		});

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
			background: 'url("' + video.get('thumbnail') + '")',
			left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
			width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
		}).attr({
			'data-title': clip.get('title')
		});
	}
	
});
WebRemixer.Views.TimelineManager = WebRemixer.View.extend({
	className: 'timelines',
		
	events: {
		selectablestart : 'onSelectStart',
		selectableselecting : 'onSelecting',
		selectableunselecting : 'onUnselecting',
		selectableselected : 'onSelected',
		selectableunselected : 'onUnselected',
		selectablestop : 'onSelectStop',
		'contextmenu .timeline-clips' : 'onContextMenu',
		'contextmenu .selection' : 'onContextMenu',
		mousedown : 'onMouseDown',
		sortupdate : 'onTimelinesSortUpdate'
	},

	initialize: function(){
		this.onTimelinesSortUpdate = _.wrap(this.onTimelinesSortUpdate, _.defer);

		this.$el.sortable({
			tolerance: 'pointer',
			handle: '.header'
		});

		this.$el.selectable({
			filter: '.timeline-clip'
		});

		this.$contextMenu = $('<ul/>')
			.prop('className', 'context-menu')
			.append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate</a></li>')
			.append('<li data-cmd="delete"><a><span class="ui-icon ui-icon-close"></span>Delete</a></li>')
			.menu({
				select: this.onMenuSelect
			})
			.appendTo(document.body);
			
		var remix = this.model.get('remix');

		this.listenTo(remix, 'change:timelineIds', this.onTimelineIdsChange);
		this.listenTo(remix.get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
	},

	onMenuSelect : function(event, ui){
	
		this.$contextMenu.removeClass('show');
		
		switch (ui.item.attr('data-cmd')){
			case 'duplicate':
				this.$el.children('.timeline').each(function(){
					$(this).data('view').duplicateSelection();
				});
				this.shiftSelectionRight();
			break;
			
			case 'delete':
				this.$el.children('.timeline').each(function(){
					$(this).data('view').deleteSelection();
				});
			break;
			
		}
	},
	
	shiftSelectionRight: function(){
		var remix = this.model.get('remix');

		var curSelection = remix.get('selection');
		curSelection.offset.left += curSelection.width;

		remix.trigger('change:selection', remix, curSelection);
	},
	
	onMouseDown: function(){
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
	
	/* TODO :: make more efficient! */
	updateSelection: function(repeat){
		var remix = this.model.get('remix');
		var $helper = this.$helper;
		var selection = remix.get('selection');

		var updateSelectionProc = function(){
			selection.offset = $helper.offset();
			selection.width = $helper.width();
			selection.height = $helper.height();
			remix.trigger('change:selection', remix, selection);
		};

		updateSelectionProc();

		if (repeat){
			this.updateSelectionIntervalID = setInterval(updateSelectionProc, 50);
		}
	},

	onSelectStop: function(event, ui){
		this.updateSelection();
		clearInterval(this.updateSelectionIntervalID);
	},

	onContextMenu: function(event){
		event.stopPropagation();
		event.preventDefault();
		
		this.$contextMenu.css({
			left: event.pageX,
			top: event.pageY
		}).addClass('show');
	},

	onTimelinesSortUpdate: function(timeline){
		this.model.get('remix').set('timelineIds',
			this.$el.children('.timeline').map(function(){
				return $(this).data('view').model.id;
			}).get()
		);
	},


	onTimelineIdsChange: function(remix, timelineIds){

		var $el = this.$el;

		$el.children('.timeline').each(function(){
			var $this = $(this);

			var order = $this.data('view').model.get('order');

			$el.children('.timeline').each(function(){
				if (order < $(this).data('view').model.get('order')){
					$this.insertBefore(this);
					return false;
				}
			});
		});
	},

	onTimelinesAdd: function(timeline){
		this.listenTo(timeline, 'change:' + timeline.idAttribute, this.onTimelinesSortUpdate);

		var view = new WebRemixer.Views.Timeline({
			model: timeline
		});

		var order = timeline.get('order');

		if (order >= 0){
			//insert timeline in the correct position
			this.$el.children('.timeline').each(function(){
				if (order < $(this).data('view').model.get('order')){
					view.$el.insertBefore(this);
					return false;
				}
			});
		}

		//if not inserted, insert the timeline
		if (!view.$el.parent().length){
			this.$el.append(view.el);
		}
	},
	
	onTimelinesRemove: function(timeline){
		this.stopListening(timeline);

		this.$el.single('#' + timeline.cid).data('view').remove();
	}

});
WebRemixer.Views.Video = WebRemixer.View.extend({
	className: 'video',
	
	initialize: function(){
		this.listenTo(this.model, 'change', this.render);
		
		this.render();
	},
	
	getFormattedDuration: function(){
		var duration = this.model.get('duration');
		return '%d:%02d'.sprintf(duration / 60, duration % 60);
	},
	
	render: function(){
		this.$el.css('background-image', 'url("' + this.model.get('thumbnail') + '")')
		.attr({
			'data-title': this.model.get('title'),
			'data-duration': this.getFormattedDuration()
		});
	}
});
WebRemixer.Views.VideoFinder = WebRemixer.View.extend({
	className: 'video-finder',
		
	events: {
		dialogopen : 'onOpen',
		dialogclose : 'onClose',
		'change .search': 'onSearchChange',
		'click .video': 'onVideoClick'
	},
	
	initialize: function(){
		this.$search = $('<input type="text"/>').prop('className', 'search').appendTo(
			$('<div/>').attr('data-label', 'Search').appendTo(this.el)
		);
		this.$searchResults = $('<div/>').prop('className', 'search-results').appendTo(this.el);
		
		
		this.listenTo(this.model, 'change:open', this.onVisibilityChange);
		this.listenTo(this.model.get('videos'), {
			add: this.onVideosAdd,
			reset: this.onVideosReset
		});
		//this.$search.val('kaskade');
		//this.onSearchChange();

		$(this.onLoad);
	},
	
	onVideosAdd: function(video){
		this.$searchResults.append(
			new WebRemixer.Views.Video({
				model: video
			}).el
		);
	},
	
	onVideosReset: function(){
		this.$searchResults.children('.video').each(function(){
			$(this).data('view').remove();
		});
	},
	
	onOpen: function(){
		this.model.set('open', true, {silent: true});
	},
	
	onClose: function(){
		this.model.set('open', false, {silent: true});
	},
	
	onVisibilityChange: function(videoFinder, open){
		if (open){
			this.$el.dialog('open');
			this.$search.select();
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
	}
});
WebRemixer.Views.VideoPlayer = WebRemixer.View.extend({
	className: 'video-player',
	
	initialize: function(){
		
		this.$video = $('<iframe/>').hide().prop({
			id: Math.random().toString(36),
			src: 'http://www.youtube.com/embed/' + this.model.get('video').get('sourceVideoId') +
				'?origin=http://' + location.host + '&enablejsapi=1&html5=1&autoplay=0&controls=0'
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
	
	onPlayTimeChange: function(videoPlayer, playTime){
		// check to make sure playTime is not undefined
		if (playTime >= 0){
			this.seek(playTime);
			this.model.set('playTime', undefined, {silent: true});
		}
	},
	
	onPlayingChange: function(videoPlayer, playing){
		if (playing){
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
	}
});
// model cache
WebRemixer.Models.all = new Backbone.Collection();

WebRemixer.Model = Backbone.Model.extend({
	idAttribute: WebRemixer.Models.idAttribute,

	constructor: function(){
		_.bindAll(this);

		WebRemixer.Models.all.add(this);

		this.prevJSON = {};

		Backbone.Model.apply(this, arguments);

		if (!this.isNew()){
			this.prevJSON = this.toJSON();
		}

	},

	// toJSON looks at AttrType attribute
	// determines which attributes to include
	// model references in includeById are replaced with their id
	toJSON: function() {
		var attributes = {};

		for (var attr in this.attributes){
			
			var AttrType = this.includeInJSON[attr];
			if (!AttrType) continue;

			var attrVal = this.attributes[attr];
			if (attrVal instanceof Backbone.Model){
				if (attrVal.includedAsObject){
					attributes[attr] = attrVal.toJSON();
				}else{
					attributes[attr] = attrVal.id;
				}
			}else{
				attributes[attr] = attrVal;
			}

		}

		return attributes;

	},


	// server sends back id strings, we need a model instead
	// parse takes care of this

	// server also sends back nested model contents
	// we should set the nested models attributes and replace Object with the Model
	// parse takes care of this
	parse: function(response, options){
		// check to see if we have id references
		// we can pull the models from the model cache

		var curJSON = this.toJSON();
		var prevJSON = _.clone(this.prevJSON);

		// update prevJSON with the state from the server
		_.extend(this.prevJSON, response);

		for (var attr in response){
			var AttrType = this.includeInJSON[attr];
			if (!AttrType) continue;

			// if attribute has changed locally, don't use the value from the server
			if (!_.isEqual(curJSON[attr], prevJSON[attr])){
				response[attr] = curJSON[attr];
				continue;
			}

			// if attribute isn't a model, forget about it
			if (! (AttrType.prototype instanceof Backbone.Model)) continue;

			var existing;
			var attrVal = response[attr];

			if (AttrType.prototype.includedAsObject){

				existing = this.get(attr);
				if (existing && existing instanceof Backbone.Model){
					existing.set(attrVal);
				}else{
					existing = new AttrType(attrVal);
				}

			}else{

				existing = WebRemixer.Models.all.get(attrVal);
				if (!existing){
					var attrs = {};
					attrs[AttrType.prototype.idAttribute] = attrVal;
					existing = new AttrType(attrs);
					existing.fetch();
				}

			}

			response[attr] = existing;
		}

		return response;

	}
});

WebRemixer.Model.createOrUpdate = function(dataArr){
	for (var i = dataArr.length; i--;){
		var dat = dataArr[i];
		var existing = WebRemixer.Models.all.get(dat[this.prototype.idAttribute]);

		if (existing){
			existing.set( existing.parse(dat) );
		}else{
			new this( dat, {parse: true});
		}
	}
};





(function(){

	var onFetched = function(model){
		this.beingFetched = false;
		if (this.deferredSave){
			this.deferredSave = false;
			this.save();
		}
	};

	WebRemixer.Model.prototype.fetch = function(){
		this.beingFetched = true;
		return Backbone.Model.prototype.fetch.call(this).always(_.bind(onFetched, this));
	};

})();





(function(){

	var onSaved = function(model){
		this.beingCreated = false;
		if (this.deferredSave){
			this.deferredSave = false;
			this.save();
		}
	};

	WebRemixer.Model.prototype.save = function(){
		if (this.beingCreated || this.beingFetched){
			this.deferredSave = true;
			return;
		}

		var curAttrs = this.toJSON();

		var diffAttrs = {};

		for (var attr in curAttrs){
			var curVal = curAttrs[attr];
			if (!_.isEqual(curVal, this.prevJSON[attr])){
				diffAttrs[attr] = curVal;
			}
		}

		this.prevJSON = curAttrs;

		if (this.isNew()){
			this.beingCreated = true;
			return Backbone.Model.prototype.save.call(this)
					.always(_.bind(onSaved, this));
		}else if (!_.isEmpty(diffAttrs)){
			return Backbone.Model.prototype.save.call(this, undefined, {attrs: diffAttrs});
		}

	};

})();
WebRemixer.Models.Remix = WebRemixer.Model.extend({
	urlRoot: 'remixes',
	
	includeInJSON: {title: String, timelineIds: Array, clipIds: Array},

	defaults: {
		duration: 200,
		playTime: 0
	},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		var opts = {
			remix: this
		};

		if (!_.isArray(this.get('timelineIds'))){
			this.set('timelineIds', []);
		}

		if (!_.isArray(this.get('clipIds'))){
			this.set('clipIds', []);
		}

		this.set({
						mainMenu: new WebRemixer.Models.MainMenu(opts),
				playControls: new WebRemixer.Models.PlayControls(opts),
							 ruler: new WebRemixer.Models.Ruler(opts),
			 clipInspector: new WebRemixer.Models.ClipInspector(opts),
					 timelines: new WebRemixer.Collections.Timelines(),
							 clips: new WebRemixer.Collections.Clips()
		});
		
		this.set({
			 clipManager: new WebRemixer.Models.ClipManager(opts),
			 timelineManager: new WebRemixer.Models.TimelineManager(opts),
			 playerManager: new WebRemixer.Models.PlayerManager(opts),
			 selection: {}
		});
		
		this.listenTo(this, 'change', this.onChange);

		this.listenTo(this, 'change:' + this.idAttribute, this.onChangeId);
		
		if (this.id) {
			this.fetchChildren();
		}
	},

	onChange: function(){
		this.save();
	},

	onChangeId: function(){
		WebRemixer.router.navigate(this.id);
	},
	
	fetchChildren: function(){
		$.get(this.url() + '/children', this.onFetchedChildren);
	},
	
	onFetchedChildren: function(res){
		WebRemixer.Models.Clip.createOrUpdate(res.clips);
		
		WebRemixer.Models.Timeline.createOrUpdate(res.timelines);
		
		WebRemixer.Models.TimelineClip.createOrUpdate(res.timelineClips);

		this.trigger('fetchedChildren');
	}

});
WebRemixer.Models.Timeline = WebRemixer.Model.extend({

	urlRoot: 'timelines',
	
	includeInJSON: {remix: WebRemixer.Models.Remix},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		this.set({
			automationData: new WebRemixer.Models.AutomationData({timeline: this}),
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

		this.onRemixChange(this, this.get('remix'));
	},
	
	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(timeline, remix){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('timelines').remove(this);
			this.stopListening(prevRemix);
		}
	
		if (remix){
			var timelines = remix.get('timelines');

			timelines.add(this);
			
			this.listenTo(remix, 'change' + remix.idAttribute, this.onChange);
		}
	},
	
	onTimelineClipsAdd: function(timelineClip){
		timelineClip.set('timeline', this);
	},
	
	onTimelineClipsRemove: function(timelineClip){
		if (timelineClip.get('timeline') === this){
			timelineClip.set('timeline', undefined);
		}
	}
});
WebRemixer.Models.Video = WebRemixer.Model.extend({

	urlRoot: 'videos',
	
	defaults: {
		source: 'youtube'
	},
	
	includedAsObject: true,
	includeInJSON: {source: String, sourceVideoId: String},

	initialize: function(){
		if (!this.get('title')){
			$.getJSON('https://gdata.youtube.com/feeds/api/videos/' + this.get('sourceVideoId'), { 
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
WebRemixer.Models.Clip = WebRemixer.Model.extend({

	urlRoot: 'clips',

	defaults: {
		cutStart: 0,
		cutDuration: 5,
		title: 'New Clip'
	},
	
	includeInJSON: {remix: WebRemixer.Models.Remix, title: String, video: WebRemixer.Models.Video, cutStart: Number, cutDuration: Number},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		this.listenTo(this, {
			change: this.onChange,
			'change:remix': this.onRemixChange,
			'change:video': this.onVideoChange
		});

		this.onRemixChange(this, this.get('remix'));
		this.onVideoChange(this, this.get('video'));
	},
	
	onChange: function(){
		this.save();
	},


	onRemixChange: function(clip, remix){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('clips').remove(this);
			this.stopListening(prevRemix);
		}
	
		if (remix){
			var clips = remix.get('clips');

			clips.add(this);

			this.listenTo(remix, 'change:' + remix.idAttribute, this.onChange);
		}
	},
	
	onVideoChange: function(clip, video){
		var previousVideo = this.previous('video');
		if (previousVideo){
			this.stopListening(previousVideo);
		}
		
		if (video){
			this.listenTo(video, {
				change: _.partial(this.trigger, 'change'),
				'change:title': this.onVideoTitleChange
			});
			
			this.onVideoTitleChange(video, video.get('title'));
		}
	},
	
	onVideoTitleChange: function(video, videoTitle){
		var title = this.get('title');
		if (_.isEmpty(title) || title === this.defaults.title){
			this.set('title', videoTitle);
		}
	}
	
});
WebRemixer.Models.TimelineClip = WebRemixer.Model.extend({

	urlRoot: 'timeline-clips',
	
	includeInJSON: {remix: WebRemixer.Models.Remix, timeline: WebRemixer.Models.Timeline, clip: WebRemixer.Models.Clip, startTime: Number, duration: Number, loop: Boolean},
		
	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);
	
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
			change: _.partial(this.trigger, 'change'),
			destroy: this.destroy
		});
		
		this.listenTo(this, {
			change: this.onChange,
			'change:timeline': this.onTimelineChange,
			'change:remix': this.onRemixChange
		});

		this.onTimelineChange(this, this.get('timeline'));
		this.onRemixChange(this, this.get('remix'));
	},

	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(timelineClip, remix){
		var prevRemix = this.previous('remix');
		if (prevRemix){
			this.stopListening(prevRemix);
		}

		if (remix){
			this.listenTo(remix, 'change:playing', this.onRemixPlayingChange);
			this.listenTo(remix, 'change:' + remix.idAttribute, this.onChange);
		}
		this.get('clipPlayer').set('remix', remix);
	},


	onTimelineChange: function(timelineClip, timeline){
		var prevTimeline = this.previous('timeline');
		if (prevTimeline){
			prevTimeline.get('timelineClips').remove(this);
			this.stopListening(prevTimeline);
		}

		var remix;

		if (timeline){
			timeline.get('timelineClips').add(this);
			this.listenTo(timeline, 'change:' + WebRemixer.Models.Timeline.prototype.idAttribute, this.onChange);

			remix = timeline.get('remix');
		}

		this.set('remix', remix);
	},
	
	onRemixPlayingChange: function(remix, playing){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined;
		}
		
		var delay = this.get('startTime') - remix.get('playTime');
		
		if (playing){
			if (delay >= 0){
				this.playTimeout = setTimeout(this.prepareToPlay, Math.max(0, delay - WebRemixer.Config.preloadDelay) * 1000);
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
		
		remix.trigger('updatePlayTime');
		
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
		
		remix.trigger('updatePlayTime');
		
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

	intersects: function(lineClip){
		var start1 = this.get('startTime');
		var end1 = start1 + this.get('duration') + WebRemixer.Config.preloadDelay;
		
		var start2 = lineClip.get('startTime');
		var end2 = start2 + lineClip.get('duration');

		return (
			// if second clip starts within the first clip  
			(start2 > start1 && start2 < end1) ||

			// if second clip ends within the first clip
			(end2 > start1 && end2 < end1) ||

			// if second clip is large enough to contain the first clip
			(start2 <= start1 && end2 >= end1)
		);
	}

});
WebRemixer.Models.AutomationData = WebRemixer.Model.extend({

	initialize: function(){
		this.set('points', []);
	}
});
WebRemixer.Models.ClipInspector = WebRemixer.Model.extend({

	initialize: function(){
		this.set('videoFinder', new WebRemixer.Models.VideoFinder({
		
		}));
	}
});
WebRemixer.Models.ClipManager = WebRemixer.Model.extend({
	
	initialize: function(){
		var remix = this.get('remix');

		this.listenTo(remix.get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});

		this.listenTo(remix, 'change:clipIds', this.onClipIdsChange);
	},

	onClipIdsChange: function(remix, clipIds){
		var clips = remix.get('clips');

		for (var i = clipIds.length; i--;){
			var clip = clips.get(clipIds[i]);
			if (clip) clip.set('order', i);
		}
	},

	onClipsAdd: function(clip){
		clip.set('remix', this.get('remix'));
	},
	
	onClipsRemove: function(clip){
		if (clip.get('remix') === this.get('remix')){
			clip.set('remix', undefined);
		}
	}

});
WebRemixer.Models.ClipPlayer = WebRemixer.Model.extend({

	initialize: function(){
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
						owner: undefined
					})[0]
		);
	},

	onPlayingChange: function(clipPlayer, playing){
		if (playing){
			this.play();
		}else{
			this.pause();
		}
	},
	
	onPlayTimeChange: function(clipPlayer, playTime){
		if (_.isNumber(playTime)){
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
			this.loopTimeout = setTimeout(this.prepareToLoop, Math.max(0, timeTillLoop - WebRemixer.Config.preloadDelay) * 1000);
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
				owner: undefined,
				playTime: undefined,
				playing: false
			});
			
			this.set('videoPlayer', undefined);
		}
	}
});
WebRemixer.Models.MainMenu = WebRemixer.Model.extend({

});
WebRemixer.Models.PlayControls = WebRemixer.Model.extend({

	initialize: function(){
		this.listenTo(this.get('remix'), {
			'change:playing': this.onPlayingChange,
			'updatePlayTime': this.updatePlayTime
		});
	},

	updatePlayTime: function(){
		this.get('remix').set('playTime', ((new Date()).getTime() - this.playStartTime) / 1000);
	},
	
	onPlayingChange: function(remix, playing){
		if (playing){
			this.play();
		}else{
			this.pause();
		}
	},
	
	play: function(){
		var remix = this.get('remix');

		var playStartTime = this.playStartTime = (new Date()).getTime() - remix.get('playTime') * 1000;

		this.playInterval = setInterval(function(){
			remix.set('playTime', ((new Date()).getTime() - playStartTime) / 1000);
		}, 0);
	},
	
	pause: function(){
		if (this.playInterval){
			clearInterval(this.playInterval);
			this.playInterval = undefined;
		}
	}
});
WebRemixer.Models.PlayerManager = WebRemixer.Model.extend({

	defaults: {
		duration: 200
	},

	initialize: function(){
		this.allocatePlayers = _.debounce(this.allocatePlayers, 250);

		this.set({
			videoPlayersByVideo: {},
			timelineClipsByVideo: {}
		});

		this.listenTo(this.get('remix').get('timelines'), {
			add: this.onTimelinesAdd
		});
	},

	onTimelinesAdd: function(timeline){
		this.listenTo(timeline.get('timelineClips'), {
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
					if (curr.intersects(other)){
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
					el: $('<div/>').appendTo(document.body),
					model: videoPlayer
				});
			} while (videoPlayers.length < needed);
		}else if (videoPlayers.length > needed){
			do {
				videoPlayers.pop().destroy();
			} while (videoPlayers.length > needed);
		}
	},

	onTimelineClipsAdd: function(timelineClip){
		var video = timelineClip.get('clip').get('video');
		var timelineClipsByVideo = this.get('timelineClipsByVideo');

		var timelineClips = timelineClipsByVideo[video.cid];
		if (!timelineClips){
			timelineClips = timelineClipsByVideo[video.cid] = new WebRemixer.Collections.TimelineClips();
			timelineClips.video = video;
		}

		timelineClips.add(timelineClip);

		this.listenTo(timelineClip, 'change destroy', this.allocatePlayers);

		this.allocatePlayers();
	},

	onTimelineClipsRemove: function(timelineClip){
		this.stopListening(timelineClip);

		this.get('timelineClipsByVideo')[timelineClip.get('clip').get('video').cid].remove(timelineClip);

		this.allocatePlayers();
	}

});
WebRemixer.Models.Ruler = WebRemixer.Model.extend({
	initialize: function(){
	
	}
});
WebRemixer.Models.TimelineManager = WebRemixer.Model.extend({
	
	initialize: function(){
		var remix = this.get('remix');

		this.listenTo(remix.get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
		this.listenTo(remix, 'change:timelineIds', this.onTimelineIdsChange);
	},

	onTimelineIdsChange: function(remix, timelineIds){
		var timelines = remix.get('timelines');
		for (var i = timelineIds.length; i--;){
			var timeline = timelines.get(timelineIds[i]);
			if (timeline) timeline.set('order', i);
		}
	},

	onTimelinesAdd: function(timeline){
		timeline.set('remix', this.get('remix'));
	},

	onTimelinesRemove: function(timeline){
		if (timeline.get('remix') === this.get('remix')){
			timeline.set('remix', undefined);
		}
	}
});
WebRemixer.Models.VideoFinder = WebRemixer.Model.extend({
	initialize: function(){
		this.set('videos', new WebRemixer.Collections.Videos());
	}
});
WebRemixer.Models.VideoPlayer = WebRemixer.Model.extend({
	
});
WebRemixer.Collections.Clips = Backbone.Collection.extend({
	model: WebRemixer.Models.Clip
});
WebRemixer.Collections.TimelineClips = Backbone.Collection.extend({
	model: WebRemixer.Models.TimelineClip
});
WebRemixer.Collections.Timelines = Backbone.Collection.extend({
	model: WebRemixer.Models.Timeline
});
WebRemixer.Collections.VideoPlayers = Backbone.Collection.extend({
	model: WebRemixer.Models.VideoPlayer
});
WebRemixer.Collections.Videos = Backbone.Collection.extend({
	model: WebRemixer.Models.Video
});