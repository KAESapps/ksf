define([
	'compose',
	'../../base/_Destroyable',
	'../../base/_Evented',
], function(
	compose,
	_Destroyable,
	_Evented
){
	return compose(_Destroyable, _Evented, function() {
		if (this._rootFactory) {
			this._root = this._own(this._rootFactory.apply(this, arguments));
			this.domNode = this._root.domNode;
		}
	}, {
		_setRoot: function(root) {
			this._root = root;
			this.domNode = root.domNode;
			return root;
		},
		inDom: function(inDom) {
			return this._root.inDom && this._root.inDom(inDom);
		},
		bounds: function(bounds) {
			this._root.bounds && this._root.bounds(bounds);
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