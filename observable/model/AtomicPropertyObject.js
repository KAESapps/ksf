define([
	"../../utils/compose",
	'../computers/AtomicPropertyObject',
	'../accessorMixins/AtomicPropertyObject',
], function(
	compose,
	AtomicPropertyObjectComputer,
	AtomicPropertyObjectAccessorMixin
){
	var AtomicPropertyObject = compose(function(properties) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		this.computer = new AtomicPropertyObjectComputer(computers);
		this.accessorMixin = new AtomicPropertyObjectAccessorMixin(accessorMixins).ctr;
	}, {
		defaultValue: function() {
			return {};
		},
	});
	return AtomicPropertyObject;
});