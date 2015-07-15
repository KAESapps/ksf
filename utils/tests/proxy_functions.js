import proxy from '../proxyFunctions';

function PersonProxy(person) {
    this.person = person;
}
proxy.prop(PersonProxy.prototype, "person", "name");
proxy.methods(PersonProxy.prototype, "person", ["echo", "getName", "setName"]);


syv = {
    name: "Sylvain",
    echo: function() {
        return arguments[0];
    },
    getName: function() {
        return this.name;
    },
    setName: function(name) {
        this.name = "My name is " + name;
    }
};

wrappedSyv = new PersonProxy(syv);

// get test
console.assert(wrappedSyv.name === "Sylvain");
// method call test
console.assert(wrappedSyv.echo("test") === "test");
// getter/reader test
console.assert(wrappedSyv.getName() === "Sylvain");
// set test
wrappedSyv.name = "toto";
console.assert(wrappedSyv.name === "toto");
console.assert(syv.name === "toto");
// setter/mutator test
wrappedSyv.setName("titi");
console.assert(wrappedSyv.name === "My name is titi");
console.assert(syv.name === "My name is titi");

// we can add proxied properties on proxy instance
syv.age = 30;
proxy.prop(wrappedSyv, "person", "age");
console.assert(wrappedSyv.age === 30);
wrappedSyv2 = new PersonProxy(syv);
console.assert(wrappedSyv2.age === undefined);

// we can add proxied properties after construction on proxy prototype
syv.size = 175;
proxy.prop(PersonProxy.prototype, "person", "size");
console.assert(wrappedSyv.size === 175);
console.assert(wrappedSyv2.size === 175);

// we can redirect one property
proxy.prop(PersonProxy.prototype, "person", "age2", "age");
console.assert(wrappedSyv.age2 === 30);

// we can redirect multiple properties
proxy.props(PersonProxy.prototype, "person", {
    "age3": "age",
    "age4": "age",
});
console.assert(wrappedSyv.age3 === 30);
console.assert(wrappedSyv.age4 === 30);


// this can be used to augment one object without modifying it
// for example to store meta data
syncedSyv = new PersonProxy(syv);
syncedSyv.syncStatus = "finished";
console.assert(syncedSyv.syncStatus === "finished");
console.assert(syv.syncStatus === undefined);

// for example to  create a relationship
task = {
    label: "tache à faire",
    done: false
};

function AssignedTask(task, assignee) {
    this.task = task;
    this.assignee = assignee;
}
proxy.props(AssignedTask.prototype, "task", ["label", "done"]);

assignedTask = new AssignedTask(task, syv);
console.assert(assignedTask.label === "tache à faire");
assignedTask.done = true;
console.assert(assignedTask.done === true);
console.assert(task.done === true);
console.assert(assignedTask.assignee === syv);

// to merge objects properties
syvAdditional = {
    address: {
        street: "République",
        city: "Choisy"
    },
    phone: "1234"
};
fullSyv = Object.create(null, {
    _main: {
        value: syv,
    },
    _additional: {
        value: syvAdditional,
    }
});
proxy.props(fullSyv, "_main", ["name", "age"]);
proxy.props(fullSyv, "_additional", ["address", "phone"]);
console.assert(Object.keys(fullSyv).sort().toString() === ["name", "age", "address", "phone"].sort().toString());
console.assert(fullSyv.age === 30);
console.assert(fullSyv.address === syvAdditional.address);
syvAdditional.address.city = "Choisy le roi";
console.assert(fullSyv.address.city === "Choisy le roi");

// that we can encapsulate in yet another proxy to expose only one property for example
fullSyvProxy = {
    syv: fullSyv,
};
proxy.prop(fullSyvProxy, "syv", "name");
fullSyvProxy.name = "syv";
console.assert(fullSyvProxy.name === "syv");
console.assert(fullSyv.name === "syv");
console.assert(syv.name === "syv");
console.assert(fullSyvProxy.age === undefined);