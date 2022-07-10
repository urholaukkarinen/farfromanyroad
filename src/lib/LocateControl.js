
import L from 'leaflet';
import * as DomUtil from "leaflet/src/dom/DomUtil.js";
import * as DomEvent from "leaflet/src/dom/DomEvent.js";

export var LocateControl = L.Control.extend({
    options: {
        position: 'topleft',
        locateText: '<span aria-hidden="true">&#x1F50E;</span>',
        locateTitle: 'Locate',
        locateProgressText: '<div style="padding-top: 6px"><div class="loader"/></span>',
        locateAction: async () => {},
    },

    onAdd: function (map) {
        var containerName = 'leaflet-control-ffar',
            container = DomUtil.create('div', containerName + ' leaflet-bar'),
            options = this.options;

        this._locateButton  = this._createButton(options.locateText, options.locateTitle,
            containerName + '-locate',  container, async (e) => this._locate(map));

        this._updateDisabled();

        return container;
    },

    _locate: async function (map) {
        if (!this._disabled) {
            map.zoomControl.disable();
            this._locateButton.innerHTML = this.options.locateProgressText;
            this.disable();

            await this.options.locateAction();

            this.enable();
            this._locateButton.innerHTML = this.options.locateText;
            map.zoomControl.enable();
        }
    },

    disable: function () {
        this._disabled = true;
        this._updateDisabled();
        return this;
    },

    enable: function () {
        this._disabled = false;
        this._updateDisabled();
        return this;
    },

    _createButton: function (html, title, className, container, fn) {
        let link = DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        /*
         * Will force screen readers like VoiceOver to read this as "Zoom in - button"
         */
        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', title);

        DomEvent.disableClickPropagation(link);
        DomEvent.on(link, 'click', DomEvent.stop);
        DomEvent.on(link, 'click', fn, this);
        DomEvent.on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        DomUtil.removeClass(this._locateButton, className);
        this._locateButton.setAttribute('aria-disabled', 'false');

        if (this._disabled || false) {
            DomUtil.addClass(this._locateButton, className);
            this._locateButton.setAttribute('aria-disabled', 'true');
        }
    }
});

export var locateControl = function (options) {
    return new LocateControl(options);
};
