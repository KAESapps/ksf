import Value from './Value'

export default function PersistableValue (name, initValue) {
	if (initValue === undefined) {
		initValue = null;
	}
	var storedValue = JSON.parse(localStorage.getItem(name));
	var value = new Value(storedValue === null ? initValue : storedValue);
	value.onChange(function(newValue) {
		if (newValue !== null && newValue !== undefined) {
			localStorage.setItem(name, JSON.stringify(newValue));
		} else {
			localStorage.removeItem(name);
		}
	});
	return value;
}
