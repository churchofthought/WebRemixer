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