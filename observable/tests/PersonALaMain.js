define([
	'compose',
	'ksf/base/Evented',
	'ksf/base/Destroyable',
	'../ObservableMap'
], function(
	compose,
	Evented,
	Destroyable,
	ObservableMap
){
	return compose(ObservableMap, function() {
		this.addProperty('firstName');
		this.addProperty('lastName');
		this.addProperty('fullName');
		this.set({});
	}, {
		set: function(value) {
			var newState = this._normalizeSetValue(value);

			newState.firstName = typeof(value.firstName) === 'string' ? value.firstName : '';
			newState.lastName = typeof(value.lastName) === 'string' ? value.lastName : '';

			if ('fullName' in newState && !('firstName' in value || 'lastName' in value)) {
				newState.fullName = typeof(value.fullName) === 'string' ? value.fullName : '';
				newState.firstName = newState.fullName.split(' ')[0];
				newState.lastName = newState.fullName.split(' ')[1];
			} else {
				newState.fullName = (newState.firstName + ' ' + newState.lastName).trim();
			}

			this._observableState.set(newState);
		},
		patch: function(obj) {
			var result = this.get();
			if ('fullName' in obj && !('firstName' in obj || 'lastName' in obj)) {
				delete result['firstName'];
				delete result['lastName'];
			}
			Object.keys(obj).forEach(function(key) {
				result[key] = obj[key];
			});
			this.set(result);
		}
	});
});