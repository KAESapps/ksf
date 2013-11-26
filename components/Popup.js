define([
	'compose',
	'ksf/dom/composite/Composite',
	'./layout/HorizontalContainer'
], function(
	compose,
	Composite,
	HorizontalContainer
){
	return compose(Composite, function(args) {
		this._area = args.area;
		this._components.factories.addEach({
			mask: function() {
				return new HorizontalContainer();
			}
		});

		this.set('content', args.content);
		// closed at start
		this.set('open', false);

		this._components.whenDefined('mask', function(container) {
			container.get('domNode').style.textAlign = 'center';
			var areaNode = args.area.get('domNode');
			return [
				container.setR('bounds', args.area.getR('bounds').map(function(bounds) {
					return {
						height: areaNode.offsetHeight,
						width: areaNode.offsetWidth
					};
				})),
				this.getR('open').onValue(function(open) {
					container.get('domNode').style.display = open ? null : 'none';
				})
			];
		}.bind(this));

		this._setLayout();
		this.style.set('base', 'Popup');
	}, {
		_setLayout: function() {
			this._layout.set('config', [
				'mask', [
					[this.get('content'), { verticalAlign: 'middle' }]
				]
			]);
		},

		_applyBounds: function() {
			Composite.prototype._applyBounds.apply(this);
			var thisNode = this.get('domNode');
			var areaNode = this._area.get('domNode');
			thisNode.style.position = 'absolute';
			thisNode.style.left =  areaNode.offsetLeft + 'px';
			thisNode.style.top =  areaNode.offsetTop + 'px';
		},

		_contentSetter: function(content) {
			this._components.add(content, 'content');
			this._Setter('content', content);
		},

		startLiveRendering: function() {
			Composite.prototype.startLiveRendering.apply(this);

			var cancelLiveContent = this.getR('content').onValue(this._setLayout.bind(this));
			var stopLive = this.stopLiveRendering;
			this.stopLiveRendering = function() {
				cancelLiveContent();
				stopLive();
			};
		}
	});
});