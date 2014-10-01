define([
	'compose',
	'./Query',
	'../../observable/model/IncrementalPropertyObject',
	'../../observable/model/PropertyObjectOrUndefined',
	'../../observable/model/Value',
	// '../../observable/model/AtomicArray',
], function(
	compose,
	Query,
	IncrementalPropertyObject,
	PropertyObjectOrUndefined,
	Value
	// AtomicArray,
){

	var model = new IncrementalPropertyObject({
		dataTime: new Value(),
		lastRequestStatus: new PropertyObjectOrUndefined({
			started: new Value(),
			finished: new Value(),
			stage: new Value(),
		}),
		data: new Value(),
		count: new Value(),
	});

	var QueryWithCount = compose(Query, model.accessorMixin,
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
				// mise à jour de la valeur des ressources récupérées
				this._updateResources(resp.items);

				// mise à jour de la valeur de la collection elle-même
				var ids = resp.items.map(function(item) {
					return item[idProperty];
				});
				this._change({
					dataTime: new Date(),
					data: ids,
					count: resp.count,
					lastRequestStatus: {
						finished: new Date(),
						stage: 'success',
					},
				});
				return resp;
			}.bind(this),
			// error
			function(resp) {
				this._change({
					lastRequestStatus: {
						finished: new Date(),
						stage: 'error',
					},
				});
				return resp;
			}.bind(this));
		},
	});

	return QueryWithCount;
});