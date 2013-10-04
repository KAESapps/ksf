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
		var setValue = this.setValue;
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
			setValue.call(this, rsc, value);
			// call this.setValue at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.setValue(rsc, this.getValue(rsc));
		};
		this.setValue = function(){}; // read only
	};

	return WithValueFromManager;
});