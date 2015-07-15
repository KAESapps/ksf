import onDomEvent from './onDomEventAsync';
export default function(eventName) {
    return function(listener) {
        return onDomEvent(this.domNode, eventName, listener);
    };
};