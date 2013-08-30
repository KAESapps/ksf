define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/components/HtmlElement',
	'ksf/dom/proxyEvent',
	'../Todo'
], function(
	compose,
	CompositeMono,
	HtmlElement,
	proxyEvent,
	Todo
) {
	return compose(
		CompositeMono,
		function() {
			this._component = new compose(HtmlElement, proxyEvent.changed)('input', { type: 'text', placeholder: "Add new todo" });

			var changing;
			// we need to filter empty text to prevent emitting twice
			this._component.getR('value').filter(function(text) {return text !== "";}).onValue(function(text) {
					this._emit('newTodo', new Todo({ text: text }));
					// reset input
					this._component.set('value', "");
			}.bind(this));
		}
	);
});