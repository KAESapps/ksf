define([
	"compose",
	'../computers/IncrementalPropertyObject',
	'../accessorMixins/IncrementalPropertyObject',
], function(
	compose,
	IncrementalPropertyObjectComputer,
	IncrementalPropertyObjectAccessorMixin
){

	var IncrementalPropertyObject = compose(function(properties, Computer) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		if (Computer) {  // le computer est injectable
			this.computer = new Computer(computers);
		} else {
			this.computer = new IncrementalPropertyObjectComputer(computers);
		}
		this.accessorMixin = new IncrementalPropertyObjectAccessorMixin(accessorMixins).ctr;
	}, {
		defaultValue: function() {
			return {};
		},
	});
	return IncrementalPropertyObject;
});