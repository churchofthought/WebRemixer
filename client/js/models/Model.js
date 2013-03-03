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