import compose from 'compose';

function createId(name) {
    name = name ? name + '-' : '';
    return name + 'sxxxxxx'.replace(/x/g, function(c) {
        return (Math.random() * 16 | 0).toString(16);
    });
}


export default compose(function(args) {
    this.id = createId(args.name);
    this.styleElement = document.createElement('style');

    var rule = args.css.replace(/#this/g, '.' + this.id);
    this.ruleNode = document.createTextNode(rule);
    this.styleElement.appendChild(this.ruleNode);

    document.head.appendChild(this.styleElement);
}, {
    apply: function(domNode) {
        domNode.classList.add(this.id);
    },
    unapply: function(domNode) {
        domNode.classList.remove(this.id);
    },
    destroy: function() {
        document.head.removeChild(this.styleElement);
    }
});