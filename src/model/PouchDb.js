define([
	'compose',
	'ksf/base/_Evented',
	'dojo/Deferred',
	'pouchdb/dist/pouchdb-2.2.3.min',
], function(
	compose,
	_Evented,
	Deferred,
	PouchDB
){
	/**
		Abstraction de pouchDB avec une API plus simple et sans gestion des révisions ni des conflits
	*/
	return compose(_Evented, function(name) {
		this._db = new PouchDB(name);
		this._init();
	}, {
		/*
			Maintien la liste du numéro de révision gagnant pour chaque document. Cela permet de faire une mutation sans devoir interroger d'abord la base. Est-ce que ça vaut le coup ou est-il préférable de faire un get à chaque set ?
			On en profite aussi pour émettre les événements 'change' et ainsi ne créer qu'un seul listener sur pouchDb, ce qui permet d'être sûr que 'revs' est à jour au moment d'appeler les listeners
		*/
		_init: function() {
			var self = this;
			var store = this._db;
			var revs = this._revs = {};
			this._ready = this._db.allDocs().then(function(resp) {
				resp.rows.forEach(function(row) {
					var id = row.id;
					var rev = row.value.rev;
					revs[id] = rev;
				});
			}, function(err) {
				console.log('error during initializing', err);
			}).then(function() {
				return store.info().then(function(info) {
					store.changes({
						since: info.update_seq, //'now',
						live: true,
						include_docs: true,
						// conflicts: true,
						returnDocs: false,
						// style: 'all',
					}).on('change', function (change) {
						var id = change.doc._id;
						var rev = change.doc._rev;
						revs[id] = rev;
						if (change.deleted) {
							// console.log('store change deleted', change);
							self._emit('change', [change.id, null]);
						} else {
							// console.log('store change create/update', change);
							self._emit('change', [id, change.doc.value]);
						}
					});
				}, function(err) {
					console.log('error during initializing', err);
				});
			});
		},
		get: function(key) {
			return this._db.get(key).then(function(doc) {
				return doc.value;
			});
		},
		set: function(key, value) {
			var self = this;
			var db = this._db;
			var revs = this._revs;
			return this._ready.then(function() {
				var rev = revs[key];
				if (value === null) {
					return db.remove(key, rev);
				}
				return db.put({value: value}, key, rev);
			}).then(function(resp) {
				// on s'assure que la notification a bien été émise avant de retourner
				// si le numéro de révision est déjà à jour c'est que la notification a été envoyée pendant ce temps
				if (resp.rev === revs[key]) {
					// console.log('notification envoyée pendant le changement', resp);
					return [key, value];
				// sinon on attend qu'elle soit émise
				// TODO: se pourrait-il qu'une autre mutation soit intervenue entre temps (via la réplication) et ait été notifiée (donc ait changé le numéro de révision) avant même que l'on éxécute ce code ? Si c'est le cas, il faudrait rechercher dans l'historique des révisions du document et résoudre le defered si il est présent
				} else {
					var dfd = new Deferred();
					var cancel = self.onChange(function(change) {
						if (change[0] === key && revs[key] === resp.rev) {
							console.info('notification envoyée APRES le changement', resp);
							cancel();
							dfd.resolve([key, value]);
						}
					});
					return dfd;
				}
			});
		},
		/**
			Renvoi des changes de la forme [key, value] où 'value' peut-être null, ce qui signifie une suppression
		*/
		onChange: function(cb) {
			return this._on('change', cb);
		},
		getAll: function() {
			return this._db.allDocs({include_docs: true}).then(function(resp) {
				var values = {};
				resp.rows.forEach(function(row) {
					var value = row.doc.value;
					var id = row.id;
					values[id] = value;
				});
				return values;
			});
		},
		destroy: function() {
			var db = this._db;
			return this._ready.then(function() {
				return db.destroy();
			});
		},
		keys: function(from, to) {
			return this._db.allDocs({startkey: from, endkey: to}).then(function(resp) {
				return resp.rows.map(function(row) {
					var id = row.id;
					return id;
				});
			});
		},
		startSync: function(remoteDb) {
			this.stopSync();
			var db = this._db;
			var opts = {live: true};
			this._replicateTo = db.replicate.to(remoteDb, opts)
				// .on('change', function(info) {
				//	console.log('replication change', info);
				// })
				// .on('uptodate', function (info) {
				//	console.log('iriscouch uptodate', info);
				// })
				.on('error', function (err) {
					console.log('replication error to remote db', err);
				})
			;
			this._replicateFrom = db.replicate.from(remoteDb, opts)
				// .on('change', function(info) {
				//	console.log('replication change', info);
				// })
				.on('uptodate', function (info) {
					console.log('local pouchDb uptodate', info);
				})
				.on('error', function (err) {
					console.log('replication error to local db', err);
				})
			;
		},
		stopSync: function() {
			this._replicateTo && this._replicateTo.cancel();
			this._replicateFrom && this._replicateFrom.cancel();
		},
		replicateTo: function(db, options) {
			return this._db.replicate.to(db, options);
		},
		replicateFrom: function(db, options) {
			return this._db.replicate.from(db, options);
		},


		// vieux code, gardé pour mémoire si on a besoin de refaire des modif mutlitples
/*		addMany: function(itemsAsDict) {
			var revs = this._revs;
			var itemsAsArray = [];
			Object.keys(itemsAsDict).forEach(function(key) {
				var doc = {
					_id: key,
					value: itemsAsDict[key],
				};
				itemsAsArray.push(doc);
			});
			return this._db.bulkDocs(itemsAsArray).then(function(resp) {
				resp.forEach(function(row) {
					revs[row.id] = row.rev;
				});
			});
		},
		changeMany: function(changes) {
			var revs = this._revs;
			var docs = changes.map(function(change) {
				if (change.operation === 'delete') {
					return {
						_id: change.id,
						_rev: revs[change.id],
						_deleted: true,
					};
				} else if (change.operation === 'create') {
					return {
						_id: change.id,
						value: change.value,
					};
				} else if (change.operation === 'update') {
					return {
						_id: change.id,
						_rev: revs[change.id],
						value: change.value,
					};
				}
			});
			return this._db.bulkDocs(docs).then(function(resp) {
				resp.forEach(function(row) {
					var id = row.id;
					var rev = row.rev;
					revs[id] = rev;
				});
			});
		},
*/
	});
});