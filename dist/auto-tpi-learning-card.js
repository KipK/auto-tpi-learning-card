import{LitElement as t,html as e,svg as i,css as s}from"https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";class o extends t{static properties={hass:{type:Object},config:{type:Object},_history:{type:Object},_loading:{type:Boolean},_error:{type:String},_showTemp:{type:Boolean},_showHeating:{type:Boolean},_showSetpoint:{type:Boolean},_showKint:{type:Boolean},_showKext:{type:Boolean},_showExtTemp:{type:Boolean},_lastFetchTime:{type:Number},_lastStartDt:{type:String},_tooltip:{type:Object},_width:{type:Number},_zoomLevel:{type:Number},_panOffset:{type:Number},_isDragging:{type:Boolean},_dragStartX:{type:Number},_dragStartOffset:{type:Number},_yZoomLevel:{type:Number},_yPanOffset:{type:Number},_isYDragging:{type:Boolean},_dragStartY:{type:Number},_dragStartYOffset:{type:Number},_isPinching:{type:Boolean},_pinchStartDist:{type:Number},_pinchStartZoom:{type:Number},_pinchStartYZoom:{type:Number}};static getConfigElement(){return document.createElement("auto-tpi-learning-card-editor")}static getStubConfig(){return{learning_entity:"",climate_entity:"",name:""}}constructor(){super(),this._history=null,this._loading=!1,this._error=null,this._showTemp=!0,this._showHeating=!0,this._showSetpoint=!0,this._showKint=!0,this._showKext=!0,this._showExtTemp=!0,this._lastFetchTime=0,this._lastStartDt=null,this._tooltip=null,this._width=1,this._resizeObserver=null,this._zoomLevel=1,this._panOffset=0,this._isDragging=!1,this._dragStartX=0,this._dragStartOffset=0,this._yZoomLevel=1,this._yPanOffset=0,this._isYDragging=!1,this._dragStartY=0,this._dragStartYOffset=0}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(t=>{for(let e of t)e.contentRect.width>0&&(this._width=e.contentRect.width)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(t){if(!t.learning_entity)throw new Error("You need to define learning_entity");if(!t.climate_entity)throw new Error("You need to define climate_entity");this.config=t,this._history=null,this._lastFetchTime=0,this._lastStartDt=null}getCardSize(){}getLayoutOptions(){return{}}shouldUpdate(t){return!0}updated(t){if(super.updated(t),t.has("hass")&&this.hass&&this.config){const t=this.config.learning_entity,e=this.hass.states[t],i=e?.attributes?.learning_start_dt;i&&this._lastStartDt&&i!==this._lastStartDt&&(this._history=null),i&&(this._lastStartDt=i);const s=Date.now()-this._lastFetchTime>3e5;(!this._history||s)&&!this._loading&&this._fetchHistory()}}async _fetchHistory(){if(!this._loading&&this.hass&&this.config){this._loading=!0,this._error=null;try{const t=this.config.learning_entity,e=this.config.climate_entity,i=this.hass.states[t];let s,o=i?.attributes?.learning_start_dt;s=o?new Date(o):new Date(Date.now()-864e5);const n=s.toISOString(),a=(new Date).toISOString(),r=`history/period/${n}?filter_entity_id=${[t,e].join(",")}&end_time=${a}&significant_changes_only=0`,l=await this.hass.callApi("GET",r);this._processHistory(l,t,e,s),this._lastFetchTime=Date.now()}catch(t){console.error("Error fetching history:",t),this._error="Failed to fetch history data."}finally{this._loading=!1}}}_bisectLeft(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<e?i=o+1:s=o}return i}_bisectRight(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<=e?i=o+1:s=o}return i-1}_getVisibleData(t,e,i){if(!t||0===t.length)return[];let s=this._bisectLeft(t,e),o=this._bisectRight(t,i);return s=Math.max(0,s-1),o=Math.min(t.length-1,o+1),s>o?[]:t.slice(s,o+1)}_processHistory(t,e,i,s){if(!Array.isArray(t))return void(this._history={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[],startTime:s.getTime()});const o={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[]},n=(t,e,i)=>{const s=parseFloat(i);isNaN(s)||t.push({t:e,val:s})};for(const s of t){if(!s||0===s.length)continue;const t=s[0].entity_id,a=t===e;if(a||t===i)for(const t of s){const e=new Date(t.last_updated).getTime(),i=t.attributes;if(i)if(a)null!=i.calculated_coef_int&&n(o.kint,e,i.calculated_coef_int),null!=i.calculated_coef_ext&&n(o.kext,e,i.calculated_coef_ext);else{null!=i.current_temperature&&n(o.temp,e,i.current_temperature),null!=i.temperature&&n(o.setpoint,e,i.temperature);let t=null;null!=i.specific_states?.ext_current_temperature?t=i.specific_states.ext_current_temperature:null!=i.ext_current_temperature&&(t=i.ext_current_temperature),null!=t&&n(o.extTemp,e,t),void 0!==i.hvac_action&&o.heating.push({t:e,val:"heating"===i.hvac_action?1:0})}}}for(const t in o)o[t].sort((t,e)=>t.t-e.t);this._history={...o,startTime:s.getTime()}}_getLearningData(){const t=this.hass.states[this.config.learning_entity];return t?{state:t.state,kint:parseFloat(t.attributes.calculated_coef_int)||0,kext:parseFloat(t.attributes.calculated_coef_ext)||0,kintCycles:t.attributes.coeff_int_cycles||0,kextCycles:t.attributes.coeff_ext_cycles||0,confidence:parseFloat(t.attributes.model_confidence)||0,status:t.attributes.last_learning_status||"",learningStartDt:t.attributes.learning_start_dt||""}:null}_toggleTemp(){this._showTemp=!this._showTemp}_toggleHeating(){this._showHeating=!this._showHeating}_toggleSetpoint(){this._showSetpoint=!this._showSetpoint}_toggleKint(){this._showKint=!this._showKint}_toggleKext(){this._showKext=!this._showKext}_toggleExtTemp(){this._showExtTemp=!this._showExtTemp}_handleWheel(t){if(t.preventDefault(),!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=t.clientX-e.left,s=t.clientY-e.top,o=60,n=60,a=40,r=60,l=e.width-o-n,h=e.height-a-r,c=Math.max(0,Math.min(1,(i-o)/l)),p=Date.now(),d=this._history.startTime,g=Math.max(p-d,216e5),_=g/this._zoomLevel,f=d+this._panOffset+c*_,u=this._getYValueFromPosition(s,a,h),m=t.deltaY>0?.9:1.1,y=Math.max(1,Math.min(20,this._zoomLevel*m)),x=Math.max(1,Math.min(20,this._yZoomLevel*m));this._zoomLevel=y,this._yZoomLevel=x;const v=g/y;this._panOffset=f-d-c*v;const b=a+h/2,$=a+h-u*h;this._yPanOffset=s-(b+($-b)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._tooltip=null,this.requestUpdate()}_zoomIn(){this._zoomLevel=Math.min(20,1.2*this._zoomLevel),this._yZoomLevel=Math.min(20,1.2*this._yZoomLevel),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_zoomOut(){this._zoomLevel=Math.max(1,this._zoomLevel/1.2),this._yZoomLevel=Math.max(1,this._yZoomLevel/1.2),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_resetZoom(){this._zoomLevel=1,this._panOffset=0,this._yZoomLevel=1,this._yPanOffset=0}_clampPanOffset(){if(!this._history)return;const t=Date.now()-this._history.startTime,e=Math.max(t,216e5),i=e-e/this._zoomLevel;this._panOffset=Math.max(0,Math.min(i,this._panOffset))}_clampYPanOffset(){this._yPanOffset=Math.max(-1e4,Math.min(1e4,this._yPanOffset))}_applyYZoom(t,e,i){if(1===this._yZoomLevel&&0===this._yPanOffset)return t;const s=e+i/2;return s+(t-s)*this._yZoomLevel+this._yPanOffset}_getYValueFromPosition(t,e,i){const s=e+i/2;return(e+i-(s+(t-this._yPanOffset-s)/this._yZoomLevel))/i}_getSVGPoint(t,e,i){const s=t.createSVGPoint();return s.x=e,s.y=i,s.matrixTransform(t.getScreenCTM().inverse())}_handleTouchMove(t,e,i,s,o,n,a,r,l,h,c,p,d,g){t.preventDefault();const _=t.currentTarget,f=t.touches[0],{x:u,y:m}=this._getSVGPoint(_,f.clientX,f.clientY);this._processCursorMove(u,m,e,i,s,o,n,a,r,l,h,c,p,d,g)}_handleMouseMove(t,e,i,s,o,n,a,r,l,h,c,p,d,g){const _=t.currentTarget,{x:f,y:u}=this._getSVGPoint(_,t.clientX,t.clientY);this._processCursorMove(f,u,e,i,s,o,n,a,r,l,h,c,p,d,g)}_handleMouseDown(t){this._isDragging=!0,this._dragStartX=t.clientX,this._dragStartY=t.clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset,t.currentTarget.style.cursor="grabbing"}_handleMouseMove_Drag(t){if(!this._isDragging||!this._history)return;const e=60,i=60,s=t.currentTarget.getBoundingClientRect().width-e-i,o=this._dragStartX-t.clientX,n=this._dragStartY-t.clientY,a=Date.now(),r=this._history.startTime,l=o/s*(Math.max(a-r,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+l,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-n)}_handleMouseUp(t){this._isDragging=!1,t.currentTarget.style.cursor="default"}_handleTouchStart(t){if(1===t.touches.length)this._isDragging=!0,this._isPinching=!1,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset;else if(2===t.touches.length){this._isDragging=!1,this._isPinching=!0;const e=t.touches[0].clientX-t.touches[1].clientX,i=t.touches[0].clientY-t.touches[1].clientY;this._pinchStartDist=Math.hypot(e,i),this._pinchStartZoom=this._zoomLevel,this._pinchStartYZoom=this._yZoomLevel}}_handleTouchMove_Drag(t){if(!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=60,s=60,o=40,n=60,a=e.width-i-s,r=e.height-o-n;if(this._isDragging&&1===t.touches.length){t.preventDefault();const e=this._dragStartX-t.touches[0].clientX,i=this._dragStartY-t.touches[0].clientY,s=Date.now(),o=this._history.startTime,n=e/a*(Math.max(s-o,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+n,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-i)}else if(this._isPinching&&2===t.touches.length){t.preventDefault();const s=t.touches[0],n=t.touches[1],l=s.clientX-n.clientX,h=s.clientY-n.clientY,c=Math.hypot(l,h);if(this._pinchStartDist<=10)return;const p=c/this._pinchStartDist,d=(s.clientX+n.clientX)/2,g=(s.clientY+n.clientY)/2,_=d-e.left,f=g-e.top,u=Math.max(0,Math.min(1,(_-i)/a)),m=Date.now(),y=this._history.startTime,x=Math.max(m-y,216e5),v=x/this._zoomLevel,b=y+this._panOffset+u*v,$=this._getYValueFromPosition(f,o,r),w=Math.max(1,Math.min(20,this._pinchStartZoom*p)),k=Math.max(1,Math.min(20,this._pinchStartYZoom*p));this._zoomLevel=w,this._yZoomLevel=k;const M=x/w;this._panOffset=b-y-u*M;const O=o+r/2,S=o+r-$*r;this._yPanOffset=f-(O+(S-O)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}}_handleTouchEnd(t){0===t.touches.length?(this._isDragging=!1,this._isPinching=!1):1===t.touches.length&&this._isPinching&&(this._isPinching=!1,this._isDragging=!0,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset)}_processCursorMove(t,e,i,s,o,n,a,r,l,h,c,p,d,g,_){const f=t-a.left;if(f<0||f>o)return void(this._tooltip=null);const u=i+f/o*(s-i),m=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);return i>=0&&i<t.length?t[i].val:null},y=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);if(i<0)return t[0].val;if(i>=t.length-1)return t[t.length-1].val;const s=t[i],o=t[i+1],n=s.t,a=o.t,r=s.val,l=o.val;if(a===n)return r;return r+(l-r)*((e-n)/(a-n))},x=this._showKint?m(r,u):null,v=this._showKext?m(l,u):null,b=this._showTemp?y(h,u):null,$=this._showExtTemp?y(c,u):null,w=this._showSetpoint?m(p,u):null;let k=1/0,M=1/0,O=1/0,S=1/0,T=1/0;null!==x&&(k=d(x)),null!==v&&(M=g(v)),null!==b&&(O=_(b)),null!==$&&(S=_($)),null!==w&&(T=_(w));const D=Math.abs(e-k),L=Math.abs(e-M),z=Math.abs(e-O),Y=Math.abs(e-S),C=Math.abs(e-T);let P="kint",F=D;if(L<F&&(F=L,P="kext"),z<F&&(F=z,P="temp"),Y<F&&(F=Y,P="extTemp"),C<F&&(F=C,P="setpoint"),F>50)return void(this._tooltip=null);let Z=x,E="rgb(255, 235, 59)",K="Coef INT",X=k,N=4;"kext"===P?(Z=v,E="rgb(76, 175, 80)",K="Coef EXT",X=M):"temp"===P?(Z=b,E="rgb(33, 150, 243)",K="Température",X=O,N=1):"extTemp"===P?(Z=$,E="rgb(25, 50, 100)",K="Ext Temp",X=S,N=1):"setpoint"===P&&(Z=w,E="rgba(255, 152, 0, 0.8)",K="Consigne",X=T,N=1),this._tooltip=null!==Z?{x:t,y:e,t:u,value:Z,color:E,title:K,targetY:X,precision:N}:null}_handleMouseLeave(){this._tooltip=null}_renderTooltip(){if(!this._tooltip||null===this._tooltip.value)return e``;const t=new Date(this._tooltip.t).toLocaleString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}),{x:i,targetY:s}=this._tooltip,o=this._width>0?this._width:800,n=i>o/2;return e`
      <div class="tooltip" style="
        left: ${n?"auto":`${i+20}px`};
        right: ${n?o-i+20+"px":"auto"};
        top: ${`${s}px`};
        transform: ${"translate(0, -50%)"};
        border-left: 5px solid ${this._tooltip.color};
      ">
        <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 2px;">${this._tooltip.title}</div>
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 4px;">${t}</div>
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(this._tooltip.precision)}</div>
      </div>
    `}_renderChart(){if(this._loading)return e`<div class="loading">Loading history data...</div>`;if(this._error)return e`<div class="error">${this._error}</div>`;if(!this._history||0===this._history.kint.length&&0===this._history.kext.length)return e`<div class="no-data">No history data available</div>`;const{kint:t,kext:s,temp:o,heating:n,setpoint:a,extTemp:r}=this._history,l=this._width>0?this._width:800,h=300,c={top:40,right:60,bottom:60,left:60},p=l-c.left-c.right,d=h-c.top-c.bottom,g=Date.now();let _=this._history.startTime,f=g;const u=216e5,m=g-_;g-_<u&&(f=_+u);const y=Math.max(m,u)/this._zoomLevel;let x=_+this._panOffset,v=x+y;const b=t=>v===x?c.left:c.left+(t-x)/(v-x)*p;let $=0,w=1;if(t.length>0){let e=1/0,i=-1/0;for(let s=0;s<t.length;s++){const o=t[s].val;o<e&&(e=o),o>i&&(i=o)}$=Math.min(0,e),w=Math.max(1,i),w>1&&(w=Math.ceil(10*w)/10)}const k=t=>{const e=c.top+d-(t-$)/(w-$)*d;return this._applyYZoom(e,c.top,d)};let M=0,O=.1;if(s.length>0){let t=1/0,e=-1/0;for(let i=0;i<s.length;i++){const o=s[i].val;o<t&&(t=o),o>e&&(e=o)}M=Math.min(0,t),O=Math.max(.1,e),O>.1&&(O=Math.ceil(100*O)/100)}const S=t=>{const e=c.top+d-(t-M)/(O-M)*d;return this._applyYZoom(e,c.top,d)};let T=-20,D=40;const L=[...o,...r,...a];if(L.length>0){const t=Math.min(...L.map(t=>t.val)),e=Math.max(...L.map(t=>t.val));if(T=Math.max(-20,Math.floor(t-1)),D=Math.min(40,Math.ceil(e+1)),D-T<5){const t=(T+D)/2;T=Math.max(-20,t-2.5),D=Math.min(40,t+2.5)}}const z=t=>{if(D===T)return c.top+d/2;const e=c.top+d-(t-T)/(D-T)*d;return this._applyYZoom(e,c.top,d)},Y=(t,e)=>0===t.length?"":t.map((t,i)=>`${0===i?"M":"L"} ${b(t.t).toFixed(1)},${e(t.val).toFixed(1)}`).join(" "),C=(t,e)=>{if(0===t.length)return"";let i=`M ${b(t[0].t).toFixed(1)},${e(t[0].val).toFixed(1)}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${b(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${b(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const s=t[t.length-1],o=Date.now();return o>s.t&&(i+=` L ${b(o).toFixed(1)},${e(s.val).toFixed(1)}`),i},P=this._showKint?this._getVisibleData(t,x,v):[],F=this._showKext?this._getVisibleData(s,x,v):[],Z=this._showTemp?this._getVisibleData(o,x,v):[],E=this._showExtTemp?this._getVisibleData(r,x,v):[],K=this._showSetpoint?this._getVisibleData(a,x,v):[],X=P.length>0?C(P,k):"",N=F.length>0?C(F,S):"",H=Z.length>0?Y(Z,z):"",V=E.length>0?Y(E,z):"",B=K.length>0?C(K,z):"",R=K.length>0?((t,e)=>{if(0===t.length)return"";let i=`M ${b(t[0].t).toFixed(1)},${c.top+d}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${b(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${b(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const s=t[t.length-1],o=Date.now();return o>s.t&&(i+=` L ${b(o).toFixed(1)},${e(s.val).toFixed(1)}`),i+=` L ${b(t[t.length-1].t).toFixed(1)},${c.top+d}`,i+=` L ${b(t[0].t).toFixed(1)},${c.top+d} Z`,i})(K,z):"",j=[];if(this._showHeating&&n.length>0){const t=c.left,e=l-c.right,s=c.top+d;let o=this._bisectLeft(n,x),a=this._bisectRight(n,v);o=Math.max(0,o-1),a=Math.min(n.length-1,a+1);for(let r=o;r<=a;r++)if(n[r]&&1===n[r].val){const o=n[r].t;let a;if(a=r<n.length-1?n[r+1].t:Date.now(),a<x||o>v)continue;const l=b(o),h=b(a),c=Math.max(t,Math.min(l,h)),p=Math.min(e,Math.max(l,h))-c;p>0&&j.push(i`
              <rect
                x="${c}"
                y="${s-20}"
                width="${p}"
                height="20"
                fill="rgba(255, 152, 0, 0.5)"
                clip-path="url(#chart-clip)"
              />
            `)}}const A=[],U=w>2?.5:.25;for(let t=Math.ceil($/U)*U;t<=w+.001;t+=U)A.push(t);const I=A.map(t=>{const e=k(t);return i`
        <line 
          x1="${c.left}" y1="${e}" 
          x2="${l-c.right}" y2="${e}" 
          stroke="var(--divider-color, #444)" 
          stroke-width="1" 
          opacity="0.3" 
        />
        <text 
          x="${c.left-8}" y="${e+5}"
          text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9"
        >${t.toFixed(2)}</text>
      `}),G=[],W=O>.5?.1:.05;for(let t=Math.ceil(M/W)*W;t<=O+1e-4;t+=W)G.push(t);const q=G.map(t=>{const e=S(t);return i`
        <text 
          x="${l-c.right+8}" y="${e+5}"
          text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9"
        >${t.toFixed(2)}</text>
      `}),J=[],Q=(v-x)/5,tt=[36e5,72e5,108e5,144e5,216e5,432e5,864e5];let et=tt[tt.length-1];for(const t of tt)if(Q<=t){et=t;break}const it=new Date(x);it.setMinutes(0,0,0),it.getTime()<x&&it.setTime(it.getTime()+36e5);let st=it.getTime();for(;st<=v;){const t=new Date(st),e=t.getHours();if(e%(et/36e5)===0){const s=b(st),o=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`;let n="";if(0===e){const e={day:"numeric",month:"short"};n=t.toLocaleDateString("fr-FR",e)}J.push(i`
            <line 
              x1="${s}" y1="${c.top+d}" 
              x2="${s}" y2="${c.top+d+5}" 
              stroke="#aaa" stroke-width="1" 
            />
            <text 
              x="${s}" y="${282}"
              text-anchor="middle" font-size="12" fill="#aaa"
            >${o}</text>
            ${n?i`<text x="${s}" y="${296}" text-anchor="middle" font-size="10" fill="#888">${n}</text>`:""}
          `)}st+=36e5}let ot=i``;if(this._tooltip&&null!==this._tooltip.value){const t=this._tooltip.x,e=this._tooltip.targetY;ot=i`
        <g style="pointer-events: none;">
          <line
            x1="${t}" y1="${c.top}"
            x2="${t}" y2="${h-c.bottom}"
            stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3"
          />
          <circle cx="${t}" cy="${e}" r="6" fill="white" stroke="${this._tooltip.color}" stroke-width="3" />
        </g>
      `}return e`
      <svg
        width="100%" 
        height="${h}" 
        viewBox="0 0 ${l} ${h}"
        preserveAspectRatio="xMidYMid meet"
        style="cursor: ${this._isDragging?"grabbing":"default"}; overflow: hidden; touch-action: none;"
        @wheel="${t=>this._handleWheel(t)}"
        @mousedown="${t=>this._handleMouseDown(t)}"
        @mousemove="${e=>{this._handleMouseMove_Drag(e),this._isDragging||this._handleMouseMove(e,x,v,p,d,c,t,s,o,r,a,k,S,z)}}"
        @mouseup="${t=>this._handleMouseUp(t)}"
        @mouseleave="${t=>{this._handleMouseUp(t),this._handleMouseLeave()}}"
        @touchstart="${t=>this._handleTouchStart(t)}"
        @touchmove="${e=>{this._handleTouchMove_Drag(e),this._isDragging||this._isPinching||this._handleTouchMove(e,x,v,p,d,c,t,s,o,r,a,k,S,z)}}"
        @touchend="${t=>this._handleTouchEnd(t)}"
      >
        <defs>
          <clipPath id="chart-clip">
            <rect x="${c.left}" y="${c.top}" width="${p}" height="${d}" />
          </clipPath>
        </defs>

        ${I}
        ${q}
        ${J}

        <rect
          x="${c.left}" y="${c.top}"
          width="${p}" height="${d}"
          fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5"
        />

        ${j}
        ${R?i`<path d="${R}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
        ${B?i`<path d="${B}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
        ${H?i`<path d="${H}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
        ${V?i`<path d="${V}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
        ${N?i`<path d="${N}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
        ${X?i`<path d="${X}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}

        ${ot}
    </svg>
    `}render(){if(!this.hass||!this.config)return e``;const t=this._getLearningData();if(!t)return e`
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${this.config.learning_entity}</p>
          </div>
        </ha-card>
      `;const i=Math.round(100*t.confidence),s="Active"===t.state,o=s?"Active":"Off",n=t.status||"Waiting for update...";return e`
      <ha-card>
        <div class="card-content">
          <div class="header">${this.config.name||"Auto-TPI Learning"}</div>

          <div class="telemetry">
            <div class="telem-line">
              <span class="label">State:</span>
              <span style="${s?"color: var(--success-color, #4CAF50); font-weight: bold;":""}">${o}</span>
              &nbsp;|&nbsp;
              <span class="label">Confidence:</span> ${i}%
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
              ${n}
            </div>
          </div>

          <div class="chart-container">
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
    `}static styles=s`
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
    .header {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .telemetry {
      margin-bottom: 16px;
      background: rgba(0,0,0,0.1);
      padding: 8px;
      border-radius: 8px;
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
      margin-bottom: 8px;
      overflow: hidden;
    }
    .zoom-controls {
      position: absolute;
      top: -5px;
      right: 0px;
      display: flex;
      gap: 4px;
      z-index: 5;
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: 0px;
      padding: 4px;
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
      gap: 16px;
      font-size: 12px;
      margin-top: 8px;
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
  `}customElements.define("auto-tpi-learning-card",o);class n extends t{static properties={hass:{type:Object},config:{type:Object}};setConfig(t){this.config=t}_findLearningSensor(t){if(!this.hass||!t)return null;const e=t.replace("climate.",""),i=`sensor.${e}_auto_tpi_learning_state`;if(this.hass.states[i])return i;return Object.keys(this.hass.states).find(t=>t.startsWith("sensor.")&&t.includes(e)&&t.endsWith("_auto_tpi_learning_state"))||null}_climateChanged(t){const e=t.detail.value,i={...this.config};i.climate_entity=e;const s=this._findLearningSensor(e);if(s&&(i.learning_entity=s),!i.name&&e){const t=e.replace("climate.","").replace(/_/g," ");i.name=t.charAt(0).toUpperCase()+t.slice(1)}this._fireConfigChanged(i)}_learningChanged(t){const e={...this.config};e.learning_entity=t.detail.value,this._fireConfigChanged(e)}_nameChanged(t){const e={...this.config};e.name=t.target.value,this._fireConfigChanged(e)}_fireConfigChanged(t){const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}render(){return this.hass&&this.config?e`
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
    `:e``}static styles=s`
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
  `}customElements.define("auto-tpi-learning-card-editor",n),window.customCards=window.customCards||[],window.customCards.push({type:"auto-tpi-learning-card",name:"Auto-TPI Learning Card",description:"Visualization of Versatile Thermostat Auto-TPI learning process"});
