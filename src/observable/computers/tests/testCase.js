define([
	'intern!object',
	'intern/chai!assert',
	'compose',
], function(
	registerSuite,
	assert,
	compose
){

	var Value = compose({
		computeChanges: function(changeArg) {
			return changeArg;
		},
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
	});

/*	var PatchableValue = compose(function(decorated) {
		this._decorated = decorated;
	}, {
		computeChanges: function(changeArg, initValue) {
			if (changeArg.set) {
				return changeArg;
			}
			if (changeArg.patch) {
				return {
					patched: this._decorated.computeChanges(changeArg.patch, initValue),
				};
			}
		},
		computeValue: function(changeArg, initValue) {
			if (changeArg.set) {
				return changeArg.set;
			}
			if (changeArg.patch) {
				return this._decorated.computeValue(changeArg.patch, initValue);
			}
		},
	});
*/
	var PropertyObject = compose(function(properties) {
		this._properties = properties;
	}, {
		computeChanges: function(changeArg, initValue) {
			var ret = {};
			Object.keys(changeArg).forEach(function(key) {
				var propChangeArg = changeArg[key];
				if (propChangeArg.value) {
					ret[key] = propChangeArg;
				}
				if (propChangeArg.change) {
					var property = this._properties[key];
					ret[key] = {
						changed: property.computeChanges(propChangeArg.change, initValue[key]),
					};
				}
			}.bind(this));
			return ret;
		},
		computeValue: function(changeArg, initValue) {
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var propChangeArg = changeArg[key];
				if (propChangeArg.value) {
					value[key] = propChangeArg.value;
				}
				if (propChangeArg.change) {
					var property = this._properties[key];
					value[key] = property.computeValue(propChangeArg.change, initValue[key]);
				}
			}.bind(this));
			return value;
		},
	});

	function identity (a) { return a;}

	var Array = compose(function(item) {
		this._item = item;
	}, {
		computeChanges: function(changeArg, initValue) {
			var self = this;
			var ret = {};
			if (changeArg.add) {
				ret.added = {};
				Object.keys(changeArg.add).forEach(function(index) {
					ret.added[index] = changeArg.add[index];
				});
			}
			if (changeArg.remove) {
				ret.removed = {};
				Object.keys(changeArg.remove).forEach(function(index) {
					ret.removed[index] = true;
				});
			}
			if (changeArg.change) {
				ret.changed = {};
				Object.keys(changeArg.change).forEach(function(index) {
					var changeAtIndex = changeArg.change[index];
					if (changeAtIndex.value) {
						ret.changed[index] = changeAtIndex;
					} else if (changeAtIndex.change) {
						ret.changed[index] = {
							changed: self._item.computeChanges(changeAtIndex.change, initValue[index]),
						};
					}
				});
			}
			return ret;
		},
		computeValue: function(changeArg, initValue) {
			var self = this;
			var value = initValue;
			if (changeArg.change) {
				Object.keys(changeArg.change).forEach(function(index) {
					var changeAtIndex = changeArg.change[index];
					if (changeAtIndex.value) {
						value[index] = changeAtIndex.value;
					} else if (changeAtIndex.change) {
						value[index] = self._item.computeValue(changeAtIndex.change, initValue[index]);
					}
				});
			}
			if (changeArg.remove) {
				Object.keys(changeArg.remove).forEach(function(index) {
					delete value[index];
				});
			}
			if (changeArg.add) {
				Object.keys(changeArg.add).forEach(function(index) {
					value.splice(index, 0, changeArg.add[index]);
				});
			}
			return value;
		},
	});


	var restSite = new PropertyObject({
		dataTime: new Value("toto"),
		lastRequestStatus: new PropertyObject({
			started: new Value(),
			finished: new Value(),
			stage: new Value(),
		}),
		data: new PropertyObject({
			nom: new Value(),
			docs: new Array(new Value()),
		}),
	});

	// la logique du computer 'object' est de permettre d'ajouter ou d'enlever des clés, ainsi que de changer les valeurs affectées aux clés, soit complètement soit incrémentalement (et c'est là la différence avec un simple Dict, c'est que la valeur d'un "object" peut être 'deep')
