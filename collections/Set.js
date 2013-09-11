define([

], function(

){
	var KsfSet = function() {
		Set.apply(this, arguments);
	};
	var proto = KsfSet.prototype = Object.create(Set.prototype);

	proto.toArray = function() {
		var res = [];
		this.forEach(function(v){
			res.push(v);
		});
		return res;
	};
	proto.difference = function(otherSet) {
		var res = new KsfSet();
		this.forEach(function(v){
			res.add(v);
		});
		otherSet.forEach(function(v) {
			res.delete(v);
		});
		return res;
	};

	return KsfSet;
});