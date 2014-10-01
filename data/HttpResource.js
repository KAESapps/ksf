define([
	'../utils/compose',
	'../observable/Map',
], function(
	compose,
	Map
) {
	return compose(function(httpClient) {
		this._client = httpClient;
		this._fullValue = new Map();
		// ici on stocke la dernière requête qui a permi de mettre à jour 'fullValue'
		// cela permet, lorsque fullValue n'a pas encore été initialisée de mutualiser les appels a GET qui seraient fait juste pour l'initialiser
		this._lastFullValueRequest = null;
	}, {
		// observable value =====================
		value: function() {
			return this._fullValue.valueOfKey('value');
		},
		onChange: function(cb) {
			return this._fullValue.onChange(function(change) {
				if ('value' in change) {
					cb(change.value);
				}
			});
		},
		// observable fullValue =================
		fullValue: function() {
			var fullValue = this._fullValue;
			return {
				value: fullValue.valueOfKey('value'),
				valueTime: fullValue.valueOfKey('valueTime'),
				exists: fullValue.valueOfKey('exists'),
			};
		},
		onFullValue: function(cb) {
			var self = this;
			return this._fullValue.onChange(function() {
				cb(self.fullValue());
			});
		},
		// http methods ========================
		get: function(noCache) {
			var lastRequest = this._lastFullValueRequest;
			// si on force un rafraichissement ou que fullValue n'a jamais été initialisée (ou n'est pas en cours d'initilisation), on fait une requête
			if (noCache ||
				!lastRequest
			) {
				var self = this;
				this._lastFullValueRequest = this._client({
					method: 'GET',
				}).then(function(resp) {
					self._fullValue.change({
						valueTime: Date.now(),
						value: resp.entity,
						exists: true,
					});
					return resp;
				}, function(resp) {
					if (resp.statut.code === 404) {
						self._fullValue.change({
							valueTime: Date.now(),
							value: null,
							exists: false,
						});
					}
					// TODO: comment rejeter le promise comme si on n'avait rien fait ?
					return new Error(resp);
				});
				return this._lastFullValueRequest;
			} else {
				return lastRequest;
			}
		},
		put: function(value) {
			var self = this;
			var request = this._client({
				method: 'PUT',
				entity: value,
			}).then(function(resp) {
				self._fullValue.change({
					valueTime: Date.now(),
					exists: true,
					value: resp.entity,
				});
			}, function(resp) {
				if (resp.statut.code === 404) {
					self._fullValue.change({
						valueTime: Date.now(),
						value: null,
						exists: false,
					});
				}
				// TODO: comment rejeter le promise comme si on n'avait rien fait ?
				return new Error(resp);
			});
			this._lastRequest.value(request);
			return request;
		},
		post: function(value) {},
		delete: function() {},
		options: function(noCache) {}, // on pourrait mettre à jour le 'exists'
		patch: function(patch) {},
	});
});