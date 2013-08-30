define([

], function(

){
	return function(args){
		var syncIdProperty = args.syncIdProperty || "id";
		this.serialize = function(rsc){
			return args.manager.getPropValue(rsc, syncIdProperty);
		};
		this.deserialize = function(id){
			// ce n'est pas au resource manager d'être lazy, car le cas dans lequel on souhaite être lazy, c'est celui de la résolution d'id, donc on le fait ici
			var rsc = args.manager.getBy(syncIdProperty, id);
			if (!rsc){
				rsc = args.manager.create();
				args.manager.setPropValue(rsc, syncIdProperty, id);
			}
			return rsc;
		};
		this.serializePropName = args.serializePropName;
		return this;
	};
});