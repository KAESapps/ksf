define([
	'compose',
	'../MemoryValueSource',
	'../ValueSourceCompositeAccessor',
	'../propertyObject/Computer',
	'../propertyObject/_WithComputedProperties',
	'../propertyObject/PropertyAccessor'
], function(
	compose,
	ValueSource,
	CompositeAccessorWithComputer,
	Computer,
	_WithComputedProperties,
	PropertyAccessor
){
	var DefaultEmptyString = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var StringComputer = compose(function(fct) {
		this.computeValueFromDeps = fct;
	});

	var PersonComputer = compose(Computer.prototype, _WithComputedProperties, function() {
		Computer.call(this, {
			firstName: new DefaultEmptyString(),
			lastName: new DefaultEmptyString()
		});
	}, {
		computedProperties: {
			fullName: {
				computer: new StringComputer(function(firstName, lastName) {
					return (firstName + ' ' + lastName).trim();
				}),
				deps: ['firstName', 'lastName']
			}
		},
		_accessorFactories: {
			firstName: PropertyAccessor,
			lastName: PropertyAccessor,
			fullName: PropertyAccessor
		}
	});

	var Person = function() {
		CompositeAccessorWithComputer.call(this, new ValueSource(), new PersonComputer());
	};
	Person.prototype = CompositeAccessorWithComputer.prototype;
	return Person;
});