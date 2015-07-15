export default function(domNode, eventName, cb, capture) {
    var self = this,
        asyncCb = function(ev) {
            setTimeout(function() {
                cb.call(self, ev);
            });
        };
    domNode.addEventListener(eventName, asyncCb, capture);
    return function() {
        domNode.removeEventListener(eventName, asyncCb, capture);
    };
};