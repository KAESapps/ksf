define([
	'pouchdb/dist/pouchdb-2.2.3.min',
], function(
	PouchDb
){
	var store = window.store = new PouchDb('messenger');

	var messenger = window.messenger = {
		_store: store,
		_messageId2Element: {},
		send: function(user, message, id, rev) {
			console.time('new message');
			this._store.put({
				user: user,
				message: message
			}, id || new Date().toISOString(), rev).then(function(info) {
				console.log('message stored', info);
			}, function(err) {
				console.log('error storing message', err);
			});
		},
		delete: function(id, rev) {
			this._store.remove(id, rev).then(function(info) {
				console.log('message removed', info);
			}, function(err) {
				console.log('error removing message', err);
			});
		},
		startSync: function() {
			this.stopSync();
			var db = this._store;
			var opts = {live: true};
			var remoteCouch = 'https://kaes.iriscouch.com:6984/messenger';
			this._replicateTo = db.replicate.to(remoteCouch, opts)
				// .on('change', function(info) {
				//	console.log('replication change', info);
				// })
				// .on('uptodate', function (info) {
				//	console.log('iriscouch uptodate', info);
				// })
				.on('error', function (err) {
					console.log('replication error to iriscouch', err);
				})
			;
			this._replicateFrom = db.replicate.from(remoteCouch, opts)
				// .on('change', function(info) {
				//	console.log('replication change', info);
				// })
				.on('uptodate', function (info) {
					console.log('local pouchDb uptodate', info);
				})
				.on('error', function (err) {
					console.log('replication error to local pouchDb', err);
				})
			;
		},
		stopSync: function() {
			this._replicateTo && this._replicateTo.cancel();
			this._replicateFrom && this._replicateFrom.cancel();
		},
		displayMessages: function() {
			var self = this;
			this.displayStoredMessages().then(function() {
				self.updateMessages();
			});
		},
		displayStoredMessages: function() {
			var self = this;
			return this._store.allDocs({
				include_docs: true,
				conflicts: true,
			}).then(function(resp) {
				resp.rows.forEach(function(row) {
					self.displayMessage({
						id: row.id,
						rev: row.value.rev,
						user: row.doc.user,
						message: row.doc.message,
						conflicts: row.doc._conflicts,
					});
				});
			});
		},
		updateMessages: function() {
			var self = this;
			var store = this._store;
			store.info(function(err, info) {
				store.changes({
					since: info.update_seq, //'now',
					live: true,
					include_docs: true,
					conflicts: true,
					returnDocs: false,
					// style: 'all',
				}).on('change', function (change) {
					if (change.doc._conflicts) {
						console.warn('change with conflict');
					}
					if (change.deleted) {
						console.log('store change deleted', change);
						self.removeMessage(change.id);
					} else {
						console.log('store change create/update', change);
						self.upsertMessage({
							id: change.doc._id,
							rev: change.doc._rev,
							user: change.doc.user,
							message: change.doc.message,
							conflicts: change.doc._conflicts,
						});
					}
				});
/*				}).on('create', function(change) {
					console.log('store change create', change);
					self.displayMessage({
						id: change.id,
						rev: change.changes[0].rev,
						user: change.doc.user,
						message: change.doc.message,
						conflicts: change.doc._conflicts,
					});
				}).on('delete', function(change) {
					console.log('store change delete', change);
					self.removeMessage(change.id);
				}).on('update', function(change) {
					console.log('store change update', change);
					self.updateMessage(change.id, {
						rev: change.changes[0].rev,
						user: change.doc.user,
						message: change.doc.message,
						conflicts: change.doc._conflicts,
					});
				});
*/			});
		},
		upsertMessage: function(msg) {
			// upsertMessage doit savoir créer ou mettre à jour un message car on n'a pas d'info dans la notification
			var container = this._messageId2Element[msg.id];
			if (container) {
				this.updateMessage(msg);
			} else {
				this.displayMessage(msg);
			}
			console.timeEnd('new message');

		},
		displayMessage: function(msg) {
			var self = this;
			var container = document.createElement('div');
			container.style.backgroundColor='lightblue';
			container.style.margin = '10px';
			messagesContainer.insertBefore(container, messagesContainer.children[0]);
			this._messageId2Element[msg.id] = container;

			var id = document.createElement('div');
			id.textContent = msg.id;
			container.appendChild(id);

			var rev = document.createElement('div');
			rev.textContent = msg.rev;
			container.appendChild(rev);

			var user = document.createElement('div');
			user.textContent = msg.user;
			container.appendChild(user);

			var message = document.createElement('input');
			message.value = msg.message;
			container.appendChild(message);
			message.onchange = function() {
				self.send(msg.user, message.value, msg.id, msg.rev);
			};

			var deleteButton = document.createElement('button');
			deleteButton.innerHTML = "Supprimer";
			deleteButton.onclick = function() {
				self.delete(msg.id, msg.rev);
			};
			container.appendChild(deleteButton);

			var conflicts = document.createElement('div');
			conflicts.textContent = msg.conflicts;
			container.appendChild(conflicts);

		},
		removeMessage: function(id) {
			// removeMessage doit être tolérant car on peut lui demander de supprimer un message qui n'a jamais été affiché
			var el = this._messageId2Element[id];
			el && messagesContainer.removeChild(el);
			delete this._messageId2Element[id];
		},
		updateMessage: function(msg) {
			var self = this;
			var el = this._messageId2Element[msg.id];

			var rev = el.children[1];
			rev.textContent = msg.rev;

			var user = el.children[2];
			user.textContent = msg.user;

			var message = el.children[3];
			message.value = msg.message;
			message.onchange = function() {
				self.send(msg.user, message.value, msg.id, msg.rev);
			};

			var deleteButton = el.children[4];
			deleteButton.onclick = function() {
				self.delete(msg.id, msg.rev);
			};

			var conflicts = el.children[4];
			conflicts.textContent = msg.conflicts;

		},

	};

	var form = document.createElement('form');
	var userLabel = document.createElement('label');
	var userLabelText = document.createElement('span');
	userLabelText.textContent = 'Nom : ';
	var user = document.createElement('input');
	userLabel.appendChild(userLabelText);
	userLabel.appendChild(user);
	var messageLabel = document.createElement('label');
	var messageLabelText = document.createElement('span');
	messageLabelText.textContent = 'Message : ';
	var message = document.createElement('input');
	messageLabel.appendChild(messageLabelText);
	messageLabel.appendChild(message);
	var submit = document.createElement('input');
	submit.type = 'submit';
	form.appendChild(userLabel);
	form.appendChild(messageLabel);
	form.appendChild(submit);

	form.addEventListener('submit', function(ev) {
		ev.preventDefault();
		messenger.send(user.value, message.value);
		user.value = '';
		message.value = '';
	});

	document.body.appendChild(form);

	var messagesContainer = document.createElement('div');
	document.body.appendChild(messagesContainer);

	messenger.displayMessages();
});