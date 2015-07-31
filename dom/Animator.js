var Anim = function(description) {
		var timeCursor = 0,
				lastEnd;
		this._desc = description.map(function(desc) {
				desc.startTime = timeCursor;
				timeCursor += desc.duration;
				desc.endTime = timeCursor;
				if (desc.start === undefined) {
						desc.start = lastEnd;
				}
				lastEnd = desc.end;
				return desc;
		});
		this._totalDuration = timeCursor;
};
Anim.prototype = {
		init: function(initTimestamp) {
				this._initTime = initTimestamp;
		},
		_getValue: function(t) {
				var value;
				this._desc.some(function(animDesc) {
						if (animDesc.endTime >= t) {
								var animT = (t - animDesc.startTime) / animDesc.duration;
								value = animDesc.start + animDesc.easing(animT) * (animDesc.end - animDesc.start);
								return true;
						}
				});
				this._lastValue = value;
				return value;
		},
		lastValue: function() {
				return this._lastValue;
		},
		render: function(renderFrame, endCallback) {
				var t = Date.now() - this._initTime;
				if (t > this._totalDuration) {
						t = this._totalDuration;
				}
				renderFrame(this._getValue(t));
				if (!this._cancelled) {
						if (t !== this._totalDuration) {
								var self = this;
								requestAnimationFrame(function() {
										self.render(renderFrame, endCallback);
								});
						} else {
								endCallback && endCallback();
						}
				}
		},
		cancel: function() {
				this._cancelled = true;
		}
};
module.exports = Anim;
