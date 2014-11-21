define([
	'../utils/compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	// observable pour un attribut d'un noeud d'un arbre
	return compose(_Evented, function(tree, nodeKey, attr) {
		var self = this;
		this._value = (tree.value()[nodeKey] && attr in tree.value()[nodeKey].value) ? tree.value()[nodeKey].value[attr] : null;
		this._observer = tree.onChange(function(change) {
			if (change.addChild && change.addChild.child === nodeKey) {
				self._value = change.addChild.value[attr];
				self._emit('change', self._value);
				return;
			}
			if (change.remove && change.remove.node === nodeKey) {
				self._value = null;
				self._emit('change', null);
				return;
			}
			if (change.attr && change.attr.node === nodeKey && change.attr.attr === attr) {
				self._value = change.attr.value;
				self._emit('change', self._value);
				return;
			}
		});

	}, {
		value: function() {
			return this._value;
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
		destroy: function() {
			this._observer();
		},
	});
});