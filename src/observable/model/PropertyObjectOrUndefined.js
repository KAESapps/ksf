define([
	"compose",
	'../computers/PropertyObjectOrUndefined',
	'../accessorMixins/PropertyObjectOrUndefined',
], function(
	compose,
	PropertyObjectComputer,
	PropertyObjectAccessorMixin
){
	var BasicPropertyObject = compose(function(properties) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		this.computer = new PropertyObjectComputer(computers);
		this.accessorMixin = new PropertyObjectAccessorMixin(accessorMixins).ctr;
	}, {
		defaultValue: function() {
			return undefined;
		},
	});
	return BasicPropertyObject;
});