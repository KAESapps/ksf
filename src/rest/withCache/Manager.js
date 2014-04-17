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
			var paramsHash = this._hashParams(params);
			var query = this._queries[paramsHash];
			if (! query) {
				query = new Query(this, this._source.query(params), this._idProperty);
				this._queries[paramsHash] = query;
			}
			return query;
		},
		_hashParams: function(params) {
			// TODO: trouver un algo de hash qui trie les clés des objets pour s'assurer que les hash soit toujours le même pour des objets avec la même valeur
			return JSON.stringify(params);
		},
	});
	return Manager;
});