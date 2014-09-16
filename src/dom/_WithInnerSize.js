define([], function() {
	return {
		_innerSize: function() {
			// on mesure l'intérieur de 2 manières, et on prend le plus petit :
			// via getComputedStyle (plus précis, mais qui ne tient pas compte des ascenseurs)
			// via clientHeight/Width (tient compte des ascenseurs, mais moins précis, ce qui peut poser des problèmes d'arrondis)

			// TODO: voir s'il ne vaudrait pas mieux essayer d'éviter ces pbs d'arrondis (en forçant des tailles arrondies) ?

			var cs = getComputedStyle(this.domNode),
				bb = cs.getPropertyValue('box-sizing') === 'border-box',
				clientHeight = this.domNode.clientHeight,
				clientWidth = this.domNode.clientWidth,
				scrollHeight, scrollWidth, computedHeight, computedWidth;


			if (clientHeight === 'auto' || clientWidth === 'auto') {
				// means that display is not block or inline-block
				// probably a misuse, throw an exception
				throw "Tried to measure a node that is not block or inline-block";
			} else {
				computedHeight = parseFloat(cs.getPropertyValue('height'));
				if (bb) {
					var vPadding = parseFloat(cs.getPropertyValue('padding-top') || 0) + parseFloat(cs.getPropertyValue('padding-bottom') || 0);
					computedHeight -= vPadding;
					computedHeight -= parseFloat(cs.getPropertyValue('border-top-width') || 0);
					computedHeight -= parseFloat(cs.getPropertyValue('border-bottom-width') || 0);
					scrollHeight = clientHeight - vPadding;	// clientHeight includes padding
				}
				computedWidth = parseFloat(cs.getPropertyValue('width'));
				if (bb) {
					var hPadding = parseFloat(cs.getPropertyValue('padding-left') || 0) + parseFloat(cs.getPropertyValue('padding-right') || 0);
					computedWidth -= hPadding;
					computedWidth -= parseFloat(cs.getPropertyValue('border-left-width') || 0);
					computedWidth -= parseFloat(cs.getPropertyValue('border-right-width') || 0);
					scrollWidth = clientWidth - hPadding;	// clientHeight includes padding
				}
			}

			return {
				height: Math.min(scrollHeight, computedHeight),
				width: Math.min(scrollWidth, computedWidth)
			};
		}
	};
});