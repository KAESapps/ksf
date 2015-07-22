import capitalize from 'lodash/string/capitalize'

export default function on (target, eventName, cb) {
	var capitalized = capitalize(eventName)
	target['on' + capitalized](cb)
	return function() {
		target['off' + capitalized](cb)
	}
}