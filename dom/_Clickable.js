define(['./onDomEventMethod'], function(onDomEventMethod) {
	return {
		onAction: onDomEventMethod('click')
	};
});