import ksfCompose from '../compose';
import dojoCompose from 'dojoCompose';
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
    greet: function(somebody) {
        return "Hello " + somebody + ", my name is " + this.name + " and I'm a " + this.job;
    },
};

JSLitmus.test('ksf compose', function() {
    return ksfCompose(Person, WithJob);
});
JSLitmus.test('dojo compose', function() {
    return dojoCompose(Person, WithJob);
});