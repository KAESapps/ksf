define([
	'compose',
	'../../observable/sync/_PatchableStateful',
	'../../observable/sync/propertyObject/_WithPropertyAccessors',
	'../../observable/sync/propertyObject/PropertyAccessor',
	'../../observable/sync/propertyObject/CompositePropertyAccessor',
	'../../observable/computers/deepMapPatcher',
	'dojo/request',
	'lodash/objects/cloneDeep',
], function(
	compose,
	_PatchableStateful,
	_WithPropertyAccessors,
	PropertyAccessor,
	CompositePropertyAccessor,
	deepMapPatcher,
	request,
	cloneDeep
){
	var diffRestRessource = function() {};
	var getPatchArg = function() {};

	var RestQuery = compose(_PatchableStateful.custom({
		patch: '_patch',
	}), _WithPropertyAccessors, function(args) {
		this._url = args.url;
		this._manager = args.manager;
		this._value = {
			dataTime: undefined,
			data: undefined,
			lastRequestStatus: undefined,
		};
	}, {
		// value is read only for public users
		value: function() {
			return this._getValue();
		},
		_computer: deepMapPatcher,
		_accessorFactories: {
			dataTime: PropertyAccessor,
			data: compose(CompositePropertyAccessor, _WithPropertyAccessors, {
				_createPropertyAccessor: function(id) {
					return new PropertyAccessor(this, id);
				},
			}),
			lastRequestStatus: compose(CompositePropertyAccessor, _WithPropertyAccessors, {
				_accessorFactories: {
					started: PropertyAccessor,
					finished: PropertyAccessor,
					stage: PropertyAccessor,
				},
			})
		},
		pull: function() {
			this._patch({
				set: {
					lastRequestStatus: {
						started: new Date(),
						finished: undefined,
						stage: 'inProgress',
					}
				}
			});
			return request.get(this._url).then(function(resp) {
				// mise à jour de la valeur des ressources récupérées
				this._updateResources(resp);

				// mise à jour de la valeur de la collection elle-même
				var ids = resp.map(function(item) {
					return item.id;
				});
				// TODO
				// var diff = diffRestQuery(this.value().data, resp.data);
				// var dataPatchArg = getPatchArg(diff);
				this._patch({
					set: {
						dataTime: new Date(),
						data: ids,
					},
					patch: {
						// data: diff, TODO
						lastRequestStatus: {
							set: {
								finished: new Date(),
								stage: 'success',
							},
						},
					},
				});
			}.bind(this), function(resp) {
				this._patch({
					patch: {
						lastRequestStatus: {
							set: {
								finished: new Date(),
								stage: 'error',
							},
						},
					},
				});
			});
		},
		_updateResources: function(resp) {
			resp.forEach(function(itemData) {
				var rscId = itemData.id;
				var rscData = cloneDeep(itemData);
				delete rscData.id;
				this._manager.item(rscId)._patch({
					set: {
						dataTime: new Date(),
						data: rscData,
					}
				});
			}, this);
		},
		// retourne un item accessor pour la clé présente à l'index demandé
		item: function(index) {
			return this._manager.item(this._value.data[index]);
		},
		// retourne une liste ordonnée d'accesseurs d'item
		items: function() {
			return this._value.data.map(this._manager.item, this._manager);
		},
		onItemChanges: function(cb) {
			// TODO
		},
	});

	return RestQuery;
});