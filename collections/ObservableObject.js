define([
	"compose/compose",
	"./WithGetSet",
	"ksf/base/Evented",
	"./Observable",
	"./Bindable",
	"../base/Destroyable",
	'./GenericMap',
], function(
	compose,
	WithGetSet,
	Evented,
	Observable,
	Bindable,
	Destroyable,
	GenericMap
){
	"use strict";

	function mangle(key) {
		return "~" + key;
	}
	function unmangle(mangled) {
		return mangled.slice(1);
	}


	var ObservableObject = compose(
		Evented,
		Observable,
		Bindable,
		Destroyable,
		GenericMap,
		WithGetSet,
		function() {
			this._store = {};
		},
		{
			_Getter: function(prop){
				return this._store[mangle(prop)];
			},
			_Setter: function(prop, value){
				this._store[mangle(prop)] = value;
			},
			_Detector: function(prop){
				return this._store.hasOwnProperty(mangle(prop));
			},
			_Remover: function(prop){
				delete this._store[mangle(prop)];
			},
			forEach: function(cb) {
				var scope = arguments.length > 1 ? arguments[1] : null;
				return Object.keys(this._store).forEach(function(k) {
					cb.call(scope, this._store[k], unmangle(k), this);
				}.bind(this));
			},
		}
	);

	return ObservableObject;
});