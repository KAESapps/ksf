define([
	"bacon",
	'ksf/utils/destroy'
], function(
	Bacon,
	destroy
){
	var Observable = function(){
		this._changing = 0;
	};

	Observable.prototype = {
		_startChanges: function(){
			this._changing++;
		},
		_stopChanges: function(){
			this._changing--;
			if (! this._changing){
				this.length = this._store.length;
				this._emit("changes", this._changesQueue || []);
				delete this._changesQueue;
				this._emit("changed");
			}
		},
		_pushChanges: function(changes){
			this._changesQueue = this._changesQueue ? this._changesQueue.concat(changes) : changes;
		},
		// create an eventStream from an eventType
		asStream: function(eventType){
			var emitter = this;
			var streams = this._streams || (this._streams = {});
			return streams[eventType] || (streams[eventType] = new Bacon.EventStream(function(subscriber) {
				var handler = emitter.on(eventType, function(event){
					subscriber(new Bacon.Next(function() {
						return event;
					}));
				});
				return function() {
					destroy(handler);
				};
			}));
		},
		asReactive: function(){
			return this._reactive || (this._reactive = this.asStream("changed").map(this).toProperty(this));
		},
		diffAsChanges: function(from){
			return from ? from.toChanges("remove").concat(this.toChanges("add")) : this.toChanges("add");
		},
		asChangesStream: function(from){
			return this.asStream("changes").toProperty(this.diffAsChanges(from));
		},
		// return a bacon reactive from expression applied to this
		watch: function(expression, equals){
			return this.asReactive().map(expression).skipDuplicates(equals);
		},
		// return a bacon reactive with the value of the property
		// if the prop start with a ".", use it directly instead of using the get method
		getR: function(prop){
			var reactive;
			if(prop[0] === "."){
				reactive = this.asReactive().map(prop).skipDuplicates();
			} else {
				reactive = this.asReactive().map(".get", prop).skipDuplicates();
			}

			var args = Array.prototype.slice.call(arguments, 1);
			args.forEach(function(prop){
				reactive = reactive.flatMapLatest(function(value){
					return value && value.getR && value.getR(prop) || Bacon.constant(undefined);
				});
			});

			return reactive;
			// faut-il ne mettre une valeur initiale que lorsque la propriété est installée ou mimer le résultat d'un get normal qui renvoi undefined même si la propriété n'est pas installée ? Dans le cas du indexedSet, c'est pratique de ne pas utiliser la méthode "has" car elle sert à tester la présence d'une valeur et pas d'une propriété...
/*			if (this.has(prop)){
				return stream.toProperty(this.get(prop));
			} else {
				return stream.toProperty();
			}
*/
		},
		getEachR: function(){
			var props = arguments;
			return this.asStream("changed").map(function(){
				return this.getEach.apply(this, props);
			}.bind(this)).toProperty(this.getEach.apply(this, arguments)).skipDuplicates(function(old, current){
				return current.every(function(val, i){
					return val === old[i];
				});
			});

			// TODO: implementation qui utilise getR pour pouvoir faire de l'observation 'deep'
/*			var streams = Array.prototype.map.call(arguments, function(prop){
				if (Array.isArray(prop)){
					return this.getR.apply(this, prop);
				}
				return this.getR(prop);
			}, this);
			return Bacon.combineAsArray(streams).sampledBy(this.asStream("changed")).skipDuplicates();
*/
			// sampledBy permet de n'émettre la valeur que sur l'événement "changed" de l'objet et pas sur chaque output des getR
			// mais par contre, cela revient à émettre aussi lorsqu'aucun getR n'a émit, d'où le skipDuplicates qui permet de détecter que la valeur n'a pas changé (un nouveau array n'a pas été créé)
		},

	};

	return Observable;
});