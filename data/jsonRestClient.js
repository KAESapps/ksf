import rest from 'rest/browser';
import mime from 'rest/interceptor/mime';
import errorCode from 'rest/interceptor/errorCode';
export default rest.wrap(mime, {
    mime: 'application/json'
}).wrap(errorCode, {
    code: 400
});