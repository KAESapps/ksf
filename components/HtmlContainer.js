define([
	'compose',
	'ksf/dom/WithOrderedContent',
	'ksf/dom/Sizeable',
	'./HtmlElement'
], function(
	compose,
	WithOrderedContent,
	Sizeable,
	HtmlElement
){
	return compose(
		HtmlElement,
		WithOrderedContent,
		Sizeable,
		{
			_contentSetter: function(content) {
				WithOrderedContent.prototype._contentSetter.apply(this, arguments);
				this._applyContent(this.get('content'));
			},

			updateRendering: function() {
				HtmlElement.prototype.updateRendering.apply(this);
				this._applyBounds();
			}
		}
	);
});