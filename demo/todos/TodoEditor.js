define([
	'compose',
	'ksf/components/HtmlElement',
	'ksf/dom/proxyEvent'
], function(
	compose,
	HtmlElement,
	proxyEvent
) {
	return compose(
		HtmlElement.prototype,
		function(todo) {
			HtmlElement.call(this, 'input', { type: 'text' });
			proxyEvent.changed.call(this);

			this.own(this.bind('value', todo, 'text'));
		}
	);
});