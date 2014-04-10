define([
	'intern!object',
	'intern/chai!assert',
	'../PropertyObject',
	'../Value',
	'../Array',

], function(
	registerSuite,
	assert,
	PropertyObject,
	Value,
	Array
){




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

			var value = restSite.computeValue(changeArg, initValue);

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

			var value = restSite.computeValue(changeArg, initValue);

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

			var value = restSite.computeValue(changeArg, initValue);

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

			var value = restSite.computeValue(changeArg, initValue);

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

			var value = site.computeValue(changeArg, initValue);
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

			var value = site.computeValue(changeArg, initValue);
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

			var value = site.computeValue(changeArg, initValue);
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

			var value = site.computeValue(changeArg, initValue);
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

