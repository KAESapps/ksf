import capitalize from 'lodash/string/capitalize'

export default function on (target, eventName, cb) {
	// use specific method if available
	var capitalized = capitalize(eventName)
	if (target['on' + capitalized]) {
		var canceler = target['on' + capitalized](cb) // to be backward compatible TODO: remove in next major version
		return (typeof canceler === 'function') ? canceler : function() {
			target['off' + capitalized](cb)
		}
	}
	// fallback to generic method
	target.on(eventName, cb)
	return function () {
		target.off(eventName, cb)
	}
}
