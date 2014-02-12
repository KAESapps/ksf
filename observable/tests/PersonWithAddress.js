define([
	'compose',
	'../_ObservableNestedMap'
], function(
	compose,
	_ObservableNestedMap
){
	return compose(_ObservableNestedMap, function() {
		this._setStructure({
			properties: {
				firstName: {},
				lastName: {},
				address: {
					type: 'object',
					properties: {
						street: {},
						city: {}
					}
				}
			}
		});
	});
});