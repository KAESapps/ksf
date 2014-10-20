define([
	'../../utils/compose',
	'../../base/_Destroyable',
	'../../base/_Evented',
	'../../base/_Chainable',
], function(
	compose,
	_Destroyable,
	_Evented,
	_Chainable
){
	return compose(_Destroyable, _Evented, _Chainable, function() {
		if (this._rootFactory) {
			this._root = this._own(this._rootFactory.apply(this, arguments));
			this.domNode = this._root.domNode;
		}
	}, {
		_setRoot: function(root) {
			this._root = root;
			this._own(root);
			this.domNode = root.domNode;
			return root;
		},
		inDom: function(inDom) {
			return this._root.inDom && this._root.inDom(inDom);
		},
		bounds: function(bounds) {
			var rootBounds = this._root.bounds && this._root.bounds(bounds);
			if (bounds === undefined) {
				return rootBounds;
			} else {
				return this;
			}
		},
		size: function() {
			return this._root.size();
		},
		position: function(position) {
			var rootPos = this._root.position(position);
			if (position === undefined) {
				return rootPos;
			} else {
				return this;
			}
		}
	});
});