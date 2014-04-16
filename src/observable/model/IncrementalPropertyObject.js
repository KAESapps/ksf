define([
	"compose",
	'../computers/IncrementalPropertyObject',
	'../accessorMixins/IncrementalPropertyObject',
], function(
	compose,
	IncrementalPropertyObjectComputer,
	IncrementalPropertyObjectAccessorMixin
){
	var IncrementalPropertyObject = compose(function(properties) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		this.computer = new IncrementalPropertyObjectComputer(computers);
		this.accessorMixin = new IncrementalPropertyObjectAccessorMixin(accessorMixins).ctr;
	});
	return IncrementalPropertyObject;
});