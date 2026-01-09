/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let o=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(s,t,i)},a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:r,defineProperty:h,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,_=globalThis,g=_.trustedTypes,u=g?g.emptyScript:"",f=_.reactiveElementPolyfillSupport,m=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?u:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!r(t,e),v={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);o?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...c(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=s;const n=o.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const n=this.constructor;if(!1===s&&(o=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??x)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,f?.({ReactiveElement:$}),(_.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,w=t=>t,k=b.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+A,O=`<${M}>`,T=document,E=()=>T.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,L="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Y=/-->/g,U=/>/g,K=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,N=/"/g,R=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),Z=F(1),B=F(2),j=Symbol.for("lit-noChange"),X=Symbol.for("lit-nothing"),V=new WeakMap,I=T.createTreeWalker(T,129);function W(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const q=(t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",a=z;for(let e=0;e<i;e++){const i=t[e];let r,h,l=-1,c=0;for(;c<i.length&&(a.lastIndex=c,h=a.exec(i),null!==h);)c=a.lastIndex,a===z?"!--"===h[1]?a=Y:void 0!==h[1]?a=U:void 0!==h[2]?(R.test(h[2])&&(o=RegExp("</"+h[2],"g")),a=K):void 0!==h[3]&&(a=K):a===K?">"===h[0]?(a=o??z,l=-1):void 0===h[1]?l=-2:(l=a.lastIndex-h[2].length,r=h[1],a=void 0===h[3]?K:'"'===h[3]?N:H):a===N||a===H?a=K:a===Y||a===U?a=z:(a=K,o=void 0);const d=a===K&&t[e+1].startsWith("/>")?" ":"";n+=a===z?i+O:l>=0?(s.push(r),i.slice(0,l)+C+i.slice(l)+A+d):i+A+(-2===l?e:d)}return[W(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class G{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const a=t.length-1,r=this.parts,[h,l]=q(t,e);if(this.el=G.createElement(h,i),I.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=I.nextNode())&&r.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=l[n++],i=s.getAttribute(t).split(A),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?it:"?"===a[1]?st:"@"===a[1]?ot:et}),s.removeAttribute(t)}else t.startsWith(A)&&(r.push({type:6,index:o}),s.removeAttribute(t));if(R.test(s.tagName)){const t=s.textContent.split(A),e=t.length-1;if(e>0){s.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],E()),I.nextNode(),r.push({type:2,index:++o});s.append(t[e],E())}}}else if(8===s.nodeType)if(s.data===M)r.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(A,t+1));)r.push({type:7,index:o}),t+=A.length-1}o++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,s){if(e===j)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const n=P(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=J(t,o._$AS(t,e.values),o,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);I.currentNode=s;let o=I.nextNode(),n=0,a=0,r=i[0];for(;void 0!==r;){if(n===r.index){let e;2===r.type?e=new tt(o,o.nextSibling,this,t):1===r.type?e=new r.ctor(o,r.name,r.strings,this,t):6===r.type&&(e=new nt(o,this,t)),this._$AV.push(e),r=i[++a]}n!==r?.index&&(o=I.nextNode(),n++)}return I.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=X,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),P(t)?t===X||null==t||""===t?(this._$AH!==X&&this._$AR(),this._$AH=X):t!==this._$AH&&t!==j&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==X&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(W(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new G(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new tt(this.O(E()),this.O(E()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=X,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=X}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=J(this,t,e,0),n=!P(t)||t!==this._$AH&&t!==j,n&&(this._$AH=t);else{const s=t;let a,r;for(t=o[0],a=0;a<o.length-1;a++)r=J(this,s[i+a],e,a),r===j&&(r=this._$AH[a]),n||=!P(r)||r!==this._$AH[a],r===X?t=X:t!==X&&(t+=(r??"")+o[a+1]),this._$AH[a]=r}n&&!s&&this.j(t)}j(t){t===X?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===X?void 0:t}}class st extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==X)}}class ot extends et{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??X)===j)return;const i=this._$AH,s=t===X&&i!==X||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==X&&(i===X||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const at=b.litHtmlPolyfillSupport;at?.(G,tt),(b.litHtmlVersions??=[]).push("3.3.2");const rt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ht extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new tt(e.insertBefore(E(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}}ht._$litElement$=!0,ht.finalized=!0,rt.litElementHydrateSupport?.({LitElement:ht});const lt=rt.litElementPolyfillSupport;lt?.({LitElement:ht}),(rt.litElementVersions??=[]).push("4.2.2");class ct extends ht{static properties={hass:{type:Object},config:{type:Object},_history:{type:Object},_loading:{type:Boolean},_error:{type:String},_showTemp:{type:Boolean},_showHeating:{type:Boolean},_showSetpoint:{type:Boolean},_showKint:{type:Boolean},_showKext:{type:Boolean},_showExtTemp:{type:Boolean},_lastFetchTime:{type:Number},_lastStartDt:{type:String},_tooltip:{type:Object},_width:{type:Number},_zoomLevel:{type:Number},_panOffset:{type:Number},_isDragging:{type:Boolean},_dragStartX:{type:Number},_dragStartOffset:{type:Number},_yZoomLevel:{type:Number},_yPanOffset:{type:Number},_isYDragging:{type:Boolean},_dragStartY:{type:Number},_dragStartYOffset:{type:Number},_isPinching:{type:Boolean},_pinchStartDist:{type:Number},_pinchStartZoom:{type:Number},_pinchStartYZoom:{type:Number},_resetChecked:{type:Boolean},_boostKintChecked:{type:Boolean},_unboostKextChecked:{type:Boolean},_showOptions:{type:Boolean}};static getConfigElement(){return document.createElement("auto-tpi-learning-card-editor")}static getStubConfig(){return{learning_entity:"",climate_entity:"",name:""}}constructor(){super(),this._history=null,this._loading=!1,this._error=null,this._showTemp=!0,this._showHeating=!0,this._showSetpoint=!0,this._showKint=!0,this._showKext=!0,this._showExtTemp=!0,this._lastFetchTime=0,this._lastStartDt=null,this._tooltip=null,this._width=1,this._resizeObserver=null,this._zoomLevel=1,this._panOffset=0,this._isDragging=!1,this._dragStartX=0,this._dragStartOffset=0,this._yZoomLevel=1,this._yPanOffset=0,this._isYDragging=!1,this._dragStartY=0,this._dragStartYOffset=0,this._resetChecked=!1,this._boostKintChecked=!1,this._unboostKextChecked=!1,this._showOptions=!1}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(t=>{for(let e of t)e.contentRect.width>0&&(this._width=e.contentRect.width)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(t){if(!t.learning_entity)throw new Error("You need to define learning_entity");if(!t.climate_entity)throw new Error("You need to define climate_entity");this.config=t,this._history=null,this._lastFetchTime=0,this._lastStartDt=null}getCardSize(){}getLayoutOptions(){return{}}shouldUpdate(t){return!0}willUpdate(t){(t.has("_width")||t.has("_zoomLevel")||t.has("_panOffset")||t.has("_yZoomLevel")||t.has("_yPanOffset")||t.has("_history"))&&(this._chartState=null,this._staticChartContent=null),(t.has("_showTemp")||t.has("_showHeating")||t.has("_showSetpoint")||t.has("_showKint")||t.has("_showKext")||t.has("_showExtTemp"))&&(this._staticChartContent=null)}updated(t){if(super.updated(t),t.has("hass")&&this.hass&&this.config){const t=this.config.learning_entity,e=this.hass.states[t],i=e?.attributes?.learning_start_dt;if(i&&this._lastStartDt&&i!==this._lastStartDt&&(this._history=null),i&&(this._lastStartDt=i),this._history&&i){const t=new Date(i).getTime();Math.abs(this._history.startTime-t)>1e3&&(this._history=null)}const s=Date.now()-this._lastFetchTime>3e5,o=this._history&&this._history.endTime;(!this._history||s&&!o)&&!this._loading&&this._fetchHistory()}}async _fetchHistory(){if(!this._loading&&this.hass&&this.config){this._loading=!0,this._error=null;try{const t=this.config.learning_entity,e=this.config.climate_entity,i=this.hass.states[t];let s,o=i?.attributes?.learning_start_dt;s=o?new Date(o):new Date(Date.now()-864e5);const n=s.toISOString(),a=(new Date).toISOString(),r=`history/period/${n}?filter_entity_id=${[t,e].join(",")}&end_time=${a}&significant_changes_only=0`,h=await this.hass.callApi("GET",r);this._processHistory(h,t,e,s),this._lastFetchTime=Date.now()}catch(t){console.error("Error fetching history:",t),this._error="Failed to fetch history data."}finally{this._loading=!1}}}_bisectLeft(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<e?i=o+1:s=o}return i}_bisectRight(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<=e?i=o+1:s=o}return i-1}_getVisibleData(t,e,i){if(!t||0===t.length)return[];let s=this._bisectLeft(t,e),o=this._bisectRight(t,i);return s=Math.max(0,s-1),o=Math.min(t.length-1,o+1),s>o?[]:t.slice(s,o+1)}_processHistory(t,e,i,s){if(!Array.isArray(t))return void(this._history={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[],startTime:s.getTime()});const o={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[]};let n=null;const a=(t,e,i)=>{const s=parseFloat(i);isNaN(s)||t.push({t:e,val:s})};for(const s of t){if(!s||0===s.length)continue;const t=s[0].entity_id,r=t===e;if(r||t===i)for(const t of s){const e=new Date(t.last_updated).getTime(),i=t.attributes;if(i)if(r){const s=i.coeff_int_cycles||0,r=i.coeff_ext_cycles||0;"Off"===t.state&&s>=50&&r>=50&&(null===n||e<n)&&(n=e),null!=i.calculated_coef_int&&a(o.kint,e,i.calculated_coef_int),null!=i.calculated_coef_ext&&a(o.kext,e,i.calculated_coef_ext)}else{null!=i.current_temperature&&a(o.temp,e,i.current_temperature),null!=i.temperature&&a(o.setpoint,e,i.temperature);let t=null;null!=i.specific_states?.ext_current_temperature?t=i.specific_states.ext_current_temperature:null!=i.ext_current_temperature&&(t=i.ext_current_temperature),null!=t&&a(o.extTemp,e,t),void 0!==i.hvac_action&&o.heating.push({t:e,val:"heating"===i.hvac_action?1:0})}}}for(const t in o)o[t].sort((t,e)=>t.t-e.t);const r=this.hass.states[e];if(r){const t="Off"===r.state,e=r.attributes.coeff_int_cycles||0,i=r.attributes.coeff_ext_cycles||0;t&&e>=50&&i>=50||(n=null)}this._history={...o,startTime:s.getTime(),endTime:n}}_getLearningData(){const t=this.hass.states[this.config.learning_entity];return t?{state:t.state,kint:parseFloat(t.attributes.calculated_coef_int)||0,kext:parseFloat(t.attributes.calculated_coef_ext)||0,kintCycles:t.attributes.coeff_int_cycles||0,kextCycles:t.attributes.coeff_ext_cycles||0,confidence:parseFloat(t.attributes.model_confidence)||0,status:t.attributes.last_learning_status||"",learningStartDt:t.attributes.learning_start_dt||"",learningDone:t.attributes.learning_done,allowKintBoost:t.attributes.allow_kint_boost_on_stagnation,allowKextCompensation:t.attributes.allow_kext_compensation_on_overshoot}:null}_toggleAutoTpi(t){this.hass&&this.config&&(t?this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!1,reinitialise:!1}):this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!0,reinitialise:this._resetChecked,allow_kint_boost_on_stagnation:this._boostKintChecked,allow_kext_compensation_on_overshoot:this._unboostKextChecked}),this._resetChecked=!1)}_toggleResetCheckbox(){this._resetChecked=!this._resetChecked,this.requestUpdate()}_toggleBoostKintCheckbox(){this._boostKintChecked=!this._boostKintChecked,this.requestUpdate()}_toggleUnboostKextCheckbox(){this._unboostKextChecked=!this._unboostKextChecked,this.requestUpdate()}_toggleOptions(){this._showOptions=!this._showOptions}_toggleHeating(){this._showHeating=!this._showHeating}_toggleSetpoint(){this._showSetpoint=!this._showSetpoint}_toggleKint(){this._showKint=!this._showKint}_toggleKext(){this._showKext=!this._showKext}_toggleExtTemp(){this._showExtTemp=!this._showExtTemp}_toggleTemp(){this._showTemp=!this._showTemp}_handleWheel(t){if(t.preventDefault(),!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=t.clientX-e.left,s=t.clientY-e.top,o=60,n=60,a=40,r=60,h=e.width-o-n,l=e.height-a-r,c=Math.max(0,Math.min(1,(i-o)/h)),d=this._history.endTime||Date.now(),p=this._history.startTime,_=Math.max(d-p,216e5),g=_/this._zoomLevel,u=p+this._panOffset+c*g,f=this._getYValueFromPosition(s,a,l),m=t.deltaY>0?.9:1.1,y=Math.max(1,Math.min(20,this._zoomLevel*m)),x=Math.max(1,Math.min(20,this._yZoomLevel*m));this._zoomLevel=y,this._yZoomLevel=x;const v=_/y;this._panOffset=u-p-c*v;const $=a+l/2,b=a+l-f*l;this._yPanOffset=s-($+(b-$)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._tooltip=null,this.requestUpdate()}_zoomIn(){this._zoomLevel=Math.min(20,1.2*this._zoomLevel),this._yZoomLevel=Math.min(20,1.2*this._yZoomLevel),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_zoomOut(){this._zoomLevel=Math.max(1,this._zoomLevel/1.2),this._yZoomLevel=Math.max(1,this._yZoomLevel/1.2),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_resetZoom(){this._zoomLevel=1,this._panOffset=0,this._yZoomLevel=1,this._yPanOffset=0}_clampPanOffset(){if(!this._history)return;const t=(this._history.endTime||Date.now())-this._history.startTime,e=Math.max(t,216e5),i=e-e/this._zoomLevel;this._panOffset=Math.max(0,Math.min(i,this._panOffset))}_clampYPanOffset(){this._yPanOffset=Math.max(-1e4,Math.min(1e4,this._yPanOffset))}_applyYZoom(t,e,i){if(1===this._yZoomLevel&&0===this._yPanOffset)return t;const s=e+i/2;return s+(t-s)*this._yZoomLevel+this._yPanOffset}_getYValueFromPosition(t,e,i){const s=e+i/2;return(e+i-(s+(t-this._yPanOffset-s)/this._yZoomLevel))/i}_getSVGPoint(t,e,i){const s=t.createSVGPoint();return s.x=e,s.y=i,s.matrixTransform(t.getScreenCTM().inverse())}_handleTouchMove(t){t.preventDefault();const e=t.currentTarget,i=t.touches[0],{x:s,y:o}=this._getSVGPoint(e,i.clientX,i.clientY);this._processCursorMove(s,o)}_handleMouseMove(t){const e=t.currentTarget,{x:i,y:s}=this._getSVGPoint(e,t.clientX,t.clientY);this._processCursorMove(i,s)}_handleMouseDown(t){this._isDragging=!0,this._dragStartX=t.clientX,this._dragStartY=t.clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset,t.currentTarget.style.cursor="grabbing"}_handleMouseMove_Drag(t){if(!this._isDragging||!this._history)return;const e=60,i=60,s=t.currentTarget.getBoundingClientRect().width-e-i,o=this._dragStartX-t.clientX,n=this._dragStartY-t.clientY,a=this._history.endTime||Date.now(),r=this._history.startTime,h=o/s*(Math.max(a-r,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+h,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-n)}_handleMouseUp(t){this._isDragging=!1,t.currentTarget.style.cursor="default"}_handleTouchStart(t){if(1===t.touches.length)this._isDragging=!0,this._isPinching=!1,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset;else if(2===t.touches.length){this._isDragging=!1,this._isPinching=!0;const e=t.touches[0].clientX-t.touches[1].clientX,i=t.touches[0].clientY-t.touches[1].clientY;this._pinchStartDist=Math.hypot(e,i),this._pinchStartZoom=this._zoomLevel,this._pinchStartYZoom=this._yZoomLevel}}_handleTouchMove_Drag(t){if(!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=60,s=60,o=40,n=60,a=e.width-i-s,r=e.height-o-n;if(this._isDragging&&1===t.touches.length){t.preventDefault();const e=this._dragStartX-t.touches[0].clientX,i=this._dragStartY-t.touches[0].clientY,s=this._history.endTime||Date.now(),o=this._history.startTime,n=e/a*(Math.max(s-o,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+n,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-i)}else if(this._isPinching&&2===t.touches.length){t.preventDefault();const s=t.touches[0],n=t.touches[1],h=s.clientX-n.clientX,l=s.clientY-n.clientY,c=Math.hypot(h,l);if(this._pinchStartDist<=10)return;const d=c/this._pinchStartDist,p=(s.clientX+n.clientX)/2,_=(s.clientY+n.clientY)/2,g=p-e.left,u=_-e.top,f=Math.max(0,Math.min(1,(g-i)/a)),m=this._history.endTime||Date.now(),y=this._history.startTime,x=Math.max(m-y,216e5),v=x/this._zoomLevel,$=y+this._panOffset+f*v,b=this._getYValueFromPosition(u,o,r),w=Math.max(1,Math.min(20,this._pinchStartZoom*d)),k=Math.max(1,Math.min(20,this._pinchStartYZoom*d));this._zoomLevel=w,this._yZoomLevel=k;const S=x/w;this._panOffset=$-y-f*S;const C=o+r/2,A=o+r-b*r;this._yPanOffset=u-(C+(A-C)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}}_handleTouchEnd(t){0===t.touches.length?(this._isDragging=!1,this._isPinching=!1):1===t.touches.length&&this._isPinching&&(this._isPinching=!1,this._isDragging=!0,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset)}_processCursorMove(t,e){if(!this._chartState)return;const{xMin:i,xMax:s,chartWidth:o,chartHeight:n,padding:a,kint:r,kext:h,temp:l,extTemp:c,setpoint:d,getY_Kint:p,getY_Kext:_,getY_Temp:g}=this._chartState,u=t-a.left;if(u<0||u>o)return void(this._tooltip=null);const f=i+u/o*(s-i),m=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);return i>=0&&i<t.length?t[i].val:null},y=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);if(i<0)return t[0].val;if(i>=t.length-1)return t[t.length-1].val;const s=t[i],o=t[i+1],n=s.t,a=o.t,r=s.val,h=o.val;if(a===n)return r;return r+(h-r)*((e-n)/(a-n))},x=this._showKint?m(r,f):null,v=this._showKext?m(h,f):null,$=this._showTemp?y(l,f):null,b=this._showExtTemp?y(c,f):null,w=this._showSetpoint?m(d,f):null;let k=1/0,S=1/0,C=1/0,A=1/0,M=1/0;null!==x&&(k=p(x)),null!==v&&(S=_(v)),null!==$&&(C=g($)),null!==b&&(A=g(b)),null!==w&&(M=g(w));const O=Math.abs(e-k),T=Math.abs(e-S),E=Math.abs(e-C),P=Math.abs(e-A),D=Math.abs(e-M);let L="kint",z=O;if(T<z&&(z=T,L="kext"),E<z&&(z=E,L="temp"),P<z&&(z=P,L="extTemp"),D<z&&(z=D,L="setpoint"),z>50)return void(this._tooltip=null);let Y=x,U="rgb(255, 235, 59)",K="Coef INT",H=k,N=4;"kext"===L?(Y=v,U="rgb(76, 175, 80)",K="Coef EXT",H=S):"temp"===L?(Y=$,U="rgb(33, 150, 243)",K="Température",H=C,N=1):"extTemp"===L?(Y=b,U="rgb(25, 50, 100)",K="Ext Temp",H=A,N=1):"setpoint"===L&&(Y=w,U="rgba(255, 152, 0, 0.8)",K="Consigne",H=M,N=1),this._tooltip=null!==Y?{x:t,y:e,t:f,value:Y,color:U,title:K,targetY:H,precision:N}:null}_handleMouseLeave(){this._tooltip=null}_renderTooltip(){if(!this._tooltip||null===this._tooltip.value)return Z``;const t=new Date(this._tooltip.t).toLocaleString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}),{x:e,targetY:i}=this._tooltip,s=this._width>0?this._width:800,o=e>s/2;return Z`
      <div class="tooltip" style="
        left: ${o?"auto":`${e+20}px`};
        right: ${o?s-e+20+"px":"auto"};
        top: ${`${i}px`};
        transform: ${"translate(0, -50%)"};
        border-left: 5px solid ${this._tooltip.color};
      ">
        <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 2px;">${this._tooltip.title}</div>
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 4px;">${t}</div>
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(this._tooltip.precision)}</div>
      </div>
    `}_calculateChartState(){if(!this._history)return null;const{kint:t,kext:e,temp:i,heating:s,setpoint:o,extTemp:n}=this._history,a=this._width>0?this._width:800,r={top:10,right:60,bottom:40,left:60},h=a-r.left-r.right,l=300-r.top-r.bottom,c=this._history.endTime||Date.now();let d=this._history.startTime,p=c;const _=216e5,g=c-d;c-d<_&&(p=d+_);const u=Math.max(g,_)/this._zoomLevel;let f=d+this._panOffset,m=f+u;let y=0,x=1;if(t.length>0){let e=1/0,i=-1/0;for(const s of t)s.val<e&&(e=s.val),s.val>i&&(i=s.val);y=Math.min(0,e),x=Math.max(1,i),x>1&&(x=Math.ceil(10*x)/10)}let v=0,$=.1;if(e.length>0){let t=1/0,i=-1/0;for(const s of e)s.val<t&&(t=s.val),s.val>i&&(i=s.val);v=Math.min(0,t),$=Math.max(.1,i),$>.1&&($=Math.ceil(100*$)/100)}let b=-20,w=40;const k=[...i,...n,...o];if(k.length>0){const t=Math.min(...k.map(t=>t.val)),e=Math.max(...k.map(t=>t.val));if(b=Math.max(-20,Math.floor(t-1)),w=Math.min(40,Math.ceil(e+1)),w-b<5){const t=(b+w)/2;b=Math.max(-20,t-2.5),w=Math.min(40,t+2.5)}}return{width:a,height:300,padding:r,chartWidth:h,chartHeight:l,xMin:f,xMax:m,getX:t=>m===f?r.left:r.left+(t-f)/(m-f)*h,getY_Kint:t=>{const e=r.top+l-(t-y)/(x-y)*l;return this._applyYZoom(e,r.top,l)},getY_Kext:t=>{const e=r.top+l-(t-v)/($-v)*l;return this._applyYZoom(e,r.top,l)},getY_Temp:t=>{if(w===b)return r.top+l/2;const e=r.top+l-(t-b)/(w-b)*l;return this._applyYZoom(e,r.top,l)},kintMin:y,kintMax:x,kextMin:v,kextMax:$,kint:t,kext:e,temp:i,heating:s,setpoint:o,extTemp:n}}_generateStaticContent(t){if(!t)return B``;const{width:e,height:i,padding:s,chartWidth:o,chartHeight:n,xMin:a,xMax:r,getX:h,getY_Kint:l,getY_Kext:c,getY_Temp:d,kintMin:p,kintMax:_,kextMin:g,kextMax:u,kint:f,kext:m,temp:y,heating:x,setpoint:v,extTemp:$}=t,b=(t,e)=>0===t.length?"":t.map((t,i)=>`${0===i?"M":"L"} ${h(t.t).toFixed(1)},${e(t.val).toFixed(1)}`).join(" "),w=(t,e)=>{if(0===t.length)return"";let i=`M ${h(t[0].t).toFixed(1)},${e(t[0].val).toFixed(1)}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${h(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${h(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const s=t[t.length-1],o=this._history?.endTime||Date.now();return o>s.t&&(i+=` L ${h(o).toFixed(1)},${e(s.val).toFixed(1)}`),i},k=this._showKint?this._getVisibleData(f,a,r):[],S=this._showKext?this._getVisibleData(m,a,r):[],C=this._showTemp?this._getVisibleData(y,a,r):[],A=this._showExtTemp?this._getVisibleData($,a,r):[],M=this._showSetpoint?this._getVisibleData(v,a,r):[],O=k.length>0?w(k,l):"",T=S.length>0?w(S,c):"",E=C.length>0?b(C,d):"",P=A.length>0?b(A,d):"",D=M.length>0?w(M,d):"",L=M.length>0?((t,e)=>{if(0===t.length)return"";let i=`M ${h(t[0].t).toFixed(1)},${s.top+n}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${h(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${h(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const o=t[t.length-1],a=this._history?.endTime||Date.now();return a>o.t&&(i+=` L ${h(a).toFixed(1)},${e(o.val).toFixed(1)}`),i+=` L ${h(t[t.length-1].t).toFixed(1)},${s.top+n}`,i+=` L ${h(t[0].t).toFixed(1)},${s.top+n} Z`,i})(M,d):"",z=[];if(this._showHeating&&x.length>0){const t=e-s.right;let i=this._bisectLeft(x,a),o=this._bisectRight(x,r);i=Math.max(0,i-1),o=Math.min(x.length-1,o+1);for(let e=i;e<=o;e++)if(x[e]&&1===x[e].val){const i=x[e].t,o=e<x.length-1?x[e+1].t:this._history?.endTime||Date.now();if(o<a||i>r)continue;const l=h(i),c=h(o),d=Math.max(s.left,Math.min(l,c)),p=Math.min(t,Math.max(l,c))-d;p>0&&z.push(B`
              <rect
                x="${d}"
                y="${s.top+n-20}"
                width="${p}"
                height="20"
                fill="rgba(255, 152, 0, 0.5)"
                clip-path="url(#chart-clip)"
              />
            `)}}const Y=[],U=_>2?.5:.25;for(let t=Math.ceil(p/U)*U;t<=_+.001;t+=U)Y.push(t);const K=Y.map(t=>{const i=l(t);return B`
        <line x1="${s.left}" y1="${i}" x2="${e-s.right}" y2="${i}" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.3" />
        <text x="${s.left-8}" y="${i+5}" text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9">${t.toFixed(2)}</text>
      `}),H=[],N=u>.5?.1:.05;for(let t=Math.ceil(g/N)*N;t<=u+1e-4;t+=N)H.push(t);const R=H.map(t=>{const i=c(t);return B`
        <text x="${e-s.right+8}" y="${i+5}" text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9">${t.toFixed(2)}</text>
      `}),F=[],Z=(r-a)/5,j=[36e5,72e5,108e5,144e5,216e5,432e5,864e5];let X=j.find(t=>Z<=t)||j[j.length-1];const V=new Date(a);V.setMinutes(0,0,0),V.getTime()<a&&V.setTime(V.getTime()+36e5);let I=V.getTime();for(;I<=r;){const t=new Date(I),e=t.getHours();if(e%(X/36e5)===0){const o=h(I),a=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`;let r="";if(0===e){const e={day:"numeric",month:"short"};r=t.toLocaleDateString("fr-FR",e)}F.push(B`
          <line x1="${o}" y1="${s.top+n}" x2="${o}" y2="${s.top+n+5}" stroke="#aaa" stroke-width="1" />
          <text x="${o}" y="${i-18}" text-anchor="middle" font-size="12" fill="#aaa">${a}</text>
          ${r?B`<text x="${o}" y="${i-4}" text-anchor="middle" font-size="10" fill="#888">${r}</text>`:""}
        `)}I+=36e5}return B`
      <defs>
        <clipPath id="chart-clip">
          <rect x="${s.left}" y="${s.top}" width="${o}" height="${n}" />
        </clipPath>
      </defs>

      ${K}
      ${R}
      ${F}

      <rect x="${s.left}" y="${s.top}" width="${o}" height="${n}" fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5" />

      ${z}
      ${L?B`<path d="${L}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${D?B`<path d="${D}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${E?B`<path d="${E}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${P?B`<path d="${P}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${T?B`<path d="${T}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${O?B`<path d="${O}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
    `}_renderChart(){if(this._loading)return Z`<div class="loading">Loading history data...</div>`;if(this._error)return Z`<div class="error">${this._error}</div>`;if(!this._history||0===this._history.kint.length&&0===this._history.kext.length)return Z`<div class="no-data">No history data available</div>`;this._chartState||(this._chartState=this._calculateChartState()),!this._staticChartContent&&this._chartState&&(this._staticChartContent=this._generateStaticContent(this._chartState));const{height:t,width:e}=this._chartState,i=this._chartState.padding;let s=B``;if(this._tooltip&&null!==this._tooltip.value){const e=this._tooltip.x,o=this._tooltip.targetY;s=B`
        <g style="pointer-events: none;">
          <line x1="${e}" y1="${i.top}" x2="${e}" y2="${t-i.bottom}" stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3" />
          <circle cx="${e}" cy="${o}" r="6" fill="white" stroke="${this._tooltip.color}" stroke-width="3" />
        </g>
      `}return Z`
      <svg
        width="100%"
        height="${t}"
        viewBox="0 0 ${e} ${t}"
        preserveAspectRatio="xMidYMid meet"
        style="cursor: ${this._isDragging?"grabbing":"default"}; overflow: hidden; touch-action: none;"
        @wheel="${t=>this._handleWheel(t)}"
        @mousedown="${t=>this._handleMouseDown(t)}"
        @mousemove="${t=>{this._handleMouseMove_Drag(t),this._isDragging||this._handleMouseMove(t)}}"
        @mouseup="${t=>this._handleMouseUp(t)}"
        @mouseleave="${t=>{this._handleMouseUp(t),this._handleMouseLeave()}}"
        @touchstart="${t=>this._handleTouchStart(t)}"
        @touchmove="${t=>{this._handleTouchMove_Drag(t),this._isDragging||this._isPinching||this._handleTouchMove(t)}}"
        @touchend="${t=>this._handleTouchEnd(t)}"
      >
        ${this._staticChartContent}
        ${s}
      </svg>
    `}render(){if(!this.hass||!this.config)return Z``;const t=this._getLearningData();if(!t)return Z`
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${this.config.learning_entity}</p>
          </div>
        </ha-card>
      `;const e=Math.round(100*t.confidence),i="Off"!==t.state,s=i?"Active":"Off",o=t.status||"Waiting for update...",n=i?"Stop Learning":"Start Learning",a=i?"mdi:stop":"mdi:play";return Z`
      <ha-card>
        <div class="card-content">
          <div class="header-row">
            <div class="header-title">${this.config.name||"Auto-TPI Learning"}</div>
            
            <div class="controls-container">
              <div class="main-controls">
                <mwc-button
                  @click=${()=>this._toggleAutoTpi(i)}
                  class="${i?"stop-btn":"start-btn"}"
                  dense
                  raised
                >
                  <ha-icon icon="${a}" style="margin-right: 4px;"></ha-icon>
                  ${n}
                </mwc-button>
                <ha-icon-button
                   @click="${()=>this._toggleOptions()}"
                   style="margin-left: 0px; color: var(--secondary-text-color);"
                   title="Options"
                >
                  <ha-icon icon="${this._showOptions?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
                </ha-icon-button>
              </div>

               ${this._showOptions?Z`
                 <div class="options-container">
                 ${i?Z`
                  <div class="checkbox-container disabled">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${t.allowKintBoost}
                        disabled
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">boost Kint on stagnation</span>
                  </div>
                  <div class="checkbox-container disabled">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${t.allowKextCompensation}
                        disabled
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">unboost Kext on overshoot</span>
                  </div>
                `:Z`
                  <div class="checkbox-container" @click="${()=>this._toggleResetCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._resetChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">Reset</span>
                  </div>
                  <div class="checkbox-container" @click="${()=>this._toggleBoostKintCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._boostKintChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">boost Kint on stagnation</span>
                  </div>
                   <div class="checkbox-container" @click="${()=>this._toggleUnboostKextCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._unboostKextChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">unboost Kext on overshoot</span>
                  </div>
                `}
                </div>
               `:""}
            </div>
          </div>

          <div class="telemetry">
            <div class="telemetry-content">
              <div class="telem-line">
                <span class="label">State:</span>
                <span style="${i?"color: var(--success-color, #4CAF50); font-weight: bold;":""}">${s}</span>
                &nbsp;|&nbsp;
                <span class="label">Confidence:</span> ${e}%
              </div>

              <div class="telem-line" style="align-items: flex-start;">
                <div style="display: flex; flex-direction: column; margin-right: 24px;">
                  <span class="kint-color">Kint: ${t.kint.toFixed(4)}</span>
                  <span style="font-size: 0.9em; opacity: 0.8;">Cycles: ${t.kintCycles}</span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span class="kext-color">Kext: ${t.kext.toFixed(4)}</span>
                  <span style="font-size: 0.9em; opacity: 0.8;">Cycles: ${t.kextCycles}</span>
                </div>
              </div>

              <div class="telem-line status">
                ${o}
              </div>
            </div>
            
            <div class="zoom-controls">
              <ha-icon-button @click="${()=>this._zoomIn()}">
                <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${()=>this._resetZoom()}">
                <ha-icon icon="mdi:magnify-remove-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${()=>this._zoomOut()}">
                <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
              </ha-icon-button>
            </div>
          </div>

            ${this._renderChart()}
            ${this._renderTooltip()}
          </div>
          
          <div class="legend">
            <div class="legend-item clickable" @click="${()=>this._toggleKint()}">
              <span class="dot kint-bg" style="opacity: ${this._showKint?1:.3}"></span> Kint
            </div>
            <div class="legend-item clickable" @click="${()=>this._toggleKext()}">
              <span class="dot kext-bg" style="opacity: ${this._showKext?1:.3}"></span> Kext
            </div>
            <div class="legend-item clickable" @click="${()=>this._toggleSetpoint()}">
              <span class="dot setpoint-bg" style="opacity: ${this._showSetpoint?1:.3}"></span> SetPoint
            </div>
            <div class="legend-item clickable" @click="${()=>this._toggleExtTemp()}">
              <span class="dot ext-temp-bg" style="opacity: ${this._showExtTemp?1:.3}"></span> ExtTemp
            </div>
            <div class="legend-item clickable" @click="${()=>this._toggleTemp()}">
              <span class="dot temp-bg" style="opacity: ${this._showTemp?1:.3}"></span> Temp
            </div>
            <div class="legend-item clickable" @click="${()=>this._toggleHeating()}">
              <span class="dot heating-bg" style="opacity: ${this._showHeating?1:.3}"></span> Heating
            </div>
          </div>
        </div>
      </ha-card>
    `}static styles=n`
    :host {
      display: block;
    }
    ha-card {
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow);
      color: var(--primary-text-color);
      display: flex;
      flex-direction: column;
    }
    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 200px);
      margin-top: 8px;
    }
    .controls-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0px;
    }
    .main-controls {
      display: flex;
      align-items: center;
    }
    .options-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-top: 8px;
      margin-right: 8px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      width: 100%;
      margin-bottom: -15px;
    }
    .checkbox-container:last-child {
        margin-bottom: 0px;
    }
    .checkbox-container.disabled {
      cursor: default;
      opacity: 0.6;
    }
    .checkbox-label {
      font-size: 12px;
      margin-left: 4px;
    }

    /* Button Colors */
    mwc-button.start-btn {
      --mdc-theme-primary: var(--success-color, #4CAF50);
      --mdc-theme-on-primary: white;
      cursor: pointer;
      padding-left: 10px;
      margin-bottom: -8px;
    }
    mwc-button.stop-btn {
      --mdc-theme-primary: var(--error-color, #F44336);
      --mdc-theme-on-primary: white;
      cursor: pointer;
      padding-left: 10px;
      margin-bottom: -8px;
    }

    .telemetry {
      margin-bottom: 4px; /* Reduced from 16px */
      background: rgba(0,0,0,0.1);
      padding: 8px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .telemetry-content {
      display: flex;
      flex-direction: column;
    }
    .telem-line {
      font-size: 13px;
      line-height: 1.6;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    .telem-line.status {
      font-style: italic;
      opacity: 0.7;
      margin-top: 4px;
      font-size: 12px;
      overflow-wrap: anywhere;
      word-break: break-word; /* Deprecated but useful fallback */
      word-break: break-all;  /* Force break for long strings */
      display: block;         /* Ensure block layout for text wrapping */
    }
    .label {
      font-weight: 500;
      opacity: 0.8;
      margin-right: 4px;
    }
    .kint-color { color: rgb(255, 235, 59); font-weight: bold; }
    .kext-color { color: rgb(76, 175, 80); font-weight: bold; }
    
    .chart-container {
      width: 100%;
      height: 300px;
      position: relative;
      margin-bottom: 0px; /* Reduced from 8px */
      overflow: hidden;
    }
    .zoom-controls {
      display: flex;
      gap: 4px;
    }
    .zoom-controls ha-icon-button {
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 32px;
    }
    .tooltip {
      position: absolute;
      background: var(--ha-card-background, var(--card-background-color, white));
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color, #ccc);
      padding: 8px 12px;
      border-radius: 4px;
      pointer-events: none;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10;
      white-space: nowrap;
      transition: top 0.1s ease-out, left 0.1s ease-out;
    }
    .loading, .error, .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .error { color: var(--error-color, red); }

    .legend {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      margin-top: -10px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .clickable { cursor: pointer; user-select: none; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .kint-bg { background: rgb(255, 235, 59); }
    .kext-bg { background: rgb(76, 175, 80); }
    .temp-bg { background: rgb(33, 150, 243); }
    .heating-bg { background: rgba(255, 152, 0, 0.7); }
    .setpoint-bg { background: rgba(255, 152, 0, 0.7); }
    .ext-temp-bg { background: rgb(25, 50, 100); }
  `}customElements.get("auto-tpi-learning-card")||customElements.define("auto-tpi-learning-card",ct);class dt extends ht{static properties={hass:{type:Object},config:{type:Object}};setConfig(t){this.config=t}_findLearningSensor(t){if(!this.hass||!t)return null;const e=t.replace("climate.",""),i=`sensor.${e}_auto_tpi_learning_state`;if(this.hass.states[i])return i;return Object.keys(this.hass.states).find(t=>t.startsWith("sensor.")&&t.includes(e)&&t.endsWith("_auto_tpi_learning_state"))||null}_climateChanged(t){const e=t.detail.value,i={...this.config};i.climate_entity=e;const s=this._findLearningSensor(e);if(s&&(i.learning_entity=s),!i.name&&e){const t=e.replace("climate.","").replace(/_/g," ");i.name=t.charAt(0).toUpperCase()+t.slice(1)}this._fireConfigChanged(i)}_learningChanged(t){const e={...this.config};e.learning_entity=t.detail.value,this._fireConfigChanged(e)}_nameChanged(t){const e={...this.config};e.name=t.target.value,this._fireConfigChanged(e)}_fireConfigChanged(t){const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}render(){return this.hass&&this.config?Z`
      <div class="card-config">
        <div class="option">
          <label>Nom</label>
          <input 
            type="text" 
            .value="${this.config.name||""}" 
            @input="${this._nameChanged}"
          >
        </div>
        
        <div class="option">
          <label>Entité Climate</label>
          <ha-entity-picker
            .hass="${this.hass}"
            .value="${this.config.climate_entity||""}"
            .includeDomains="${["climate"]}"
            @value-changed="${this._climateChanged}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="option">
          <label>Entité Learning (sensor)</label>
          <ha-entity-picker
            .hass="${this.hass}"
            .value="${this.config.learning_entity||""}"
            .includeDomains="${["sensor"]}"
            .entityFilter="${t=>t.includes("_auto_tpi_learning_state")}"
            @value-changed="${this._learningChanged}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>
      </div>
    `:Z``}static styles=n`
    .card-config {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    input {
      padding: 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }
    ha-entity-picker {
      width: 100%;
    }
  `}customElements.get("auto-tpi-learning-card-editor")||customElements.define("auto-tpi-learning-card-editor",dt),window.customCards=window.customCards||[],window.customCards.some(t=>"auto-tpi-learning-card"===t.type)||window.customCards.push({type:"auto-tpi-learning-card",name:"Auto-TPI Learning Card",description:"Visualization of Versatile Thermostat Auto-TPI learning process"});
