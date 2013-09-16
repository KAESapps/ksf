define([

], function(

){
	return function(args){
		this.serialize = function(list){
			var res = list.map(args.itemSerializer.serialize);
			if (res.toArray) {
				res = res.toArray();
			}
			return res;
		};
		this.deserialize = function(list){
			return list.map(args.itemSerializer.deserialize);
		};
		this.serializePropName = args.serializePropName;
	};
});