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
		this._properties = properties;
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			if (properties[prop].computer) {
				computers[prop] = properties[prop].computer;
			}
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
			var ret = {};
			var properties = this._properties;
			Object.keys(properties).forEach(function(key) {
				var prop = properties[key];
				ret[key] = prop.defaultValue();
			});
			return ret;
		},
	});
	return IncrementalPropertyObject;
});