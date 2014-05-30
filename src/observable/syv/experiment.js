define([

], function(

){
	var JsonStateful = compose(function(initValue) {
		this._value = initValue;
	}, {
		value: function() {
			return this._value;
		},
		patch: function(patch) {
			this._value = jiff.patch(patch, this._value);
		}
	});


	var _OriginalSource = compose(Evented, {
		value: function() {
			return this._stateful.value();
		},
		patch: function(patch) {
			this._stateful.patch(patch);
			var value = this.value();
			this._emit('change');
			this._emit('patch', patch);
			this._emit('value', value);
			this._emit('valuePatch', value, patch);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
	});
	var OriginalSource = compose(_OriginalSource, function(stateful) {
		this._stateful = stateful;
	});

	var _DerivedSource = compose({
		value: function() {
			return this._viewer.computeValue(this._source.value());
		},
		onChange: function(cb) {
			return this._source.onChange(cb);
		},
		onPatch: function(cb) {
			return this._source.onPatch(function(patch) {
				var derivedPatch = this._viewer.computePatch(patch);
				derivedPatch && cb(derivedPatch);
			});
		},
		onValue: function(cb) {
			return this._source.onValue(function(value) {
				var derivedValue = this._viewer.computeValue(value);
				derivedValue && cb(derivedValue);
			});
		},
	});
	var DerivedSource = compose(_DerivedSource, function(source, viewer) {
		this._source = source;
		this._viewer = viewer;
	});

	var _MutableDerivedSource = compose(_DerivedSource, {
		patch: function(patch) {
			this._source.patch(this._mutator.computePatch(patch, this.value());
		},
	});
	var MutableDerivedSource = compose(_MutableDerivedSource, function(source, viewer, mutator) {
		this._source = source;
		this._viewer = viewer;
		this._mutator = mutator;
	});

	var EventedDerivedSource = compose(Evented, function(source, viewer) {
		this._source = source;
		this._viewer = viewer;
		this._cancelSourceObserving;
		this._changeObserversCount = 0;
	}, {
		value: function() {
			if (this._cancelSourceObserving) {
				return this._cachedValue;
			}
			return this._viewer.computeValue(this._source.value());
		},
		onChange: function(cb) {
			var self = this;
			this._changeObserversCount++;
			if (! this._cancelSourceObserving) {
				var viewer = this._viewer;
				this._cancelSourceObserving = this._source.onChange(function(patch, value) {
					var derivedPatch = viewer.computePatch(patch);
					var derivedValue = self._cachedValue = viewer.computeValue(value);
					self._emit('patchValue', derivedPatch, derivedValue);
				});
			}
			var cancel = this._on('patchValue', cb);
			return function() {
				cancel();
				self._changeObserversCount--;
				if (self._changeObserversCount === 0) {
					self._cancelSourceObserving();
				}
			};
		},
	});

	var Store = compose(_OriginalSource, function(initValue) {
		this._stateful = new JsonStateful({});
		this.patch([{op:"replace", path: "", value: initValue}]);
	}, {
		_mutator: {
			computePatch: function(requestedPatch, currentValue) {
				// ne pas autoriser une valeur racine autre qu'un objet
				// ne pas ajouter une clé qui existe déjà
				// ne pas enlever une clé qui n'existe pas
				// générer une clé valide s'il y a un add à 'undefined'
			},
		},
		_viewer: {
			computePatch: identity,
			computeValue: identity,
		},
	},
	// méthodes de mutation spécialisées
	{
		add: function(value, key) {
			var key = arguments.length === 2 ? key : Math.random();
			this.patch([{op: 'add', path: '/' + key, value: value}]);
		},
	},
	// méthodes de création de sources dérivées
	{
		item: function(id) {
			return new Prop(this, id);
		},
		filter: function(filterFn) {
			return new FilteredStore(this, filterFn);
		},
	});
	var Prop = compose(_MutableDerivedSource, function(source, prop) {
		this._viewer = new PropViewer(prop);
		this._mutator = new PropMutator(prop);
	});

	// store qui n'accepte que des objets, cela permet de faire des filtre basés sur des noms de propriétés, de même pour les tris et de renvoyer des new Documents sur item, c'est à dire des sources dérivées avec des méthodes 'prop'
	var DocumentStore = compose(Store, {
		_mutator: {
			computePatch: function(requestedPatch) {
				// utilise le mutateur de store simple et ajoute les contrôles suivants:
				// - vérifie que les items sont bien des objets
			},
		},
		item: function(id) {
			return new Document(this, id);
		},
	});

	var Document = compose(Prop, {
		prop: function(prop) {
			return new Prop(this, prop);
		},
	});

	var PersonStore = compose(DocumentStore, {
		_mutator: {
			computePatch: function(requestedPatch) {
				// utilise le mutateur de document store et
				// - vérifie que les objets ont bien les propriétés nom, age et genre
			}
		},
		item: function(id) {
			return new Person(this, id);
		},
	});
	var Person = compose(Prop, {
		name: function() {
			return new Prop(this, 'name');
		},
		address: function() {
			return new Address(this);
		}
	});
	var Address = compose(Prop, {
		city: function() {
			return new Prop(this, 'city');
		}
	});


	var FilteredStore = compose(_DerivedSource, function(source, filterFn) {
		this._source = source;
		this._viewer = new FilterViewer(filterFn);
	}, {
		filter: function() {},
		sort
	});

	// test case
	var store = new Store(new JsonStateful({
		1: {name: "Sylvain", age: 32, genre: 'M'},
		2: {name: "Aurélie", age: 31, genre: 'F'},
	}));

	var maleByAge = personStore.filter(function(personValue) {
		return personValue.genre === 'M';
	}).sort(function(a, b) {
		return a.age - b.age;
	});

});