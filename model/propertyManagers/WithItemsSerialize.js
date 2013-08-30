define([

], function(

){
	return function(args){
		this.serialize = function(list){
			return list.map(args.itemSerializer.serialize);
		};
		this.deserialize = function(list){
			return list.map(args.itemSerializer.deserialize);
		};
		this.serializePropName = args.serializePropName;
	};
});