define([
	"dojo/on",
	"put-selector/put",
	"collections-amd/shim-array"
], function(
	on,
	put
) {
	var HtmlElement = function(args){
		this.domNode = document.createElement(args.tag);
		WithEvents.call(this);
		WithGetSet.call(this);
		WithDefaultGetterSetterForHtmlElement.call(this);
	};

	var WithDefaultGetterSetterForHtmlElement = function(){
		this._Getter = function(prop){
			return this.domNode[prop];
		};
		this._Setter = function(prop, value){
			this.domNode[prop] = value;
		};
		this._Detector = function(prop){
			return this.hasOwnProperty(prop);
		};
		this._Remover = function(prop){
			// delete this[prop];
		};
	};
	var WithEvents = function(){
		this._listeners = [];
		this.on = function(type, cb){
			var path = type.split(":");
			var position = this._listeners;
			path.forEach(function(branch, index){
				if (branch === ""){
					position.push(cb);
				} else {
					position[branch] = position[branch] || [];
					position = position[branch];
					if (index === path.length-1){
						position.push(cb);
					}
				}
			});
			this.emit("eventListenerAdded", {
				type: type,
				cb: cb,
			});
			return {
				remove: function(){
					var position = this._listeners;
					path.forEach(function(branch, index){
						if (branch === ""){
							position.delete(cb);
						} else {
							position = position[branch];
							if (index === path.length-1){
								position.delete(cb);
							}
						}
					});
				}.bind(this),
			};
		};
		this.emit = function(type, event){
			event.type = type;
			var position = this._listeners;
			position.forEach(function(cb){
				cb.call(null, event);
			});
			if (type !== ""){
				var path = type.split(":");
				path.some(function(branch){
					position = position[branch];
					if (position){
						position.forEach(function(cb){
							cb.call(null, event);
						});
					} else {
						return true;
					}
				});
			}
		};
	};
	var WithOnForHtmlElement = function(){
		this.on = function(type, cb){
			return this.domNode.addEventListener(type, cb);
		};
	};
	var WithValueForHtmlInput = function(){
		this._valueSetter = function(value){
			this._oldValue = this.get("value"); // for when a change is done by the user
			this.domNode.value = value;
		};
		// listen "change" event to emit ks standardised events
		this.domNode.addEventListener("change", function(){
			var currentValue = this.get("value");
			this.emit && this.emit("change:value", {
				target: this,
				prop: "value",
				currentValue: currentValue,
				oldValue: this._oldValue,
				settedValue: currentValue,
			});
		}.bind(this));
	};
	var WithSize = function(){
		this.size = function(args){
			this.domNode.style.width = args.w + 'px';
			this.domNode.style.height = args.h + 'px';
		};
		this._sizeGetter = function(){
			return {
				w: this.domNode.offsetWidth,
				h: this.domNode.offsetHeight,
			};
		};
		this._preferredSizeGetter = function() {
			var clone = this.domNode.cloneNode();
			clone.innerHTML = this.domNode.innerHTML;

			clone.style.height = null;
			clone.style.width = null;
			document.body.appendChild(clone);
			var size = {
				w: clone.offsetWidth,
				h: clone.offsetHeight
			};

			document.body.removeChild(clone);
			return size;
		};
	};
	var WithTableLayout = function(args){
		this.cells = [
			[/*c1, c2*/],
			[/*c3, c4*/],
		];
		this.layout = function(){

			this.domNode.style.position = 'relative';

			this.domNode.appendChild(this.cells[0][0].domNode);
			this.domNode.appendChild(this.cells[0][1].domNode);
			this.domNode.appendChild(this.cells[1][0].domNode);
			this.domNode.appendChild(this.cells[1][1].domNode);

			var c0MaxWidth = Math.max(this.cells[0][0].get("preferredSize").w, this.cells[1][0].get("preferredSize").w);
			var c1MaxWidth = Math.max(this.cells[0][1].get("preferredSize").w, this.cells[1][1].get("preferredSize").w);
			var maxWidth = c0MaxWidth + c1MaxWidth;
			var diff = maxWidth - this.get("size").w;
			c0MaxWidth -= diff / 2;
			c1MaxWidth -= diff /2;


			this.cells[0][0].size({w: c0MaxWidth});
			this.cells[1][0].size({w: c0MaxWidth});
			this.cells[0][1].size({w: c1MaxWidth});
			this.cells[1][1].size({w: c1MaxWidth});

			var r0MaxHeight = Math.max(this.cells[0][0].get("size").h, this.cells[0][1].get("size").h);
			var r1MaxHeight = Math.max(this.cells[1][0].get("size").h, this.cells[1][1].get("size").h);

			this._positionCell(this.cells[0][0], {x: 0, y: 0 });
			this._positionCell(this.cells[0][1], {x: c0MaxWidth, y: 0 });
			this._positionCell(this.cells[1][0], {x: 0, y: r0MaxHeight });
			this._positionCell(this.cells[1][1], {x: c0MaxWidth, y: r0MaxHeight });

			this.size({
				h: r0MaxHeight + r1MaxHeight,
				w: c0MaxWidth + c1MaxWidth
			});

			this.cells[0][1].on("change:innerHTML", this.layout.bind(this));
		};

		this._positionCell = function(cell, position) {
			cell.domNode.style.position = 'absolute';
			cell.domNode.style.border = '1px solid';
			cell.domNode.style.display = 'block';
			cell.domNode.style.boxSizing = 'border-box';
			cell.domNode.style.left = position.x + "px";
			cell.domNode.style.top = position.y + "px";
		};
	};
	var WithVFlexLayout = function(args){
		this._childrenSetter = function(children){
			this.flexChildren = [];
			this.fixedHeight = 0;
			this.children = children;
			children.forEach(function(childAndOptions) {
				var child = childAndOptions[0],
					options = childAndOptions[1];
				this.domNode.appendChild(child.domNode);
				child.domNode.style.display = 'block';

				if (options.flex) {
					this.flexChildren.add(child);
				} else {
					this.fixedHeight += child.get('size').h;
				}
			}.bind(this));
		};
		this.layout = function() {
			this.children.forEach(function(childAndOptions) {
				var child = childAndOptions[0],
					options = childAndOptions[1];
				if (!options.flex) {
					this.fixedHeight += child.get('size').h;
				}
			});

			var flexHeight = this.get('size').h - this.fixedHeight;

			this.flexChildren.forEach(function(child) {
				child.size({h: flexHeight/this.flexChildren.length});
			}.bind(this));
			this.layouting = false;
		};
	};

	var WithGetSet = function(){
		this.remove = function(prop){
			var oldValue = this.get(prop);
			// set to undefined to emit a "change" event. Perhaps we should instead emit a "change" event ?
			// this.set(prop, undefined);
			if (this["_"+prop+"Remover"]){
				this["_"+prop+"Remover"](prop);
			} else {
				this["_Remover"](prop); // default
			}
			// we test that the prop was effectively removed
			if (!this.has(prop)){
				this.emit("remove:"+prop, {
					target: this,
					prop: prop,
					oldValue: oldValue,
				});
			}
		};
		this.get = function(prop){
			if (this["_"+prop+"Getter"]){
				return this["_"+prop+"Getter"](prop);
			} else {
				return this["_Getter"](prop); // default getter
			}
		};
		this.set = function(prop, settedValue){
			var oldValue = this.get(prop);

			if (this["_"+prop+"Setter"]){
				this["_"+prop+"Setter"](settedValue);
			} else {
				this["_Setter"](prop, settedValue); // default setter
			}

			var currentValue = this.get(prop);

			// only emit "change" if value has really changed
			if (currentValue !== oldValue){
				this.emit("change:"+prop, {
					target: this,
					prop: prop,
					currentValue: currentValue,
					oldValue: oldValue,
					settedValue: settedValue,
				});
			}

		};
		this.has = function(prop){
			if (this["_"+prop+"Detector"]){
				return this["_"+prop+"Detector"](prop);
			} else {
				return this["_Detector"](prop); // default detector
			}
		};
	};
	var WithDefaultGetterSetter = function(){
		this._Getter = function(prop){
			return this[prop];
		};
		this._Setter = function(prop, value){
			this[prop] = value;
		};
		this._Detector = function(prop){
			return this.hasOwnProperty(prop);
		};
		this._Remover = function(prop){
			delete this[prop];
		};
	};

	var table = new HtmlElement({
		tag: "div",
	});
	WithTableLayout.call(table);
	WithSize.call(table);
	table.size({w: 500});

	var Span = function(args){
		var s = new HtmlElement({
			tag: "span",
		});
		WithSize.call(s);
		s.set("innerHTML", args);
		return s;
	};

	window.c01 = new Span("test");
	table.cells = [
		[new Span("test"), c01],
		[new Span("texte très très long"), new Span("test")]
	];


	var flex = new HtmlElement({
		tag: "div",
	});
	WithVFlexLayout.call(flex);
	WithSize.call(flex);

	document.body.parentNode.style.height = '100%';
	document.body.style.height = '100%';
	document.body.style.margin = 0;
	flex.domNode.style.height = '100%';

	var flexSpan = new Span('');
	flexSpan.domNode.appendChild(table.domNode);
	flexSpan.domNode.style.background = '#EEE';
	var flexSpan2 = new Span('');
	flexSpan2.domNode.innerHTML = "tets";
	flexSpan2.domNode.style.background = 'red';
	flex.set("children", [
		[flexSpan, { flex: true }],
		[flexSpan2, { flex: true }],
		[new Span("Pied de page"), {}]
	]);

	var app = window.app = {
		container: new HtmlElement({tag: "div"}),
		title: new HtmlElement({tag: "div"}),
		content: flex,
	};
	app.domNode = app.container.domNode;
	app.domNode.appendChild(app.title.domNode);
	app.domNode.appendChild(app.content.domNode);
	app.title.set("innerHTML", "Titre de l'application");

	document.body.appendChild(app.domNode);



/*	flex.layout();

	table.layout();

	var eventsCount = 0;
	on(window, 'resize', function() {
		var start = performance.now();
		flex.layout();
		console.log(eventsCount, performance.now()-start);
		eventsCount++;
	});
*/

});
