define([
], function(
){
	/**
	L’implémentation ResourceManagerWithProperties délègue l’accès aux données relatives à une resource à des PropertyManager.
	Le resource manager peut augmenter les resources qu’il crée pour leur ajouter par exemple des méthodes de synchro (pull, push).
	Les propertyManager peuvent aussi augmenter les resources sur lesquelles ils sont appliqués (installés).
	On privilégiera d’enrichir la méthode de création du resource manager quand la méthode ajoutée ne dépend pas d’une propriété en particulier.

	*/
	var Manager = function(args){
		this.resources = new Set();
		this.propertyManagers = {};
		this._factory = args.factory;
	};
	Manager.prototype = {
		create: function(args){
			// create instance
			var rsc = this._factory.create(args);
			// register resource
			this.add(rsc);
			// install properties
			Object.keys(this.propertyManagers).forEach(function(propName){
				this.propertyManagers[propName].install(rsc);
			}.bind(this));
			// set initial values
			args && this.setEachPropValue(rsc, args);
			return rsc;
		},
		destroy: function(rsc){
			this.remove(rsc);
			Object.keys(this.propertyManagers).forEach(function(propName){
				var propMng = this.propertyManagers[propName];
				propMng.uninstall(rsc);
			}.bind(this));
			rsc.destroy && rsc.destroy();
		},
		getPropValue: function(rsc, propName){
			return this.propertyManagers[propName].getValue(rsc);
		},
		setPropValue: function(rsc, propName, value){
			var propMng = this.propertyManagers[propName];
			return propMng && propMng.setValue(rsc, value);
		},
		setEachPropValue: function(rsc, values){
			Object.keys(values).forEach(function(propName){
				this.setPropValue(rsc, propName, values[propName]);
			}.bind(this));
		},
/*		// variant of setPropValue that do not set a new value but only change content of the current value
		addToPropValue: function(rsc, propName, item){
			return this.propertyManagers[propName].add(rsc, item);
		},
		// variant of setPropValue that do not set a new value but only change content of the current value
		removeFromPropValue: function(rsc, propName, item){
			return this.propertyManagers[propName].remove(rsc, item);
		},
*/
		addProperty: function(propMng, name){
			this.propertyManagers[name] = propMng;
			propMng.owner = this;
		},
		// TODO: mettre ces méthodes dans un mixin "WithCache" en disant que ce sont des méthodes à usage interne
		add: function(rsc){
			return this.resources.add(rsc);
		},
		remove: function(rsc){
			return this.resources.delete(rsc);
		},
		has: function(rsc){
			return this.resources.has(rsc);
		},
		getBy: function(prop, value){
			return this.propertyManagers[prop].getRsc(value);
		},
		get: function(value){
			return this.getBy(this.getProperty, value);
		},
		getOrCreate: function(id){
			var rsc = this.get(id);
			if (!rsc){
				var args = {};
				args[this.getProperty] = id;
				rsc = this.create(args);
			}
			return rsc;
		},
	};

	return Manager;
});