import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import compose from '../compose';
registerSuite({
    "one arg of type object": function() {
        var Person = compose({
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        });

        var syv = new Person();
        assert.equal(syv.greet("John"), "Hello John");
    },
    "one arg of type function": function() {
        var Person = compose(function(name) {
            this.nom = name;
        });

        var syv = new Person('syv');
        assert.equal(syv.nom, 'syv');
    },
    "one arg of type constructor": function() {
        var Person = function(name) {
            this.name = name;
        };
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var Employee = compose(Person);

        var syv = new Employee('syv');
        assert.equal(syv.name, 'syv');
        assert.equal(syv.greet("John"), "Hello John");
    },
    "constructor and object": function() {
        var Person = function(name) {
            this.name = name;
        };
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var Employee = compose(Person, {
            doWork: function() {
                return "I'm working";
            },
        });

        var syv = new Employee('syv');
        assert.equal(syv.doWork(), "I'm working");
    },
    "many constructors": function() {
        var Person = function(name) {
            this.name = name;
        };
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var WithJob = function() {
            this.job = arguments[1];
        };
        WithJob.prototype = {
            describe: function() {
                return "My name is " + this.name + " and I'm a " + this.job;
            },
        };

        var Employee = compose(Person, WithJob);

        var syv = new Employee('syv', 'dev');
        assert.equal(syv.describe(), "My name is syv and I'm a dev");
    },
});

registerSuite({
    name: "compose.create",
    "one arg of type object": function() {
        var syv = compose.create({
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        });

        assert.equal(syv.greet("John"), "Hello John");
    },
    "one arg of type function": function() {
        var Person = function() {};

        var syv = compose.create(Person, {
            nom: 'syv'
        });
        assert.equal(syv.nom, 'syv');
    },
    "one arg of type constructor": function() {
        var Person = function(name) {};
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var syv = compose.create(Person, {
            name: 'syv'
        });
        assert.equal(syv.name, 'syv');
        assert.equal(syv.greet("John"), "Hello John");
    },
    "constructor and object": function() {
        var Person = function(name) {};
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var Employee = {
            doWork: function() {
                return "I'm working";
            },
        };

        var syv = compose.create(Person, Employee, {
            name: 'syv'
        });
        assert.equal(syv.name, 'syv');
        assert.equal(syv.greet("John"), "Hello John");
        assert.equal(syv.doWork(), "I'm working");
    },
    "many constructors": function() {
        var Person = function(name) {};
        Person.prototype = {
            greet: function(somebody) {
                return "Hello " + somebody;
            }
        };

        var WithJob = function() {};
        WithJob.prototype = {
            describe: function() {
                return "My name is " + this.name + " and I'm a " + this.job;
            },
        };

        var syv = compose.create(Person, WithJob, {
            name: 'syv',
            job: 'dev'
        });

        assert.equal(syv.describe(), "My name is syv and I'm a dev");
    },
});