/*	var restSite = new Object({
		properties: {
			dataTime: {
				value: new Value(),
				required: false,
			},
			lastRequestStatus: {
				value: new PropertyObject({
					started: new Value(),
					finished: new Value(),
					stage: new Value(),
				})),
				required :false,
			},
			data: {
				value: new PropertyObject({
					nom: new Value(),
					docs: new Array(new Value()),
				}),
			},
		},
		additionalProperties: true,
	});
*/
	registerSuite({
		// TODO:
/*		'init value': function() {
			var changeArg = {
				set: {
					dataTime: "dataTime",
					data: {
						set: {
							nom: 'nom',
							docs: [],
						},
					},
					lastRequestStatus: undefined,
				}
			};
			var changes = restSite.computeChanges(changeArg);
			var value = restSite.computeValue(changeArg);

			assert.deepEqual(value, {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: undefined,
			});
			assert.deepEqual(changes, {
				set: {
					dataTime: "dataTime",
					data: {
						nom: 'nom',
						docs: [],
					},
					lastRequestStatus: undefined,
				}
			});

		},
*/
		'change dataTime': function() {
			var changeArg = {
				dataTime: {
					value: 'newDataTimeValue',
				},
			};
			var initValue = {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: undefined,
			};

			var changes = restSite.computeChanges(changeArg, initValue);
			var value = restSite.computeValue(changeArg, initValue);

			assert.deepEqual(changes, {
				dataTime: {
					value: 'newDataTimeValue',
				}
			});
			assert.deepEqual(value, {
				dataTime: "newDataTimeValue",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: undefined,
			});
		},
		'change lastRequestStatus completely': function() {
			var changeArg = {
				lastRequestStatus: {
					value: {
						started: "started",
						finished: "finished",
						stage: 'stage',
					},
				}
			};
			var initValue = {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: undefined,
			};

			var changes = restSite.computeChanges(changeArg, initValue);
			var value = restSite.computeValue(changeArg, initValue);

			assert.deepEqual(changes, {
				lastRequestStatus: {
					value: {
						started: "started",
						finished: "finished",
						stage: 'stage',
					},
				}
			});
			assert.deepEqual(value, {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: {
					started: "started",
					finished: "finished",
					stage: 'stage',
				},
			});
		},
		'patch lastRequestStatus': function() {
			var changeArg = {
				lastRequestStatus: {
					change: {
						finished: {value: 'finished'},
						stage: {value: "success"},
					}
				},
			};
			var initValue = {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: {
					started: 'started',
					finished: undefined,
					stage: 'inProgress',
				},
			};

			var changes = restSite.computeChanges(changeArg, initValue);
			var value = restSite.computeValue(changeArg, initValue);

			assert.deepEqual(changes, {
				lastRequestStatus: {
					changed: {
						finished: {value: 'finished'},
						stage: {value: 'success'},
					}
				},
			});
			assert.deepEqual(value, {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: {
					started: 'started',
					finished: 'finished',
					stage: 'success',
				},
			});
		},
		'add one doc': function() {
			var changeArg = {
				data: {
					change: {
						docs: {
							change: {
								add: {
									0: 'un',
								},
							}
						},
					}
				}
			};
			var initValue = {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: [],
				},
				lastRequestStatus: undefined,
			};

			var changes = restSite.computeChanges(changeArg, initValue);
			var value = restSite.computeValue(changeArg, initValue);

			assert.deepEqual(changes, {
				data: {
					changed: {
						docs: {
							changed: {
								added: {
									0: 'un',
								},
							}
						},
					}
				}
			});
			assert.deepEqual(value, {
				dataTime: "dataTime",
				data: {
					nom: 'nom',
					docs: ["un"],
				},
				lastRequestStatus: undefined,
			});
		},

	});

	var site = new PropertyObject({
		name: new Value(),
		docs: new Array(new PropertyObject({
			title: new Value(),
			body: new Value(),
		})),
	});

	registerSuite({
		name: 'array',
		'replace one doc completely': function() {
			var initValue = {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
				],
			};
			var changeArg = {
				docs: {
					change: {
						change: {
							0: {value: {title: 'doc 2', body: 'body of doc 2'}},
						}
					}
				},
			};

			var changes = site.computeChanges(changeArg, initValue);
			var value = site.computeValue(changeArg, initValue);
			assert.deepEqual(changes, {
				docs: {
					changed: {
						changed: {
							0: {
								value: {title: 'doc 2', body: 'body of doc 2'},
							}
						}
					}
				}
			});
			assert.deepEqual(value, {
				name: 'site 1',
				docs: [
					{title: 'doc 2', body: 'body of doc 2'},
				],
			});
		},
		'patch one doc': function() {
			var initValue = {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
				],
			};
			var changeArg = {
				docs: {
					change: {
						change: {
							0: {
								change: {
									title: {
										value: 'new doc 1 title'
									}
								}
							}
						}
					}
				},
			};

			var changes = site.computeChanges(changeArg, initValue);
			var value = site.computeValue(changeArg, initValue);
			assert.deepEqual(changes, {
				docs: {
					changed: {
						changed: {
							0: {
								changed: {
									title: {
										value: 'new doc 1 title'
									}
								}
							}
						}
					}
				},
			});
			assert.deepEqual(value, {
				name: 'site 1',
				docs: [
					{title: 'new doc 1 title', body: 'body of doc 1'},
				],
			});
		},
		'insert one doc': function() {
			var initValue = {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
					{title: 'doc 2', body: 'body of doc 2'},
					{title: 'doc 3', body: 'body of doc 3'},
				],
			};
			var changeArg = {
				docs: {
					change: {
						add: {
							2: {title: 'doc 4', body: 'body of doc 4'},
						}
					}
				},
			};

			var changes = site.computeChanges(changeArg, initValue);
			var value = site.computeValue(changeArg, initValue);
			assert.deepEqual(changes, {
				docs: {
					changed: {
						added: {
							2:  {title: 'doc 4', body: 'body of doc 4'}
						}
					}
				}
			});
			assert.deepEqual(value, {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
					{title: 'doc 2', body: 'body of doc 2'},
					{title: 'doc 4', body: 'body of doc 4'},
					{title: 'doc 3', body: 'body of doc 3'},
				],
			});
		},
		'remove one doc': function() {
			var initValue = {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
					{title: 'doc 2', body: 'body of doc 2'},
					{title: 'doc 3', body: 'body of doc 3'},
				],
			};
			var changeArg = {
				docs: {
					change: {
						remove: {
							2: true,
						}
					}
				},
			};

			var changes = site.computeChanges(changeArg, initValue);
			var value = site.computeValue(changeArg, initValue);
			assert.deepEqual(changes, {
				docs: {
					changed: {
						removed: {
							2:  true
						}
					}
				}
			});
			assert.deepEqual(value, {
				name: 'site 1',
				docs: [
					{title: 'doc 1', body: 'body of doc 1'},
					{title: 'doc 2', body: 'body of doc 2'},
				],
			});
		},

	});
});

