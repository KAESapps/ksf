import rest from 'rest/browser';
import mime from 'rest/interceptor/mime';
import errorCode from 'rest/interceptor/errorCode';
export default rest.wrap(mime, {
    mime: 'application/x-www-form-urlencoded'
}).wrap(errorCode, {
    code: 400
});