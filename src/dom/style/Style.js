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
	

	var rulesArray = [],
		applied = 0;
	function updateCss() {
		if (applied && styleElement.childNodes.length > 0) {
			if (!styleElement.parentNode) {
				document.head.appendChild(styleElement);
			}
		} else {
			if (styleElement.parentNode) {
				document.head.removeChild(styleElement);
			}
		}
	}

	var rules = {
		add: function (rule) {
			styleElement.appendChild(rule);
			updateCss();
		},
		remove: function(rule) {
			styleElement.removeChild(rule);
			updateCss();
		}
	};
	
	var Style = compose(function(css, options) {
		this.id = createId(options && options.name);
		
		this.rule = document.createTextNode(css.replace(/#this/g, '.' + this.id));
		rules.add(this.rule);
	}, {
		apply: function(domNode) {
			domNode.classList.add(this.id);
			applied += 1;
			updateCss();
		},
		unapply: function(domNode) {
			domNode.classList.remove(this.id);
			applied -= 1;
			updateCss();
		},
		destroy: function() {
			rules.remove(this.rule);
		}
	});
	return Style;
});