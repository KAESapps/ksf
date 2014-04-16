define([
	'compose',
	'../../observable/_Stateful',
	'../../observable/model/IncrementalPropertyObject',
	'../../observable/model/AtomicPropertyObject',
	'../../observable/model/PropertyObjectOrUndefined',
	'../../observable/model/Value',
	// '../../observable/model/AtomicArray',
	'lodash/objects/cloneDeep',
], function(
	compose,
	_Stateful,
	IncrementalPropertyObject,
	AtomicPropertyObject,
	PropertyObjectOrUndefined,
	Value,
	// AtomicArray,
	cloneDeep
){

	var model = new IncrementalPropertyObject({
		dataTime: new Value(),
		lastRequestStatus: new PropertyObjectOrUndefined({
			started: new Value(),
			finished: new Value(),
			stage: new Value(),
		}),
		data: new Value(),
	});

	var Query = compose(function(manager, source, idProperty) {
		this._source = source;
		this._manager = manager;
		this._idProperty = idProperty || "id";
		this._value = {
			dataTime: undefined,
			data: [],
			lastRequestStatus: undefined,
		};
	},
	_Stateful,
	model.accessorMixin,
	{
		_computer: model.computer,
		pull: function() {
			var idProperty = this._idProperty;
			this._change({
				lastRequestStatus: {
					started: new Date(),
					finished: undefined,
					stage: 'inProgress',
				}
			});
			return this._source.get().then(function(resp) {
				console.time('traitement de la réponse serveur');
				// mise à jour de la valeur des ressources récupérées
				this._updateResources(resp);

				// mise à jour de la valeur de la collection elle-même
				var ids = resp.map(function(item) {
					return item[idProperty];
				});
				this._change({
					dataTime: new Date(),
					data: ids,
					lastRequestStatus: {
						finished: new Date(),
						stage: 'success',
					},
				});
				console.timeEnd('traitement de la réponse serveur');
			}.bind(this),
			// error
			function(resp) {
				this._change({
					lastRequestStatus: {
						finished: new Date(),
						stage: 'error',
					},
				}.bind(this));
			});
		},
		_updateResources: function(resp) {
			var idProperty = this._idProperty;
			resp.forEach(function(itemData) {
				var rscId = itemData[idProperty];
				this._manager.item(rscId)._change({
					dataTime: new Date(),
					data: itemData,
					// on ne met pas à jour 'lastRequestStatus' car ce n'est pas une requête directement sur la ressource
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
		onItems: function(cb) {
			// TODO
		},
	});

	return Query;
});