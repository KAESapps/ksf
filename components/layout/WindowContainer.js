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

		size();
		rootNode.appendChild(args.content.domNode);
		args.content.set('inDom', true);
		args.content.startLiveRendering();
		window.onresize = size;
	};
});