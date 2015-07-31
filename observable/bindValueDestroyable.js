import destroy from '../utils/destroy'
import on from '../utils/on'

export default function(value, cb, scope) {
	scope = scope || null;
	var toBeDestroyed = cb.call(scope, value.value());
	var canceler = on(value, 'change', function(val) {
		destroy(toBeDestroyed);
		toBeDestroyed = cb.call(scope, val);
	});
	return function() {
		canceler();
		destroy(toBeDestroyed);
	};
};
