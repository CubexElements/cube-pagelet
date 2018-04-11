import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';

/**
 An element to bind html content to a container

 Example:

 <cube-pagelet-content html="this is some <strong>bold</strong> content"></cube-pagelet-content>

 @demo demo/cube-pagelet-content.html
 */
class CubePageletContent extends PolymerElement {
  static get is() {return 'cube-pagelet-content';}

  static get template()
  {
    return html`<style>
      :host {
        display: block;
      }
    </style>
    <slot></slot>`;
  }

  static get properties()
  {
    return {
      html:          {type: String, observer: '_htmlChanged'},
      local:         {type: Boolean, value: false},
      _trackedNodes: {type: Array, value: function () {return [];}},
      _eventName:    {type: String, value: 'cube-pagelet-content-ready', readOnly: true}
    }
  }

  _htmlChanged()
  {
    if(this.html !== null)
    {
      let
        idx,
        tpl = document.createElement('template'),
        doc = tpl.content.ownerDocument,
        frag = doc.createRange().createContextualFragment(this.html || '');

      // REMOVE IMPORTS
      let
        imports = frag.querySelectorAll('link[rel="import"]'),
        importsLength = imports.length,
        loadedImports = 0;
      for(idx in imports)
      {
        if(imports.hasOwnProperty(idx))
        {
          frag.removeChild(imports[idx]);
        }
      }

      // REMOVE OLD CONTENT
      for(idx in this._trackedNodes)
      {
        if(this._trackedNodes.hasOwnProperty(idx))
        {
          this._trackedNodes[idx][0].removeChild(this._trackedNodes[idx][1]);
        }
      }
      this._trackedNodes = [];

      // REMOVE REMAINING (UNTRACKED/SLOTTED) CONTENT
      for(idx in this.children)
      {
        if(this.children.hasOwnProperty(idx))
        {
          this.removeChild(this.children[idx]);
        }
      }

      // DETERMINE TARGET NODE
      tpl.content.appendChild(frag);
      let target = this;
      while(
        (target.tagName === 'CUBE-PAGELET' || target.tagName === 'CUBE-PAGELET-CONTENT')
        && target.local)
      {
        if(target.parentNode)
        {
          target = target.parentNode;
        }
        if(target.host)
        {
          target = target.host;
        }
      }

      // APPEND NEW CONTENT
      let stampedNodes = this._stampTemplate(tpl).childNodes;
      while(stampedNodes.length > 0)
      {
        this._trackedNodes.push([target, target.appendChild(stampedNodes[0])]);
      }

      // IMPORTS
      if(importsLength > 0)
      {
        for(idx in imports)
        {
          if(imports.hasOwnProperty(idx))
          {
            this.importHref(
              imports[idx].getAttribute('href'), function () {
                loadedImports++;
                if(loadedImports >= importsLength)
                {
                  this.dispatchEvent(new Event(this._eventName));
                }
              }
            );
          }
        }
      }
      else
      {
        this.dispatchEvent(new Event(this._eventName));
      }
    }
  }
}

customElements.define(CubePageletContent.is, CubePageletContent);