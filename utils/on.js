import capitalize from 'lodash/string/capitalize'

export default function on (target, eventName, cb) {
	// use specific method if available
	var capitalized = capitalize(eventName)
	if (target['on' + capitalized]) {
		target['on' + capitalized](cb)
		return function() {
			target['off' + capitalized](cb)
		}
	}
	// fallback to generic method
	target.on(eventName, cb)
	return function () {
		target.off(eventName, cb)
	}
}
