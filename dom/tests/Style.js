/*jshint multistr: true */
define([
	'intern!object',	'intern/chai!assert',
	'compose',
	'../Style'
], function(
	registerSuite,		assert,
	compose,
	Style
) {
	registerSuite({
		name : "Styling components",
		"apply style": function() {
			var domNode = document.createElement('div');
			document.body.appendChild(domNode);

			var style = new Style({
				css: '#this {\
					background-color: red;\
					width: 50px;\
					height: 20px;\
				}'
			});
			style.apply(domNode);
			var computedStyle = getComputedStyle(domNode);
			assert.equal(computedStyle.getPropertyValue('background-color'), "rgb(255, 0, 0)");
			assert.equal(computedStyle.getPropertyValue('width'), "50px");
			assert.equal(computedStyle.getPropertyValue('height'), "20px");
		},
		"unapply style": function() {
			var domNode = document.createElement('div');
			document.body.appendChild(domNode);

			var style = new Style({
				css: '#this {\
					background-color: green;\
					width: 50px;\
					height: 20px;\
				}'
			});
			var computedStyle = getComputedStyle(domNode);
			var origBackground = computedStyle.getPropertyValue('background-color');
			style.apply(domNode);
			assert.equal(computedStyle.getPropertyValue('background-color'), "rgb(0, 128, 0)");
			style.unapply(domNode);
			assert.equal(computedStyle.getPropertyValue('background-color'), origBackground);
		},

		"destroy style": function() {
			var style = new Style({
				css: ''
			});

			assert.equal(document.head.lastChild, style.domElement);
			style.destroy();
			assert.notEqual(document.head.lastChild, style.domElement);
		},

		"named style": function() {
			var domNode = document.createElement('div');
			document.body.appendChild(domNode);
			var style = new Style({
				css: '',
				name: 'Toto'
			});
			style.apply(domNode);

			assert.equal(style.id.substr(0, 4), 'Toto');
		}
	});
});