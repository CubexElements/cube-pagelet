import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@kubex/cube-resource/cube-resource';
import './cube-pagelet-content.js';

/**
 An element to load a url into a container

 Example:

 <cube-pagelet url="./ajax.html"></cube-pagelet>

 Example:

 <cube-pagelet url="./random.html" refresh="3"></cube-pagelet>

 @demo demo/index.html
 */
class CubePagelet extends PolymerElement {
  static get is() {return 'cube-pagelet'}

  static get template()
  {
    return html`<style>
      :host {
        display: block;
      }
    </style>
    <cube-resource id="res" auto="[[auto]]" auth="[[auth]]" url="[[url]]" ttl="[[ttl]]" headers="[[headers]]" response="{{_cubePageletContent}}" status="{{status}}"></cube-resource>
    <cube-pagelet-content id="content" html="[[_cubePageletContent]]" local="[[local]]">
      <slot></slot>
    </cube-pagelet-content>`;
  }

  static get properties()
  {
    return {
      /**
       * URL you want to be loaded into the container
       */
      url:     {type: String},
      auth:    {type: Boolean, value: false},
      local:   {type: Boolean, value: false},
      auto:    {type: Boolean, value: false},
      /**
       * ttl: time to live (in seconds)
       */
      ttl:     {type: Number, value: 0},
      /**
       * Number of seconds to refresh the url
       */
      refresh: {type: Number, value: 0},
      status:  {type: Number, notify: true},
      headers: {type: Object},

      _refreshIntervalHandle: {type: Number},
    };
  }

  static get observers() {return ['_refresh(auto,url,refresh)'];}

  _refresh(auto, url, refresh)
  {
    if(auto)
    {
      this.update(false);
    }
  }

  update(ignoreCache)
  {
    this.$.res.update(ignoreCache);
    this.startInterval();
  }

  startInterval()
  {
    if(this.refresh > 0 && !this._refreshIntervalHandle)
    {
      this.stopInterval();
      this._refreshIntervalHandle = setInterval(
        function () { this.$.res.update(true); }.bind(this),
        this.refresh * 1000
      );
    }
  }

  stopInterval()
  {
    if(this._refreshIntervalHandle)
    {
      //noinspection JSCheckFunctionSignatures
      clearInterval(this._refreshIntervalHandle);
    }
  }

  detached()
  {
    this.stopInterval();
  }
}

customElements.define(CubePagelet.is, CubePagelet);