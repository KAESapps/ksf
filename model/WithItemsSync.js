define([

], function(

){
	// syncable resourcesManager mixin that store data of related resources on fetch and merge them on merge
	// bon c'est pas terrible comme logique... ça sera à retravailler, peut-être que l'on pourrait mettre ça sur les property managers plutôt... le problème c'est pour "fetch"
	return function(args){
		var fetch = this.fetch;
		this.fetch = function(rsc){
			return fetch.apply(this, arguments).then(function(response){
				var items = args.getResponse2Items(response);
				var time = new Date();
				// stores data for each item
				items.forEach(function(item){
					var itemId = args.item2id(item);
					var itemData = args.item2data(item);
					var rsc = args.itemManager.getBy(args.itemManager.syncIdProperty, itemId);
					if(!rsc) {
						rsc = args.itemManager.create();
						args.itemManager.setPropValue(rsc, args.itemManager.syncIdProperty, itemId);
					}
					args.itemManager.setPropValue(rsc, args.itemManager.lastSourceDataProperty, {
						time: time,
						data: itemData,
					});
				});
				return response;
			});
		};
		var merge = this.merge;
		this.merge = function(rsc, options){
			merge.apply(this, arguments);
			var items = this.getPropValue(rsc, args.propName);
			items.forEach(function(item){
				args.itemManager.merge(item);
			});
		};
	};
});