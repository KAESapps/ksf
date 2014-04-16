define([
	'compose',
	'./ResourceFactory',
	'./Query',
], function(
	compose,
	ResourceFactory,
	Query
){
	var Manager = compose(function(args) {
		this._source = args.source;
		this._Resource = new ResourceFactory(args.properties).ctr;
		this._idProperty = args.idProperty || "id";
		this._resources = {};
		this._queries = {};
	}, {
		item: function(id) {
			var rsc = this._resources[id];
			if (! rsc) {
				rsc = new this._Resource(this._source.item(id));
				this._resources[id] = rsc;
			}
			return rsc;
		},
		query: function(params) {
			var query = this._queries[params]; // TODO: faire une recherche par valeur et pas par référence de 'params'
			if (! query) {
				query = new Query(this, this._source.query(params), this._idProperty);
				this._queries[params] = query;
			}
			return query;
		},
	});
	return Manager;
});