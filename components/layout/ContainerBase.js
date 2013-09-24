define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithHTMLElement',
	'ksf/dom/WithCssClassStyle'
], function(
	compose,
	ObservableObject,
	WithHTMLElement,
	WithCssClassStyle
){
	return compose(
		ObservableObject,
		WithHTMLElement,
		WithCssClassStyle,
		{
			_tag: 'div',
			updateRendering: function() {
				WithHTMLElement.prototype.updateRendering.apply(this);
				this._applyStyle();
			}
		}
	);
});