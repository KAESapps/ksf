import onDomEvent from './onDomEvent';
export default function(eventName) {
    return function(listener) {
        return onDomEvent(this.domNode, eventName, listener);
    };
};