define([
	'compose',
	'./Resource',
	'./Query',
], function(
	compose,
	RestResource,
	RestQuery
){
	var Manager = compose(function(baseUrl, rscModel) {
		this._baseUrl = baseUrl;
		// this._rscModel = rscModel; // TODO: ça pourrait être un objet qui présente un computer et une liste de propertyAccessorFactories par nom de propriété
		this._resources = {};
		this._queries = {};
	}, {
		item: function(id) {
			var rsc = this._resources[id];
			if (! rsc) {
				rsc = new RestResource({
					url: this._baseUrl + id,
					// model: this._rscModel,
				});
				this._resources[id] = rsc;
			}
			return rsc;
		},
		query: function(params) {
			var query = this._queries[params];
			if (! query) {
				query = new RestQuery({
					url: this._baseUrl + "?" + params,
					manager: this,
				});
				this._queries[params] = query;
			}
			return query;
		},
	});
	return Manager;
});