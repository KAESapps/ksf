define([

], function(

){
	var _Stylable = {
		style: function(style) {
			this._style && this._style.unapply(this.domNode);
			style && style.apply(this.domNode);
			this._style = style;
			return this;
		}
	};

	return _Stylable;
});