define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/dom/WithInnerSize',
	'ksf/collections/OrderableSet',
	'ksf/utils/CoupleElementOptions',
	'../HtmlContainer'
], function(
	compose,
	CompositeMono,
	WithInnerSize,
	OrderableSet,
	CoupleElementOptions,
	HtmlContainer
) {
	return compose(
		CompositeMono,
		WithInnerSize, function(props, args) {
			this._component = new HtmlContainer(args && args.tag);

			this.content = new OrderableSet();
			this._component.content.updateContentMapR(this.content.asStream('changes'), function(contentItem) {
				return CoupleElementOptions.fromLiteral(contentItem).element;
			}, { destroy: false });

			props && this.setEach(props);
		}, {
			_contentSetter: function(content) {
				this.content.setContent(content || []);
			},
			_contentGetter: function() {
				return this.content;
			},
		}
	);
});