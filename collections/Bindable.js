define([
	"bacon",
	"../utils/destroy",
], function(
	Bacon,
	destroy
){
	var identity = function (o) { return o; };

	var Bindable = {
		// call set(prop) with value from observable at each notification
		setR: function(prop, observable){
			return this.own(observable.onValue(this, "set", prop));
		},
		// create a bidi value binding from source to this
		bind: function(targetProp, source, sourceProp, options){
			var init = true;
			var target = this;
			var sourceValueR = source.getR(sourceProp);
			var targetValueR = target.getR(targetProp);
			var changing = false;
			var sourceHandler = sourceValueR.onValue(function(value){
				if (! changing){
					changing = true;
					target.set(targetProp, (options && options.convert ? options.convert.call(target, value) : value));
					changing = false;
				}
			});
			var targetHandler = targetValueR.onValue(function(value){
				if (! changing && ! init){ // prevent calling source.set at init time
					changing = true;
					source.set(sourceProp, (options && options.revert ? options.revert.call(target, value) : value));
					changing = false;
				}
			});
			init = false;
			return this.own(function(){
				targetHandler();
				sourceHandler();
			});
		},

		// whenChanged(...props, cb(...props))
		// called whenever at least one of the props changed (so, only once when many props changed)
		// if cb returns something, this is owned by this (destroyed when this is destroyed) and destroyed at the next call
		// cb can also be a collection of cb
		whenChanged: function(){
			var cbCanceler;

			var props = Array.prototype.slice.call(arguments, 0, arguments.length-1);
			var binder;
			var lastArg = arguments[arguments.length-1];
			if (typeof lastArg === 'function'){
				binder = lastArg;
			} else {
				binder = function(){
					var cmps = arguments;
					return lastArg.map(function(cb) {
						return cb.apply(this, cmps);
					}.bind(this));
				};
			}

			var observingCanceler = this.getEachR.apply(this, props).onValue(function(propsValues){
				if (cbCanceler){
					destroy(cbCanceler);
					cbCanceler = undefined;
				}
				cbCanceler = binder.apply(this, propsValues);
			}.bind(this));

			return this.own(function(){
				destroy(observingCanceler);
				destroy(cbCanceler);
			});
		},

		/**
		 * Same as whenChanged but only call cb if all of props are defined (!== undefined)
		 * Whenever at least one key change, the last return from cb is destroyed even if the cb is not called. So the return of cb is only active during the time all of props are defined
		 * @param {string} props list of properties to observe
		 * @param {[function, iterable]} cb function or list of function that is/are called with the values of corresponding props whenever at least one of them change
		 * @return {[function]} canceler Stop observing the properties and calling cb. But the last return from cb is not destroyed
		 */
		whenDefined: function(){
			var collection = this;
			var args = arguments;
			var cbs = arguments[arguments.length-1];
			if (typeof cbs === 'function'){
				cbs = [cbs];
			}
			args[args.length-1] = cbs.map(function(cb) {
				return function(){
					if (Array.prototype.every.call(arguments, function(val){
						return val !== undefined;
					})) {
						return cb.apply(collection, arguments);
					}
				};
			});
			return this.whenChanged.apply(this, args);
		},

		whenDefinedEach: function() {
			Array.prototype.forEach.call(arguments, function(args) {
				this.whenDefined.apply(this, args);
			}, this);
		},

		bindEvent: function(source, eventType, target, targetMethod){
			return this.when(source, target, function(source, target){
				return source.on(eventType, function(ev){
					target[targetMethod](ev);
				});
			});
		},
		// create a bidirectionnal binding with the following logic: targetProp value is the content item from the collection for which itemProp is truthy
		// at init time, the target prop value is the winner
		// TODO: allow a "multi" behavior > the targetProp become a collection (unordered set)
		bindSelection:function(targetProp, collection, itemProp, multi){
			var changing = false;
			var target = this;
			var currentItem = this.get(targetProp);
			// init time
			collection.forEach(function(item){
				item.set(itemProp, item === currentItem);
			});

			// incremental update
			var targetHandler = this.getR(targetProp).diff(undefined, function(oldItem, currentItem){
				return {oldItem: oldItem, currentItem: currentItem};
			}).skip(1).onValue(function(oldAndCurrentItems){
				if (! changing){
					changing = true;
					var oldItem = oldAndCurrentItems.oldItem;
					var currentItem = oldAndCurrentItems.currentItem;
					oldItem && collection.has(oldItem) && oldItem.set(itemProp, false);
					currentItem && collection.has(currentItem) && currentItem.set(itemProp, true);
					changing = false;
				}
			});

			var itemHandlers = new Map();
			var sourceHandler = collection.asChangesStream().onValue(function(changes){
				changes.forEach(function(change){
					var item = change.value;
					if (change.type === "add"){
						item.set(itemProp, item === target.get(targetProp));
						itemHandlers.set(item, item.getR(itemProp).skip(1).onValue(function(bool){
							if (! changing){
								changing = true;
								var oldItem = target.get(targetProp);
								oldItem && collection.has(oldItem) && oldItem.set(itemProp, false);
								target.set(targetProp, bool ? item : undefined);
								changing = false;
							}
						}));
					}
					if (change.type === "remove"){
						destroy(itemHandlers.get(item));
						itemHandlers.delete(item);
					}
				});
			});

			// return a canceler
			return this.own(function(){
				destroy(targetHandler);
				destroy(sourceHandler);
				itemHandlers.forEach(destroy);
			});
		},
		// create a bidirectionnal binding between this (source) and target where sourceProp has the value corresponding to the truthy property of the target
		// at init, the source prop is the master
		bindCase: function(sourceProp, target, map) {
			var source = this;

			var changing = false;
			var sourceCanceler = this.getR(sourceProp).onValue(function (sourceValue) {
				if (!changing) {
					changing = true;
					Object.keys(map).forEach(function(key) {
						var value = map[key];
						target.set(key, value === sourceValue);
					});
					changing = false;
				}
			}.bind(this));

			var targetCancelers = [];
			Object.keys(map).forEach(function(key) {
				var value = map[key];
				var canceler = target.getR(key).filter(identity).onValue(function() {
					source.set(sourceProp, value);
				});
				targetCancelers.push(canceler);
			});

		},
		// create a bidirectionnal binding with the following logic: targetProp value is true if all the items are true
		// if targetProp is set to true, all the items are set to true
		// if targetProp is set to false, all the items are set to false
		// at init time, the target prop value is the slave
		bindAll: function(targetProp, collection, itemProp){
			var changing = false;
			var target = this;
			// init time
			this.set('targetProp', collection.every(function(item){
				return item.get(itemProp);
			}));

			var targetHandler = this.getR(targetProp).changes().onValue(function(b){
				if (! changing){
					changing = true;
					collection.forEach(function(item) {
						item.set(itemProp, b);
					});
					changing = false;
				}
			});

			var sourceHandler = collection.asReactive().onEach().onValue(function(){
				if (! changing){
					var b = collection.every(function(item){
						return item.get(itemProp);
					});
					if (target.get(targetProp) !== b) {
						changing = true;
						target.set(targetProp, b);
						changing = false;
					}
				}
			});

			// return a canceler
			return this.own(function(){
				destroy(targetHandler);
				destroy(sourceHandler);
			});
		},
	};
	return Bindable;
});