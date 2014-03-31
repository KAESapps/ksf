define([
	'../Style',
	'./archives/StyleOneTextNode'
], function(
	Style,
	StyleTextNode
){
	JSLitmus.test('style creation', function() {
		var style = new Style({
			css: '#this {\
				background-color: red;\
				width: 50px;\
				height: 20px;\
			}'
		});
		style.destroy();
	});

	JSLitmus.test('style creation TN', function() {
		var style = new StyleTextNode({
			css: '#this {\
				background-color: red;\
				width: 50px;\
				height: 20px;\
			}'
		});
		style.destroy();
	});
});