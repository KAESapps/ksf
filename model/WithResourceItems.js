define([

], function(

){
	// mixin for manager of resources of type Set
	// add a create method on a resource of type Set that is a shortcut to the create method of a manager
	// that cannot be done directly by the resource factory since she would have to know the specified manager (which is not recommanded)
	// TODO: prevent adding items that are not know by the specified manager ?
	var WithItemsFromResourceManager = function(args){
		var create = this.create;
		this.create = function(){
			var rsc = create.apply(this, arguments);
			rsc.create = function(createArgs){
				var item = args.manager.create(createArgs);
				rsc.add(item);
				return item;
			};
			return rsc;
		};
	};

	return WithItemsFromResourceManager;
});