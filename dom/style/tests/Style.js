/*jshint multistr: true */
import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import compose from 'compose';
import Style from '../Style';
registerSuite({
    name: "Styling components",
    "apply style": function() {
        var domNode = document.createElement('div');
        document.body.appendChild(domNode);

        var style = new Style({
            css: '#this {\
					background-color: red;\
					width: 50px;\
					height: 20px;\
				}'
        });
        style.apply(domNode);
        var computedStyle = getComputedStyle(domNode);
        assert.equal(computedStyle.getPropertyValue('background-color'), "rgb(255, 0, 0)");
        assert.equal(computedStyle.getPropertyValue('width'), "50px");
        assert.equal(computedStyle.getPropertyValue('height'), "20px");
    },
    "unapply style": function() {
        var domNode = document.createElement('div');
        document.body.appendChild(domNode);

        var style = new Style({
            css: '#this {\
					background-color: green;\
					width: 50px;\
					height: 20px;\
				}'
        });
        var computedStyle = getComputedStyle(domNode);
        var origBackground = computedStyle.getPropertyValue('background-color');
        style.apply(domNode);
        assert.equal(computedStyle.getPropertyValue('background-color'), "rgb(0, 128, 0)");
        style.unapply(domNode);
        assert.equal(computedStyle.getPropertyValue('background-color'), origBackground);
    },

    "destroy style": function() {
        var domNode1 = document.createElement('div');
        var domNode2 = document.createElement('div');
        document.body.appendChild(domNode1);
        document.body.appendChild(domNode2);

        var style = new Style({
            css: '#this {\
					background-color: green;\
				}'
        });

        var computedStyle1 = getComputedStyle(domNode1);
        var computedStyle2 = getComputedStyle(domNode2);
        var origBackground = computedStyle1.getPropertyValue('background-color');
        style.apply(domNode1);
        style.apply(domNode2);
        assert.equal(computedStyle1.getPropertyValue('background-color'), "rgb(0, 128, 0)");
        assert.equal(computedStyle1.getPropertyValue('background-color'), "rgb(0, 128, 0)");
        style.destroy();
        assert.equal(computedStyle1.getPropertyValue('background-color'), origBackground);
        assert.equal(computedStyle2.getPropertyValue('background-color'), origBackground);
    },

    "named style": function() {
        var domNode = document.createElement('div');
        document.body.appendChild(domNode);
        var style = new Style({
            css: '',
            name: 'Toto'
        });
        style.apply(domNode);

        assert.equal(style.id.substr(0, 4), 'Toto');
    }
});