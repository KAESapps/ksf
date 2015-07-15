export default {
    _addFocusable: function(cmp) {
        var focusableCmps = this._focusableCmps || (this._focusableCmps = []);
        focusableCmps.push([
            cmp,
            cmp.onBlur(this._emitBlur.bind(this)),
            cmp.onFocus(this._emitFocus.bind(this)),
        ]);
        return cmp;
    },
    _removeFocusable: function(cmp) {
        var focusableCmps = this._focusableCmps;
        focusableCmps.some(function(cmpCancelerPair, i) {
            if (cmpCancelerPair[0] === cmp) {
                cmpCancelerPair[1]();
                cmpCancelerPair[2]();
                focusableCmps.splice(i, 0);
                return true;
            }
        });
    },
    _emitBlur: function() {
        if (!this.focused()) {
            this._emit('blur');
        }
    },
    _emitFocus: function() {
        if (!this.focused()) {
            this._emit('focus');
        }
    },
    focused: function() {
        return this._focusableCmps.some(function(cmpCancelerPair) {
            return cmpCancelerPair[0].focused();
        });
    },
    onBlur: function(cb) {
        return this._on('blur', cb);
    },
    onFocus: function(cb) {
        return this._on('focus', cb);
    },
    blur: function() {
        this._focusableCmps.some(function(cmpCancelerPair) {
            if (cmpCancelerPair[0].focused()) {
                cmpCancelerPair[0].blur();
                return true;
            }
        });
    },
    focus: function() {
        // default implementation that put focus on the first registered focusable
        this._focusableCmps[0][0].focus();
    },
};