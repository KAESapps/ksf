define([
	'intern!object',
	'intern/chai!assert',
	'../ResourcesManager',
	'../Syncable',
	"../SerializeEachProperty",
	"../SerializeOneProperty",
	"../WithItemsSync",
	"../WithResourceItems",
	"../propertyManagers/PropertyValueStore",
	"../propertyManagers/PropertyValueIsResource",
	"../propertyManagers/WithValueIsSet",
	"../propertyManagers/WithValueIsOrderableSet",
	"../propertyManagers/WithPropertyOnObservableObject",
	"../propertyManagers/WithValueFromManager",
	"../propertyManagers/WithSerialize",
	"../propertyManagers/WithSerializeOrderableSet",
	"../propertyManagers/WithItemsSerialize",
	"../propertyManagers/WithRelationSerialize",
	"../propertyManagers/WithUpdateSyncStatus",
	'ksf/collections/Dict',
	"collections/set",
	"collections/map",
	'frb/bind',
	'collections/listen/property-changes',
	'frb/observe',
	"dojo/store/Memory",
	"compose/compose",
	"dojo/Deferred",
], function(
	registerSuite,
	assert,
	Manager,
	Syncable,
	WithSerializeEachProperty,
	WithSerializeOneProperty,
	WithItemsSync,
	WithItemsFromResourceManager,
	PropertyValueStore,
	PropertyValueIsResource,
	WithValueIsSet,
	WithValueIsOrderedSet,
	WithPropertyValueBindedOnResource,
	WithValueFromManager,
	WithSerialize,
	WithSerializeOrderableSet,
	WithItemsSerialize,
	WithRelationSerialize,
	WithUpdateSyncStatus,
	Dict,
	Set,
	Map,
	bind,
	propChange,
	observe,
	Memory,
	compose,
	Deferred
) {
	// contentEqual
	function listContentEqual(a, b){
		assert.equal(a.length, b.length);
		a.forEach(function(item, index){
			assert.equal(item, b.get(index));
		});
	}


	// asyncMemory
	var AsyncMemory = compose(Memory, {
		get: compose.around(function(baseGet){
			return function(id){
				var results = baseGet.call(this, id);
				var dfd = new Deferred();
				setTimeout(function(){
					dfd.resolve(results);
				}, 20);
				return dfd;
			};
		}),
		put: compose.around(function(basePut){
			return function(item, options){
				// clone item to have the same behavior as a regular dataSource
				item = Object.clone(item);
				var results = basePut.call(this, item, options);
				var dfd = new Deferred();
				setTimeout(function(){
					dfd.resolve(results);
				}, 20);
				return dfd;
			};
		}),
	});


	// Task constructor
	var Task = compose(
		Dict,
		function Task(label, done){
			this.set('label', label || "");
			this.set('done', done);
		}, {
			_labelSetter: function(value){
				if (this.get('done')) {
					throw "Cannot change label of a closed task";
				} else {
					this._label = value;
				}
			},
			_labelGetter : function(){
				return this._label;
			},
			_doneSetter: function(value){
				this._done = !!(value);
			},
			_doneGetter: function(){
				return this._done;
			},
			toggle: function(){
				this.set('done', !(this.get('done')));
			},
		}
	);

	// Person Constructor
	var Person = compose(
		Dict,
		function Person(fullName){
			this.set('fullName', fullName || "prenom nom");
		}, {
			_fullNameGetter: function(){
				return this.get('firstName') + " " + this.get('lastName');
			},
			// just for fun
			_fullNameSetter: function(value){
				if (!(value && value.split)) {return;}
				var names = value.split(" ");
				this.set('firstName', names[0]);
				this.set('lastName', names[1]);
			},

		}
	);

	var WithValidateEachProperty = function(){
		this.validate = function(rsc){
			return Object.keys(this.propertyManagers).every(function(propName){
				var propMng = this.propertyManagers[propName];
				// si une propriété n'a pas de fonction de validaiton, sa valeur est valide par défaut
				return propMng.validate ? propMng.validate(this.getPropValue(rsc, propName)) : true;
			}.bind(this));
		};
	};

	// mixin for manager of resources of type Set
	// update a property value of items added and removed from the resources (of type Set) with a property value of the resource
	var WithItemsPropertyUpdate = function(args){
		var cancelers = new Map();
		var create = this.create;
		this.create = function(){
			var rsc = create.apply(this, arguments);
			cancelers.set(rsc, rsc.addRangeChangeListener(function(added, removed){
				added = added[0]; // on a set, there is only one item
				added && (args.itemManager.setPropValue(added, args.itemProperty, this.getPropValue(rsc, args.thisProperty)));
				removed = removed[0]; // on a set, there is only one item
				removed && (args.itemManager.setPropValue(removed, args.itemProperty, undefined));
			}.bind(this)));
			return rsc;
		};
		var destroy = this.destroy;
		this.destroy = function(rsc){
			var canceler = cancelers.get(rsc);
			canceler();
			cancelers.delete(rsc);
			destroy.apply(this, arguments);
		};
	};


	// mixin for propertyManager that does the same thing as the resourcesManager mixin "WithResourcesFromManager" but does it on every value that is set for the property, instead of doing it directly on the resource
	// is that necessary ?
	// add a create method on a value collection that is a shortcut to the create method of a manager
	// that cannot be done directly by the value since she would have to know the specified manager (which is not recommanded)
	// TODO: prevent adding items that are not know by the specified manager ?
	var PropertyManagerWithResourcesFromManager = function(args){
		var set = this.set;
		this.set = function(rsc, value){
			// remove "create" method from the current value
			var currentValue = this.get(rsc);
			if (currentValue && currentValue.create){
				delete currentValue.create;
			}
			// call original setter
			set.apply(this, arguments);
			// use getter in case the value is changed
			value = this.get(rsc);
			// add a "create" method on the new value
			value.create = function(createArgs){
				var item = args.manager.create(createArgs);
				return value.add(item);
			};
		};
	};



	var WithStringValidate = function(args){
		this.validate = function(value){
			return (typeof value === "string") && ((args && args.length) ? value.length === args.length : true);
		};
	};




// demo data
	var taskManager;
	var personManager;
	var tasksListManager;

	var setupModel = function(){
		// taskManager
		taskManager = new Manager({
			factory: {
				create: function(){
					return new Task();
				}
			},
		});
		WithValidateEachProperty.call(taskManager);

		taskManager.propertyManagers.label = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(taskManager.propertyManagers.label, {
			name: "label",
		});
		taskManager.propertyManagers.done = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(taskManager.propertyManagers.done, {
			name: "done",
		});

		WithStringValidate.call(taskManager.propertyManagers.label);
		taskManager.propertyManagers.author = new PropertyValueStore();
		taskManager.propertyManagers.assignee = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(taskManager.propertyManagers.assignee, {
			name: "assignee",
		});

		// tasksListManager
		tasksListManager = new Manager({
			factory: {
				create: function(){
					return new Set();
				}
			},
		});

		tasksListManager.propertyManagers.tasks = new PropertyValueIsResource();
		WithValueIsSet.call(tasksListManager.propertyManagers.tasks);
		tasksListManager.propertyManagers.assignee = new PropertyValueStore();

		// personManager
		personManager = new Manager({
			factory: {
				create: function(){
					return new Person();
				},
			},
		});
		personManager.propertyManagers.fullName = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.fullName, {
			name: "fullName",
		});
		personManager.propertyManagers.tasks = new PropertyValueStore();
		WithValueFromManager.call(personManager.propertyManagers.tasks, {
			manager: tasksListManager,
			getByProperty: "assignee",
		});
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.tasks, {
			name: "tasks",
		});
		personManager.propertyManagers.phones = new PropertyValueStore();
		WithValueIsOrderedSet.call(personManager.propertyManagers.phones);
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.phones, {
			name: "phones",
		});


	};
	var setupModelWithSerialisation = function(){
		setupModel();

		// personManager
		WithSerializeEachProperty.call(personManager);
		personManager.propertyManagers.syncId = new PropertyValueStore();
		WithSerialize.call(personManager.propertyManagers.fullName, {
			serializePropName: "fullName",
		});
		WithSerializeOrderableSet.call(personManager.propertyManagers.phones, {
			serializePropName: "phones",
		});

		// taskManager
		WithSerializeEachProperty.call(taskManager);
		WithSerialize.call(taskManager.propertyManagers.label, {
			serializePropName: "description",
		});
		taskManager.propertyManagers.syncId = new PropertyValueStore();
		WithRelationSerialize.call(taskManager.propertyManagers.assignee, {
			serializePropName: "personId",
			manager: personManager,
			syncIdProperty: "syncId",
		});

		// tasksListManager
		WithSerializeOneProperty.call(tasksListManager, {
			property: "tasks",
		});
		WithItemsSerialize.call(tasksListManager.propertyManagers.tasks, {
			itemSerializer: WithRelationSerialize.call({}, {
				manager: taskManager,
				syncIdProperty: "syncId",
			}),
		});
	};

	var setupModelWithSyncable = function(){
		setupModelWithSerialisation();
		// personManager
		Syncable.call(personManager);
		personManager.syncIdProperty = "syncId";
		personManager.getProperty = "syncId";
		personManager.propertyManagers.fullName.owner = personManager;
		WithUpdateSyncStatus.call(personManager.propertyManagers.fullName);
		personManager.propertyManagers.phones.owner = personManager;
		WithUpdateSyncStatus.call(personManager.propertyManagers.phones);
		personManager.propertyManagers.lastSourceData = new PropertyValueStore();
		personManager.propertyManagers.lastSourceData.owner = personManager;
		WithUpdateSyncStatus.call(personManager.propertyManagers.lastSourceData);
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.lastSourceData, {
			name: "lastSourceData",
		});
		personManager.propertyManagers.lastRequestStatus = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.lastRequestStatus, {
			name: "lastRequestStatus",
		});
		personManager.propertyManagers.inSync = new PropertyValueStore();
		WithPropertyValueBindedOnResource.call(personManager.propertyManagers.inSync, {
			name: "inSync",
		});
		personManager.dataSource = new AsyncMemory({data: [
			{
				id: "syv",
				fullName: "Sylvain Vuilliot",
				phones: ["06", "09"],
			}
		]});
		personManager.getResponse2Data = function(response){
			response = Object.clone(response);
			delete response.id;
			return response;
		};
		personManager.putResponse2Id = function(response){
			return response; // dojo memory store only responds with id
		};
		personManager.putResponse2Data = function(response){
			return; // dojo memory store only responds with id
		};
		// taskManager
		Syncable.call(taskManager);
		taskManager.syncIdProperty = "syncId";
		taskManager.propertyManagers.label.owner = taskManager;
		WithUpdateSyncStatus.call(taskManager.propertyManagers.label);
		taskManager.propertyManagers.lastSourceData = new PropertyValueStore();
		taskManager.propertyManagers.lastSourceData.owner = taskManager;
		WithUpdateSyncStatus.call(taskManager.propertyManagers.lastSourceData);
		taskManager.propertyManagers.inSync = new PropertyValueStore();
		taskManager.propertyManagers.lastRequestStatus = new PropertyValueStore();
		// tasksListManager
		Syncable.call(tasksListManager);
		tasksListManager.propertyManagers.lastSourceData = new PropertyValueStore();
		tasksListManager.propertyManagers.lastSourceData.owner = tasksListManager;
		WithUpdateSyncStatus.call(tasksListManager.propertyManagers.lastSourceData);
		tasksListManager.propertyManagers.inSync = new PropertyValueStore();
		tasksListManager.propertyManagers.lastRequestStatus = new PropertyValueStore();
		tasksListManager.getSyncId = function(rsc){
			return personManager.getPropValue(this.getPropValue(rsc, "assignee"), "syncId");
		};
		tasksListManager.dataSource = new AsyncMemory({data: [
			{
				id: "syv",
				tasks: [
					{id: "1", description: "Faire les courses"},
					{id: "2", description: "Faire le ménage"},
				],
			}
		]});
		tasksListManager.getResponse2Data = function(response){
			return response.tasks.map(function(task){
				return task.id;
			});
		};
		tasksListManager.putResponse2Id = function(response){
			return response.id;
		};
		tasksListManager.putResponse2Data = function(response){
		};
	};

	registerSuite({
		name: "local resources management",
		"beforeEach": setupModel,
		"create resource": function(){
			var maTache = taskManager.create({});
			assert(taskManager.has(maTache));
		},
		"set and get value stored on manager": function(){
			var maTache = taskManager.create();
			taskManager.setPropValue(maTache, "author", "Sylvain");
			assert.equal(taskManager.getPropValue(maTache, "author"), "Sylvain");
		},
		"set and get value synced on resource": function(){
			var maTache = taskManager.create();
			assert.equal(maTache.get('done'), false); // this is the default value for this business object
			assert.equal(taskManager.getPropValue(maTache, "done"), false);
			taskManager.setPropValue(maTache, "done", true);
			assert.equal(maTache.get('done'), true);
			assert.equal(taskManager.getPropValue(maTache, "done"), true);
			maTache.set('done', false);
			assert.equal(taskManager.getPropValue(maTache, "done"), false);
		},
		"set and get orderedSet value": function(){
			var syv = personManager.create({
				fullName : "Sylvain Vuilliot",
				phones: ["06", "09"],
			});
			listContentEqual(personManager.getPropValue(syv, "phones"), ["06", "09"]);
			listContentEqual(syv.get('phones'), ["06", "09"]);
		},
		"set and get value of a 'fromManager' property (auto populated and read-only)": function(){
			var syv = personManager.create({fullName : "Sylvain Vuilliot"});
			assert.equal(personManager.getPropValue(syv, "tasks"), tasksListManager.getBy("assignee", syv));
			assert.equal(syv.get('tasks'), tasksListManager.getBy("assignee", syv));
			syv.set('tasks', "bidon");
			personManager.setPropValue(syv, "tasks", "bindon");
			assert.equal(personManager.getPropValue(syv, "tasks"), tasksListManager.getBy("assignee", syv));
			assert.equal(syv.get('tasks'), tasksListManager.getBy("assignee", syv));
		},
		"set and get value of a 'isResource' property (read-only)": function(){
			var maListeDeTaches = tasksListManager.create({
				tasks: ["Faire les courses", "Faire le ménage"],
			});
			// maListeDeTaches.addEach(["Faire les courses", "Faire le ménage"]);
			assert.equal(tasksListManager.getPropValue(maListeDeTaches, "tasks"), maListeDeTaches);
			assert(maListeDeTaches.length === 2 && maListeDeTaches.has("Faire les courses") && maListeDeTaches.has("Faire le ménage"));
			tasksListManager.setPropValue(maListeDeTaches, "tasks", ["Faire à manger"]);
			// the value of the 'tasks' property for this resource has not been changed
			assert.equal(tasksListManager.getPropValue(maListeDeTaches, "tasks"), maListeDeTaches);
			// ... only its content has changed
			assert(maListeDeTaches.length === 1 && maListeDeTaches.has("Faire à manger"));
			assert.deepEqual(tasksListManager.getPropValue(maListeDeTaches, "tasks").toArray(), ["Faire à manger"]);
			// attention ici, on ne "set" pas une nouvelle valeur pour la propriété "tasks" mais on la modifie simplement : la valeur de "tasks" ne change pas, c'est le contenu de la valeur qui change
			maListeDeTaches.add("Réparer la porte");
			assert.deepEqual(tasksListManager.getPropValue(maListeDeTaches, "tasks").toArray(), ["Faire à manger", "Réparer la porte"]);
		},
		"validation": function(){
			var maTache = taskManager.create();
			maTache.set('label', "Faire le ménage");
			assert(taskManager.validate(maTache));
			maTache.set('label', 5);
			assert(!taskManager.validate(maTache));
		},
		"getBy": function(){
			taskManager.propertyManagers.syncId = new PropertyValueStore();
			var maTache = taskManager.create({syncId: "1"});
			assert.equal(taskManager.getBy("syncId", "1"), maTache);
		},

	});
	registerSuite({
		name: "serialize",
		beforeEach: setupModelWithSerialisation,
		"serialize person": function(){
			var syv = personManager.create();
			syv.set('fullName', "Sylvain Vuilliot");
			syv.get('phones').add("09");
			syv.get('phones').add("06", 0);
			assert.deepEqual(personManager.serialize(syv), {
				fullName: "Sylvain Vuilliot",
				phones: ["06", "09"],
			});
		},
		"serialize task": function(){
			var syv = personManager.create({
				syncId: "S",
				fullName: "Sylvain Vuilliot",
			});
			var maTache = taskManager.create({
				syncId: "1",
				label: "Faire les courses",
				assignee: syv,
			});
			assert.deepEqual(taskManager.serialize(maTache), {
				description: "Faire les courses",
				personId: "S",
			});
		},
		"deserialize relations": function(){
			personManager.propertyManagers.wife = new PropertyValueStore();
			WithPropertyValueBindedOnResource.call(personManager.propertyManagers.wife, {
				name: "wife",
			});
			WithRelationSerialize.call(personManager.propertyManagers.wife, {
				serializePropName: "wifeId",
				manager: personManager,
				syncIdProperty: "syncId",
			});
			var maTache = taskManager.create();
			taskManager.deserialize(maTache, {
				description: "Faire les courses",
				personId: "S",
			});
			assert.equal(maTache.get('label'), "Faire les courses");
			assert.equal(maTache.get('assignee'), personManager.getBy("syncId", "S"));
			personManager.deserialize(maTache.get('assignee'), {
				fullName: "Sylvain Vuilliot",
				wifeId: "A",
			});
			assert.equal(maTache.get('assignee').get('firstName'), "Sylvain");
			assert.equal(maTache.get('assignee').get('wife'), personManager.getBy("syncId", "A"));
		},
		"serialize relation with a resource without id": function(){
			// est-ce que le serializer doit faire une erreur ou bien laisser undefined ?
			var syv = personManager.create({
				fullName: "Sylvain Vuilliot",
			});
			var maTache = taskManager.create({
				syncId: "1",
				label: "Faire les courses",
				assignee: syv,
			});
			assert.deepEqual(taskManager.serialize(maTache), {
				description: "Faire les courses",
				personId: undefined,
			});
		},
		"serialize a Set of resources": function(){
			var maTache = taskManager.create({
				syncId: "1",
				label: "Faire les courses",
			});
			var monAutreTache = taskManager.create({
				syncId: "2",
				label: "Faire le ménage",
			});
			var maListeDeTaches = tasksListManager.create();
			maListeDeTaches.addEach([maTache, monAutreTache]);
			assert.deepEqual(tasksListManager.serialize(maListeDeTaches), ["1", "2"]);
		},
		"deserialize a Set of resources": function(){
			var maListeDeTaches = tasksListManager.create({
				tasks: ["Faire ci", "Faire ça"],
			});
			tasksListManager.deserialize(maListeDeTaches, ["1", "2"]);
			assert.deepEqual(maListeDeTaches.toArray(), [
				taskManager.getBy("syncId", "1"),
				taskManager.getBy("syncId", "2"),
			]);
		},
	});

	function assertEqualNow(date){
		assert(Date.now() - date.getTime() < 1000);
	}

	registerSuite({
		name: "syncable",
		beforeEach: setupModelWithSyncable,
		"lastSourceData": function(){
			var syv = personManager.create({
				syncId: "syv",
			});
			assert.equal(personManager.getPropValue(syv, "lastSourceData"), undefined);
			return syv.pull().then(function(){
				assert.deepEqual(personManager.getPropValue(syv, "lastSourceData").data, {
					fullName: "Sylvain Vuilliot",
					phones: ["06", "09"],
				});
				var lastSourceDataTime = personManager.getPropValue(syv, "lastSourceData").time;
				assertEqualNow(lastSourceDataTime);
			});
		},
		"observable lastSourceDataTime": function(args){
			var observedValue;
			var syv = personManager.create({
				syncId: "syv",
			});
			assert.equal(syv.lastSourceData, undefined);
			syv.getR("lastSourceData").map('.time').onValue(function(value){
				observedValue = value;
			});
			return syv.fetch().then(function(){
				assertEqualNow(syv.get('lastSourceData').time);
				assertEqualNow(observedValue);
			});
		},
		"syncStatus": function(){
			var syv = personManager.create({
				fullName: "Sylvain Vuilliot",
				phones: ["06", "09"],
			});
			assert.equal(personManager.getPropValue(syv, "inSync"), false);
			personManager.setPropValue(syv, "lastSourceData", {data:{
				fullName: "Sylvain Vuilliot",
				phones: ["06", "09"],
			}});
			assert.equal(personManager.getPropValue(syv, "inSync"), true);
			personManager.setPropValue(syv, "fullName", "syv");
			assert.equal(personManager.getPropValue(syv, "inSync"), false);
		},
		"observable syncStatus": function(){
			var inSyncObservedValue;
			var binded = new Dict();
			var syv = personManager.create({
				fullName: "Sylvain Vuilliot",
			});
			assert.equal(syv.get('inSync'), false);
			binded.setR("inSync", syv.getR('inSync'));
			assert.equal(binded.get('inSync'), false);
			syv.getR("inSync").onValue(function(value){
				inSyncObservedValue = value;
			});
			personManager.setPropValue(syv, "lastSourceData", {data:{
				fullName: "Sylvain Vuilliot",
				phones: [],
			}});
			assert.equal(syv.get('inSync'), true);
			assert.equal(binded.get('inSync'), true);
			assert.equal(inSyncObservedValue, true);
			inSyncObservedValue = undefined;
			personManager.setPropValue(syv, "fullName", "syv");
			assert.equal(syv.get('inSync'), false);
			assert.equal(inSyncObservedValue, false);
			assert.equal(binded.get('inSync'), false);
		},
		"syncStatus refreshed only once on merge": function(){
			var syv = personManager.create();
			personManager.setPropValue(syv, "lastSourceData", {data:{
				fullName: "Sylvain Vuilliot",
				phones: ["06", "09"],
			}});
			var isInSync = personManager.isInSync;
			personManager.isInSync = function(){
				isInSyncCallCount++;
				return isInSync.apply(this, arguments);
			};
			var isInSyncCallCount = 0;
			assert.equal(syv.get('inSync'), false);
			personManager.merge(syv);
			assert.equal(personManager.getPropValue(syv, "inSync"), true);
			assert.equal(isInSyncCallCount, 1);
		},
		"lastRequestStatus": function(){
			var syv = personManager.create({
				syncId: "syv",
			});
			assert.equal(personManager.getPropValue(syv, "lastRequestStatus"), undefined);
			var pullReturn = syv.pull();
			var status = personManager.getPropValue(syv, "lastRequestStatus");
			assert.equal(status.get('type'), "get");
			assert.equal(status.get('stage'), "inProgress");
			assertEqualNow(status.get('started'));
			return pullReturn.then(function(){
				assert.equal(status.get('stage'), "success");
				assertEqualNow(status.get('finished'));
			});
		},
		"observable requestStatus": function(){
			var observedValue;
			var syv = personManager.create({
				syncId: "syv",
			});
			syv.getR("lastRequestStatus", "stage").onValue(function(value){
				observedValue = value;
			});
			assert.equal(syv.get('lastRequestStatus'), undefined);

			var fetchReturn = syv.fetch();
			assert.equal(syv.get('lastRequestStatus').get('stage'), "inProgress");
			assert.equal(observedValue, "inProgress");
			observedValue = undefined;

			return fetchReturn.then(function(){
				assert.equal(syv.get('lastRequestStatus').get('stage'), "success");
				assert.equal(observedValue, "success");
			});
		},
		"lastRequestStatus update with concurent requests": function(){
			var syv = personManager.create({
				syncId: "syv",
			});
			assert.equal(personManager.getPropValue(syv, "lastRequestStatus"), undefined);
			var pullReturn = syv.pull();
			var pullStatus = personManager.getPropValue(syv, "lastRequestStatus");
			assert.equal(pullStatus.get('type'), "get");
			assert.equal(pullStatus.get('stage'), "inProgress");
			var pushReturn = syv.push();
			var pushStatus = personManager.getPropValue(syv, "lastRequestStatus"); // the lastResquestStatus is the pushStatus
			assert(pullStatus !== pushStatus);
			assert.equal(pushStatus.get('type'), "put");
			assert.equal(pushStatus.get('stage'), "inProgress");
			return pullReturn.then(function(){
				assert.equal(personManager.getPropValue(syv, "lastRequestStatus"), pushStatus); // the lastResquestStatus is the pushStatus
				assert.equal(pullStatus.get('stage'), "success");
				return pushReturn.then(function(){
					assert.equal(personManager.getPropValue(syv, "lastRequestStatus"), pushStatus); // the lastResquestStatus is the pushStatus
					assert.equal(pushStatus.get('stage'), "success");
				});
			});
		},
		"pull remote data": function(){
			var syv = personManager.create({syncId: "syv"});
			return syv.get('tasks').pull().then(function(){
				assert.equal(syv.get('tasks').length, 2);
				assert.deepEqual(syv.get('tasks').map(function(task){
					return taskManager.getPropValue(task, "syncId");
				}), ["1", "2"]);
			});
		},
		"push resource to dataSource": function(){
			var syv = personManager.create({
				syncId: "syv",
			});
			syv.set('fullName', "Syv Vuil");
			assert.equal(syv.get('inSync'), false);
			return syv.push().then(function(){
				assert.deepEqual(personManager.dataSource.data[0], {
					id: "syv",
					fullName: "Syv Vuil",
					phones: [],
				});
				return syv.fetch().then(function(){
					assert.equal(syv.get('inSync'), true);
				});
			});
		},
		"update syncId of created resource": function(){
			var syv = personManager.create({
				fullName: "Syv Vuil",
			});
			assert.equal(syv.get('inSync'), false);
			return syv.push().then(function(){
				assert.equal(personManager.dataSource.data[1].fullName, "Syv Vuil");
				var syncId = personManager.dataSource.data[1].id;
				assert(syncId !== undefined); // be sure that an id has been assigned by the dataSource
				assert.equal(syv.get('inSync'), true);
				assert.equal(personManager.getPropValue(syv, "syncId"), syncId);
			});
		},
		"reverting to server state": function () {
			var syv = personManager.create({
				syncId: "syv",
			});
			return syv.pull().then(function(){
				assert.equal(syv.get('inSync'), true);
				syv.set('fullName', "Titi Parisien");
				assert.equal(syv.get('inSync'), false);
				syv.merge();
				assert.equal(syv.get('firstName'), "Sylvain");
				assert.equal(syv.get('inSync'), true);
			});
		},

	});


	registerSuite({
		name: "one to many relation for acuicité",
		beforeEach: function(){
			setupModelWithSyncable();

			// tasksListManager
			WithItemsFromResourceManager.call(tasksListManager, {
				manager: taskManager,
			});
			WithItemsPropertyUpdate.call(tasksListManager, {
				itemManager: taskManager,
				itemProperty: "assignee",
				thisProperty: "assignee",
			});
			WithItemsSync.call(tasksListManager, {
				propName: "tasks",
				itemManager: taskManager,
				getResponse2Items: function(response){
					return response.tasks;
				},
				item2id: function(item){
					return item.id;
				},
				item2data: function(item){
					var data = Object.clone(item);
					delete data.id;
					return data;
				},
			});
		},
		"person with tasks": function(){
			var syv = personManager.create({
				fullName: "Sylvain Vuilliot",
			});
			assert(tasksListManager.getPropValue(syv.get('tasks'), "assignee"), syv);
			var courses = taskManager.create({
				label: "Faire les courses",
			});
			syv.get('tasks').add(courses);
			assert(syv.get('tasks').has(courses));
			assert.equal(courses.get('assignee'), syv);
			syv.get('tasks').delete(courses);
			assert.equal(courses.get('assignee'), undefined);
		},
		"create tasks via tasksList": function(){
			var syv = personManager.create({
				fullName: "Sylvain Vuilliot",
			});
			var task = syv.get('tasks').create({
				label: "Faire le ménage",
			});
			assert.equal(task.get('label'), "Faire le ménage");
			assert.equal(task.get('assignee'), syv);
			assert.equal(syv.get('tasks').length, 1);
			assert(syv.get('tasks').has(task));
		},
		"pull remote data": function(){
			var syv = personManager.create({syncId: "syv"});
			return syv.get('tasks').pull().then(function(){
				assert.equal(syv.get('tasks').length, 2);
				assert.deepEqual(syv.get('tasks').map(function(task){
					return taskManager.getPropValue(task, "syncId");
				}), ["1", "2"]);
				syv.get('tasks').forEach(function(task){
					assert(taskManager.has(task));
					assert.equal(task.get('assignee'), syv);
				});
			});
		},
		"update tasks data by updating tasksList data": function(){
			var syv = personManager.create({syncId: "syv"});
			return syv.get('tasks').pull().then(function(){
				assert.deepEqual(syv.get('tasks').map(function(task){
					return task.get('label');
				}), ["Faire les courses", "Faire le ménage"]);
			});
		},
	});

});