// mongodb uses _id
Backbone.Model.prototype.idAttribute = WebRemixer.Models.idAttribute = '_id';

// model cache
WebRemixer.Models.all = new Backbone.Collection();



// global model cache, by overriding backbone model constructor
// backbone code uses Backbone.Model (itself) instead of BackBone.Model.prototype.constructor
// this makes the code a little fatter, but we get it done nonetheless
(function(){
  var origClass = Backbone.Model;
  Backbone.Model = function(){
    WebRemixer.Models.all.add(this);

    origClass.apply(this, arguments);

    if (this.isNew()){
      this.prevJSON = {};
    }else{
      this.prevJSON = this.toJSON();
    }
  };

  // copy over backbone.model methods
  for (var prop in origClass){
    if (origClass.hasOwnProperty(prop)){
      Backbone.Model[prop] = origClass[prop];
    }
  }
  Backbone.Model.prototype = origClass.prototype;
  
})();

// toJSON looks at AttrType attribute
// determines which attributes to include
// model references in includeById are replaced with their id
Backbone.Model.prototype.toJSON = function() {
  var attributes = {};

  for (var attr in this.attributes){
    var AttrType = this.includeInJSON[attr];
    if (AttrType){
      var attrVal = this.attributes[attr];
      if (attrVal instanceof Backbone.Model && AttrType.prototype instanceof Backbone.Model && !AttrType.prototype.includedAsObject){
        attributes[attr] = attrVal.id;
      }else{
        attributes[attr] = attrVal;
      }
    }
  }

  return attributes;
};


// server sends back id strings, we need a model instead
// parse takes care of this

// server also sends back nested model contents
// we should set the nested models attributes and replace Object with the Model
// parse takes care of this
Backbone.Model.prototype.parse = function(response){
  
  // check to see if we have id references
  // we can pull the models from the model cache

  for (var attr in response){
    var AttrType = this.includeInJSON[attr];
    if (AttrType){
      var attrVal = response[attr];
      if (AttrType.prototype instanceof Backbone.Model){
        var existing;
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
    }
  }

  return response;

};





(function(){
  var originalSave = Backbone.Model.prototype.save;

  var onSave = function(model){
    model.beingCreated = false;
    if (model.deferredSave){
      model.deferredSave = false;
      model.save();
    }
  };

  Backbone.Model.prototype.save = function(){
    if (this.beingCreated){
      this.deferredSave = true;
      return;
    }

    var curAttrs = this.toJSON();
    var prevAttrs = this.prevJSON;

    this.prevJSON = curAttrs;

    var diffAttrs = {};

    for (var attr in curAttrs){
      var curVal = curAttrs[attr];
      if (!_.isEqual(curVal, prevAttrs[attr])){
        diffAttrs[attr] = curVal;
      }
    }

    if (this.isNew()){
      this.beingCreated = true;
      return originalSave.call(this, undefined, {
        success: onSave, 
        error: onSave
      });
    }else if (!_.isEmpty(diffAttrs)){
      return originalSave.call(this, undefined, {attrs: diffAttrs});
    }

  };

})();