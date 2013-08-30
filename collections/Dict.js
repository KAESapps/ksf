define([
	'compose',
	'./ObservableObject',

], function(
	compose,
	ObservableObject
){
	var Dict = compose(
		ObservableObject,
		function(args){
			args && this.setEach(args);
		}
	);
	return Dict;
});