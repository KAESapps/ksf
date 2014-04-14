define([
	"compose",
	'../computers/BasicPropertyObject',
	'../accessorMixins/BasicPropertyObject',
], function(
	compose,
	BasicPropertyObjectComputer,
	BasicPropertyObjectAccessorMixin
){
	var BasicPropertyObject = compose(function(properties) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		this.computer = new BasicPropertyObjectComputer(computers);
		this.accessorMixin = new BasicPropertyObjectAccessorMixin(accessorMixins).ctr;
	});
	return BasicPropertyObject;
});