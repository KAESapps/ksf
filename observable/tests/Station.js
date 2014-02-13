define([
	'compose',
	'../_StatefulMap',
	'../accessors/BasicPropertyAccessor',
	'../accessors/_MapPropertyAccessor',
	'../accessors/_ArrayPropertyAccessor',
	'../accessors/_IndexAccessor',
	'../_Map'
], function(
	compose,
	_StatefulMap,
	BasicPropertyAccessor,
	_MapPropertyAccessor,
	_ArrayPropertyAccessor,
	_IndexAccessor,
	_Map
){
	var BasicProperty = compose({
		compute: function(value) {
			return value;
		},
		accessorFactory: BasicPropertyAccessor
	});
	var RequiredStringProperty = compose({
		compute: function(value) {
			return typeof(value) === 'string' ? value : '';
		},
		accessorFactory: BasicPropertyAccessor
	});

	var ArbreItem = compose({
		compute: function(value) {
			return value || {};
		},
		accessorFactory: compose(_IndexAccessor, _Map, {
			_properties: {
				essence: new BasicProperty(),
				circonference: new BasicProperty(),
			},
		})
	});

	var ArbreListProperty = compose({
		compute: function(value) {
			return typeof(value) === 'object' ? value : [];
		},
		accessorFactory: compose(_ArrayPropertyAccessor, {
			_itemProperty: new ArbreItem()
		})
	});

	return compose(_StatefulMap, {
		_properties: {
			nom: new RequiredStringProperty(),
			position: new BasicProperty(),
			arbres: new ArbreListProperty()
		},
	});
});