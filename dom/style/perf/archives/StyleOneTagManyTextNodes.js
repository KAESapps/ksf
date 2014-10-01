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

	var styleElement = document.createElement('style');
	document.head.appendChild(styleElement);
	
	return compose(function(args) {
		this.id = createId(args.name);
		
		var rule = args.css.replace(/#this/g, '.' + this.id);
		this.ruleNode = document.createTextNode(rule);
		styleElement.appendChild(this.ruleNode);
	}, {
		apply: function(domNode) {
			domNode.classList.add(this.id);
		},
		unapply: function(domNode) {
			domNode.classList.remove(this.id);
		},
		destroy: function() {
			styleElement.removeChild(this.ruleNode);
		}
	});
});