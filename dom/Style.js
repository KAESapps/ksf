define([
	'compose'
], function(
	compose
) {
	function createId(name) {
		name = name ? name + '-' : '';
		return name + 'sxxxxxx'.replace(/x/g, function(c) {
			return (Math.random()*16|0).toString(16);
		});
	}

	return compose(function(args) {
		this.id = createId(args.name);
		this.domElement = document.createElement('style');
		
		var rule = args.css.replace(/#this/g, '.' + this.id);
		if(this.domElement.sheet) {
			this.domElement.sheet.cssText = rule;
		} else {
			// for Webkit
			this.domElement.appendChild(document.createTextNode(rule));
		}

		document.head.appendChild(this.domElement);
		
	}, {
		apply: function(domNode) {
			domNode.classList.add(this.id);
		},
		unapply: function(domNode) {
			domNode.classList.remove(this.id);
		},
		destroy: function() {
			document.head.removeChild(this.domElement);
		}
	});
});