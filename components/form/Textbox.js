define([
	"compose",
	"ksf/dom/composite/CompositeMono",
	"ksf/dom/composite/WithFocusedForMono",
	"./HtmlElementWithChanged",
	"ksf/dom/proxyEvent",
], function(
	compose,
	CompositeMono,
	WithFocusedForMono,
	HtmlElementWithChanged,
	proxyEvent
){
	return compose(
		CompositeMono,
		WithFocusedForMono,
		function () {
			this._component = new HtmlElementWithChanged('input', {type: 'text'});
			this._component.bind('value', this, 'value');
			this._component.on('keyup', function (e) {
				this._emit('keyup', e);
			}.bind(this));
		}, {
			revert: function() {
				// hack
				this.get('domNode').value = this.get('value');
			},
		}
	);
});