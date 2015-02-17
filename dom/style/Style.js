define([
	'../../utils/compose',
], function(
	compose
) {
	window.kssId = 0;
	function createId() {
		return 'kss' + window.kssId++;
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

	return compose(function(css) {
		this.id = createId();

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
		applyState: function(domNode, state) {
			domNode.classList.add(state);
		},
		unapplyState: function(domNode, state) {
			domNode.classList.remove(state);
		},
/* TODO: useful?
		//	Tag a child for referencing it in style description
		tagChild: function(childNode, tag) {
			childNode.classList.add(tag);
		},
		untagChild: function(childNode, tag) {
			childNode.classList.remove(tag);
		},
		tagChildren: function(children) {
			for (var tag in children) {
				this.tagChild(children[tag], tag);
			}
		},
*/
		destroy: function() {
			rules.remove(this.rule);
		}
	});
});