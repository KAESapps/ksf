define([
	'compose',
	'./Style',
	'Absurd'
], function(
	compose,
	Style
){
	/*
		Define style from a JS object (using AbsurdJS)
	 */
	return compose(Style.prototype, function(jss) {
		var css;
		Absurd().add({
			'#this': jss
		}).compile(function(err, result) {
			css = result;
		});
		Style.call(this, css);
	});
});