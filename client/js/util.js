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