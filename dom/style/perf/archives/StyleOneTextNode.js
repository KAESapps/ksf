import compose from 'compose';

function createId(name) {
    name = name ? name + '-' : '';
    return name + 'sxxxxxx'.replace(/x/g, function(c) {
        return (Math.random() * 16 | 0).toString(16);
    });
}

var styleElement = document.createElement('style');
var ruleNode = document.createTextNode("");
styleElement.appendChild(ruleNode);

var rulesArray = [],
    applied = 0;

function updateCss() {
    if (applied && rulesArray.length > 0) {
        console.time('join');
        ruleNode.textContent = rulesArray.join('\n');
        console.timeEnd('join');
        if (!styleElement.parentNode) {
            document.head.appendChild(styleElement);
        }
    } else {
        if (styleElement.parentNode) {
            document.head.removeChild(styleElement);
        }
    }
}

var rules = {
    add: function(rule) {
        rulesArray.push(rule);
        updateCss();
    },
    remove: function(rule) {
        rulesArray.splice(rulesArray.indexOf(rule), 1);
        updateCss();
    }
};

var Style = compose(function(args) {
    this.id = createId(args.name);

    this.rule = args.css.replace(/#this/g, '.' + this.id);
    rules.add(this.rule);
}, {
    apply: function(domNode) {
        domNode.classList.add(this.id);
        applied += 1;
        updateCss();
    },
    unapply: function(domNode) {
        domNode.classList.remove(this.id);
        applied -= 1;
        updateCss();
    },
    destroy: function() {
        rules.remove(this.rule);
    }
});
export default Style;