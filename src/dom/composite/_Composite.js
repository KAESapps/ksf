define([
	'compose',
	'../../base/_Destroyable',
	'../../base/_Evented',
	'../_WithSize'
], function(
	compose,
	_Destroyable,
	_Evented,
	_WithSize
){
	return compose(_Destroyable, _Evented, _WithSize, function() {
		this._root = this._own(this._rootFactory());
		this.domNode = this._root.domNode;
	}, {
		inDom: function(inDom) {
			this._root.inDom && this._root.inDom(inDom);
		},
		bounds: function(bounds) {
			this._root.bounds && this._root.bounds(bounds);
		},
		_addCmp: function(name, cmp, options) {
			if (typeof name !== 'string') {
				options = cmp;
				cmp = name;
			} else {
				var cmps = this._cmps || (this._cmps = {});
				cmps[name] = cmp;
			}
			this._own(cmp);
			if (options) {
				for (var key in options) {
					cmp[key](options[key]);
				}
			}
			return cmp;
		},
	});
});