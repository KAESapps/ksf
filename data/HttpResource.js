define([
	'when',
	'../utils/compose',
	'../base/_Evented',
	'../observable/Map',
], function(
	when,
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
		// extended observable API
		// appelle cb à chaque changement de la valeur mais seulement à partir du moment où elle est inialisée à partir du serveur
		subscribe: function(cb) {
			if (this._fullValue.valueOfKey('valueTime') !== null) {
				// TODO: faudrait-il le faire en asynchrone ?
				cb(this.value());
			}
			return this.onChange(function(value) {
				cb(value);
			});
		},
		subscribeOnce: function(cb) {
			if (this._fullValue.valueOfKey('valueTime') !== null) {
				// TODO: faudrait-il le faire en asynchrone ?
				cb(this.value());
			} else {
				var canceler = this.onChange(function(value) {
					canceler();
					cb(value);
				});
			}
		},
		//helpers
		valuePromise: function() {
			// retourne un promise pour la valeur actuelle ou en cours de chargement
			// déclenche un get si le cache n'a pas été initialisée
			var self = this;
			// si la valeur est connue en cache
			if (this._fullValue.valueOfKey('valueTime') !== null) {
				return when(this.value());
			}
			// sinon retourne un promise pour la valeur à venir
			return when.promise(function(resolve) {
				self.subscribeOnce(resolve);
			});
		},
		initValue: function() {
			// on déclenche un GET uniqueent si si la valeur n'est pas encore connue et s'il n'y a déjà une requête en cours
			return this._lastValueRequest || this.get();
		},
		// http methods ========================
		get: function() {
			var fullValue = this._fullValue;
			// TODO: faudrait-il gérer ici le fait qu'il puisse y avoir un appel à GET alors qu'un autre GET est déjà en cours ?
			// et plus globalement qu'il y a déjà une requête en cours qui aura pour effet de mettre à jour  'fullValue' pour éviter d'en faire une autre (ou au contraire abandonner celle en cours)
			var request = this._client({
				method: 'GET',
			});
			this._lastValueRequest = request.then(function(resp) {
				fullValue.change({
					valueTime: Date.now(),
					value: resp.entity,
					exists: true,
				});
				return request; // on retourne le promise initial
			}, function(resp) {
				if (resp.status.code === 404) {
					fullValue.change({
						valueTime: Date.now(),
						value: null,
						exists: false,
					});
				}
				// TODO: comment rejeter le promise comme si on n'avait rien fait ?
				return request;
			});
			return this._lastValueRequest;
		},
		put: function(value) {
			var self = this;
			var fullValue = this._fullValue;
			var request = this._client({
				method: 'PUT',
				entity: value,
			});
			this._lastValueRequest = request.then(function(resp) {
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
			return this._lastValueRequest;
		},
		'delete': function() {
			var self = this;
			var fullValue = this._fullValue;
			var request = this._client({
				method: 'DELETE',
			});
			this._lastValueRequest = request.then(function() {
				fullValue.change({
					valueTime: Date.now(),
					exists: false,
					value: null,
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
			return this._lastValueRequest;
		},
		post: function(value) {},
		options: function(noCache) {}, // on pourrait mettre à jour le 'exists'
		patch: function(patch) {
			var self = this;
			var fullValue = this._fullValue;
			var request = this._client({
				method: 'PATCH',
				entity: patch,
			});
			this._lastValueRequest = request.then(function(resp) {
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
			return this._lastValueRequest;
		},
		// observation
		onSuccessfulChangeRequest: function(cb) {
			// cet événement indique que la ressource a été effectivement modifiée sur le serveur
			// c'est une approximation d'un événement que l'on aurait reçu du serveur si on pouvait l'observer
			return this._on('successfulChangeRequest', cb);
		},
	});
});