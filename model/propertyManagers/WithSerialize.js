define([

], function(

){
	return	function(args){
		this.serialize = function(value){
			return value;
		};
		this.deserialize = function(value){
			return value;
		};
		this.serializePropName = args.serializePropName;
	};
});