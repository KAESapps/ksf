var _Stylable = {
    style: function(style) {
        this._style && this._style.unapply(this.domNode);
        style && style.apply(this.domNode);
        this._style = style;
        return this;
    }
};

export default _Stylable;