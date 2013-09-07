define([
	'compose',
	'ksf/dom/WithOrderedContent',
	'ksf/dom/Sizeable',
	'./HtmlElement'
], function(
	compose,
	WithOrderedContent,
	Sizeable,
	HtmlElement
){
	return compose(
		HtmlElement,
		WithOrderedContent,
		Sizeable,
		{
			_contentSetter: function(content) {
				WithOrderedContent.prototype._contentSetter.apply(this, arguments);
			},

			updateRendering: function() {
				// HtmlElement.prototype.updateRendering.apply(this);
				this._applyBounds();
				this._applyContent();
				this._currentContent.forEach(function(cmp) {
					cmp.updateRendering && cmp.updateRendering();
				});
			},

			startLiveRendering: function() {
				var cancels = [],
					self = this;

				cancels.push(this.getR('bounds').onValue(function() {
					self._applyBounds();
					self._currentContent && self._currentContent.forEach(function(cmp) {
						cmp.updateRendering && cmp.updateRendering();
					});
				}));

				var liveContent = [];
				var cancelLiveContent = function() {
					liveContent.forEach(function(child) {
						child.stopLiveRendering && child.stopLiveRendering();
					});
					liveContent = [];
				};
				cancels.push(this.getR('content').onValue(function() {
					cancelLiveContent();
					self._applyContent();
					self._currentContent.forEach(function(cmp) {
						cmp.startLiveRendering && cmp.startLiveRendering();
						liveContent.push(cmp);
					});
				}));

				this.stopLiveRendering = function() {
					cancels.forEach(function(cancel) {
						cancel();
					});
					cancelLiveContent();
					delete this.stopLiveRendering;
				};
			}
		}
	);
});