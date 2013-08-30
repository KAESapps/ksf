define([
	
], function(
	
){
	return function(args) {
		var rootNode = args.rootNode || document.body;
		
		var size = function() {
			args.content.set('bounds', {
				height: rootNode.offsetHeight,
				width: rootNode.offsetWidth
			});
			args.content.updateRendering();
		};

		rootNode.appendChild(args.content.get('domNode'));
		
		size();
		args.content.startLiveRendering();
		window.onresize = size;
	};
});