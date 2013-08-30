define([
	'compose',
	'ksf/base/Evented',
	'./Observable',
	'./Bindable',
	'ksf/base/Destroyable',
	'ksf/utils/destroy',
	'./GenericList',

], function(
	compose,
	Evented,
	Observable,
	Bindable,
	Destroyable,
	destroy,
	GenericList

){
	var List = compose(
		Evented,
		Observable,
		Bindable,
		Destroyable,
		GenericList,

		function(values){
			this._store = [];
			this.length = 0;
			values && values.forEach && this.addEach(values);
		},
		{
			add: function(value, index){
				this._startChanges();
				if (isNaN(Number(index))) { index = this._store.length;} // append by default
				this._store.splice(index, 0, value);
				this._pushChanges([{type: "add", value: value, index: index}]);
				this._stopChanges();
			},
			remove: function(index){
				this._startChanges();
				var value = this._store.splice(index, 1)[0];
				this._pushChanges([{type: "remove", value: value, index: index || 0}]);
				this._stopChanges();
			},
			get: function(index){
				return this._store[index];
			},
			indexOf: function(value){
				return this._store.indexOf(value);
			},
			forEach: function(){
				return this._store.forEach.apply(this._store, arguments);
			},
			map: function(){
				var mappedList = new this.constructor();
				mappedList.addEach(this._store.map.apply(this._store, arguments));
				return mappedList;
			},
			filter: function(){
				var filteredList = new this.constructor();
				filteredList.addEach(this._store.filter.apply(this._store, arguments));
				return filteredList;
			},
			reduce: function(){
				return this._store.reduce.apply(this._store, arguments);
			},
			sorted: function(compare){
				var sortedList = new this.constructor();
				sortedList.addEach(this._store.slice().sort(compare));
				return sortedList;
			},
			toArray: function(){
				return this._store.slice();
			},
			// same as updateContentMapR but also start observing items to call mapFunction whenever they change
			updateContentReactiveMapR: function(changesStream, mapFunction){
				var target = this;
				var cancelers = new this.constructor();
				var updateTargetOnItemChanged = function(item){
					var canceler = item && item.asReactive && item.asReactive().map(mapFunction).onValue(function(result){
						var index = cancelers.indexOf(canceler);
						target.updateContent([{
							type: 'remove',
							index: index,
						}, {
							type: 'add',
							index: index,
							value: result,
						}]);
					});
					return canceler;
				};

				var changesStreamCanceler = cancelers.updateContentMapR(changesStream, function(item){
					return updateTargetOnItemChanged(item);
				});

				return function(){
					changesStreamCanceler();
					cancelers.forEach(destroy);
				};
			},
			// same as setContentIncremental but get a reactiveValue from mapStream(item)
			// this is to get the same reasult as "setContentR(source.onEach().map(source.map(mapCb)))"
			setContentIncrementalMapReactive: function(source, mapStream){
				var cancelers = new Map();
				var target = this;

				function processChanges (changes) {
					changes.forEach(function(change) {
						if (change.type === 'add') {
							var reactiveItem = mapStream(change.value);
							// insert in target list
							reactiveItem.take(1).onValue(function(value) {
								target.set(change.index, value);
							});
							// observe changes on source item
							cancelers.add(reactiveItem.changes().onValue(function(value) {
								target.updateContent([{
									type: 'remove',
									index: source.indexOf(change.value)
								}, {
									type: 'add',
									index: source.indexOf(change.value),
									value: value
								}]);
							}), change.value);
						} else if (change.type === "remove") {
							// cancel observation of source item
							cancelers.get(change.value)();
							cancelers.remove(change.value);
							target.remove(change.index);
						}
					});
				}
			-
				// clear current items
				processChanges(this.map(function(item, index) {
					return {
						type: 'remove',
						index: index,
						value: item
					};
				}));
				// initialize
				processChanges(source.map(function(item, index) {
					return {
						type: 'add',
						index: index,
						value: item
					};
				}));
			-
				source.asStream("changes").onValue(processChanges);
			},
			setContentIncrementalFilter: function(source, filterCb){
					var pass, i;
					var target = this;
					var reactToItemChange = function(item, index){
							var canceler = item && item.asReactive && item.asStream("changed").onValue(function(){
									var sourceIndex = observers.indexOf(canceler);
									var passed = filterResult.get(sourceIndex);
									var pass = filterCb(item);
									if (pass !== passed){
											filterResult.set(sourceIndex, pass);
											if (pass){
													target.add(item, sourceToTargetIndex(sourceIndex));
											} else {
													target.remove(sourceToTargetIndex(sourceIndex));
											}
									}
							});
							return canceler;
					};

					var filterResult = new List();
					filterResult.addEach(source.map(filterCb));
					var sourceToTargetIndex = function(sourceIndex){
							var targetIndex = 0;
							for (i = 0; i < sourceIndex; i++){
									if (filterResult.get(i)){targetIndex++;}
							}
							return targetIndex;
					};

					this.setContent(source.filter(filterCb));
					// start observing each item from source
					var observers = new List();
					observers.addEach(source.map(reactToItemChange));

					return source.asStream("changes").onValue(function(changes){
							target._startChanges();
							changes.forEach(function(change){
									if (change.type === "add"){
											pass = filterCb(change.value);
											filterResult.add(pass, change.index);
											if (pass){
													target.add(change.value, sourceToTargetIndex(change.index));
											}
											// start observing item
											observers.add(reactToItemChange(change.value, change.index), change.index);
									} else if (change.type === "remove"){
											pass = filterResult.get(change.index);
											if (pass){
													target.remove(sourceToTargetIndex(change.index));
											}
											filterResult.remove(change.index);
											// stop observing item
											var canceler = observers.get(change.index);
											if (typeof canceler === "function") {canceler();}
											observers.remove(change.index);

									}
							});
							target._stopChanges();
					});
			},
		}
	);
	return List;
});