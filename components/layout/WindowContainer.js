define([
	'dojo/domReady!'
], function(
){
	return function(args) {
		var rootNode = args.rootNode || document.body;

		var size = function() {
			args.content.set('bounds', {
				height: rootNode.offsetHeight,
				width: rootNode.offsetWidth
			});
		};

		rootNode.appendChild(args.content.domNode);

		size();
		args.content.startLiveRendering();
		window.onresize = size;
	};
});