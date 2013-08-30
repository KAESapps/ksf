define([

], function(

){
	/**
	 * The value for this property is a ressource stored on another resources manager
	 * The value is retrieved and set at installation time and cannot be changed (but its content can still be changed)
	 * @param {object} manager The resourcesManager on which the value is retrieved
	 * @param {string} getByProperty The property name to retrieve by
	 */
	var WithValueFromManager = function (args) {
		var install = this.install;
		var set = this.set;
		this.install = function(rsc){
			install.apply(this, arguments);
			// get resource
			var value = args.manager.getBy(args.getByProperty, rsc);
			// or create it
			if (!value){
				var options = {};
				options[args.getByProperty] = rsc;
				value = args.manager.create(options);
			}
			set.call(this, rsc, value);
			// call this.set at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.set(rsc, this.get(rsc));
		};
		this.set = function(){}; // read only
	};

	return WithValueFromManager;
});