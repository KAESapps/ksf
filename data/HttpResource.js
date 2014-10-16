define([
	'../utils/compose',
	'../base/_Evented',
	'../observable/Map',
], function(
	compose,
	_Evented,
	Map
) {
	return compose(_Evented, function(httpClient, initValue) {
		this._client = httpClient;
		this._fullValue = new Map(initValue);
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
		get: function() {
			var fullValue = this._fullValue;
			// TODO: faudrait-il gérer ici le fait qu'il puisse y avoir un appel à GET alors qu'un autre GET est déjà en cours ?
			// et plus globalement qu'il y a déjà une requête en cours qui aura pour effet de mettre à jour  'fullValue' pour éviter d'en faire une autre (ou au contraire abandonner celle en cours)
			var request = this._client({
				method: 'GET',
			});
			return request.then(function(resp) {
				fullValue.change({
					valueTime: Date.now(),
					value: resp.entity,
					exists: true,
				});
				return request; // on retourne le promise initial
			}, function(resp) {
				if (resp.statut.code === 404) {
					fullValue.change({
						valueTime: Date.now(),
						value: null,
						exists: false,
					});
				}
				// TODO: comment rejeter le promise comme si on n'avait rien fait ?
				return request;
			});
		},
		put: function(value) {
			var self = this;
			var fullValue = this._fullValue;
			var request = this._client({
				method: 'PUT',
				entity: value,
			});
			return request.then(function(resp) {
				fullValue.change({
					valueTime: Date.now(),
					exists: true,
					value: resp.entity,
				});
				self._emit('successfulChangeRequest');
				return request;
			}, function(resp) {
				if (resp.statut.code === 404) {
					fullValue.change({
						valueTime: Date.now(),
						value: null,
						exists: false,
					});
				}
				return request;
			});
		},
		post: function(value) {},
		delete: function() {},
		options: function(noCache) {}, // on pourrait mettre à jour le 'exists'
		patch: function(patch) {},
		// observation
		onSuccessfulChangeRequest: function(cb) {
			// cet événement indique que la ressource a été effectivement modifiée sur le serveur
			// c'est une approximation d'un événement que l'on aurait reçu du serveur si on pouvait l'observer
			return this._on('successfulChangeRequest', cb);
		},
	});
});