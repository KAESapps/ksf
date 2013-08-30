define([
	'compose',
	'./List',
	'collections/map',
	'ksf/utils/destroy',

], function(
	compose,
	List,
	Map,
	destroy

){
	var OrderableSet = compose(
		List,
		{
			// don't allow adding the same value twice
			add: function(value, index){
				if (this.has(value)){
					throw "A value cannot be added twice";
				} else {
					List.prototype.add.apply(this, arguments);
				}
			},
			// same as "updateContentR" but map values of changes events with "mapFunction"
			// destroy created mapped values when the corresponding value is removed
			// dont't create a new mappedValue if the same value is removed and added in the same changes event (and don't destroy it)
			updateContentMapR: function(changesStream, mapFunction){
				var target = this;
				var mapChanges = function(changes){
					var mappedValues = new Map();
					var offset = 0;
					var mappedChanges = changes.map(function(change){
						var mappedValue;
						if (change.type === "remove"){
							// store the mappedValue for eventual reuse
							mappedValue = target.get(change.index + offset);
							mappedValues.set(change.value, mappedValue);
							// count the number of remove
							offset++;
						} else if (change.type === "add") {
							// restore the mapped value or create a new one
							if (mappedValues.has(change.value)){
								mappedValue = mappedValues.get(change.value);
								mappedValues.delete(change.value);
							} else {
								mappedValue = mapFunction(change.value);
							}
							offset--;
						}
						return {
							type: change.type,
							index: change.index,
							value: mappedValue,
						};
					});
					// destroy all mappedValues that are no more in target
					mappedValues.forEach(destroy);

					return mappedChanges;
				};

				return this.updateContentR(changesStream.map(mapChanges));
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

	return OrderableSet;
});