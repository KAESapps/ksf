define(['./onDomEvent'], function(onDomEvent) {
	return {
		onAction: onDomEvent('click')
	};
});