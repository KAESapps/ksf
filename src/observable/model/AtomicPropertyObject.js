define([
	"compose",
	'../computers/AtomicPropertyObject',
	'../accessorMixins/Value',
], function(
	compose,
	AtomicPropertyObjectComputer,
	ValueAccessorMixin
){
	var AtomicPropertyObject = compose(function(properties) {
		var computers = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
		});
		this.computer = new AtomicPropertyObjectComputer(computers);
		this.accessorMixin = new ValueAccessorMixin().ctr;
	}, {
		defaultValue: function() {
			return {};
		},
	});
	return AtomicPropertyObject;
});