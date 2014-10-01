define([
	'../../utils/compose',
	'./Style',
	'../../absurd/Absurd',
], function(
	compose,
	Style,
	Absurd
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