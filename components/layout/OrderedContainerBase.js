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
		WithInnerSize, function(args) {
			this._component = new HtmlContainer('div');

			this.content = new OrderableSet();
			this._component.content.updateContentMapR(this.content.asStream('changes'), function(contentItem) {
				return CoupleElementOptions.fromLiteral(contentItem).element;
			});

			args && this.setEach(args);
		}
	);
});