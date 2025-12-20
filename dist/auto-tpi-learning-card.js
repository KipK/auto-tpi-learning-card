import{LitElement as t,html as e,svg as i,css as s}from"https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";class n extends t{static properties={hass:{type:Object},config:{type:Object},_history:{type:Object},_loading:{type:Boolean},_error:{type:String},_showTemp:{type:Boolean},_showHeating:{type:Boolean},_showSetpoint:{type:Boolean},_showKint:{type:Boolean},_showKext:{type:Boolean},_showExtTemp:{type:Boolean},_lastFetchTime:{type:Number},_lastStartDt:{type:String},_tooltip:{type:Object},_width:{type:Number},_zoomLevel:{type:Number},_panOffset:{type:Number},_isDragging:{type:Boolean},_dragStartX:{type:Number},_dragStartOffset:{type:Number},_yZoomLevel:{type:Number},_yPanOffset:{type:Number},_isYDragging:{type:Boolean},_dragStartY:{type:Number},_dragStartYOffset:{type:Number},_isPinching:{type:Boolean},_pinchStartDist:{type:Number},_pinchStartZoom:{type:Number},_pinchStartYZoom:{type:Number},_resetChecked:{type:Boolean}};static getConfigElement(){return document.createElement("auto-tpi-learning-card-editor")}static getStubConfig(){return{learning_entity:"",climate_entity:"",name:""}}constructor(){super(),this._history=null,this._loading=!1,this._error=null,this._showTemp=!0,this._showHeating=!0,this._showSetpoint=!0,this._showKint=!0,this._showKext=!0,this._showExtTemp=!0,this._lastFetchTime=0,this._lastStartDt=null,this._tooltip=null,this._width=1,this._resizeObserver=null,this._zoomLevel=1,this._panOffset=0,this._isDragging=!1,this._dragStartX=0,this._dragStartOffset=0,this._yZoomLevel=1,this._yPanOffset=0,this._isYDragging=!1,this._dragStartY=0,this._dragStartYOffset=0,this._resetChecked=!1}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(t=>{for(let e of t)e.contentRect.width>0&&(this._width=e.contentRect.width)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(t){if(!t.learning_entity)throw new Error("You need to define learning_entity");if(!t.climate_entity)throw new Error("You need to define climate_entity");this.config=t,this._history=null,this._lastFetchTime=0,this._lastStartDt=null}getCardSize(){}getLayoutOptions(){return{}}shouldUpdate(t){return!0}willUpdate(t){(t.has("_width")||t.has("_zoomLevel")||t.has("_panOffset")||t.has("_yZoomLevel")||t.has("_yPanOffset")||t.has("_history"))&&(this._chartState=null,this._staticChartContent=null),(t.has("_showTemp")||t.has("_showHeating")||t.has("_showSetpoint")||t.has("_showKint")||t.has("_showKext")||t.has("_showExtTemp"))&&(this._staticChartContent=null)}updated(t){if(super.updated(t),t.has("hass")&&this.hass&&this.config){const t=this.config.learning_entity,e=this.hass.states[t],i=e?.attributes?.learning_start_dt;i&&this._lastStartDt&&i!==this._lastStartDt&&(this._history=null),i&&(this._lastStartDt=i);const s=Date.now()-this._lastFetchTime>3e5;(!this._history||s)&&!this._loading&&this._fetchHistory()}}async _fetchHistory(){if(!this._loading&&this.hass&&this.config){this._loading=!0,this._error=null;try{const t=this.config.learning_entity,e=this.config.climate_entity,i=this.hass.states[t];let s,n=i?.attributes?.learning_start_dt;s=n?new Date(n):new Date(Date.now()-864e5);const o=s.toISOString(),a=(new Date).toISOString(),r=`history/period/${o}?filter_entity_id=${[t,e].join(",")}&end_time=${a}&significant_changes_only=0`,h=await this.hass.callApi("GET",r);this._processHistory(h,t,e,s),this._lastFetchTime=Date.now()}catch(t){console.error("Error fetching history:",t),this._error="Failed to fetch history data."}finally{this._loading=!1}}}_bisectLeft(t,e){let i=0,s=t.length;for(;i<s;){const n=i+s>>>1;t[n].t<e?i=n+1:s=n}return i}_bisectRight(t,e){let i=0,s=t.length;for(;i<s;){const n=i+s>>>1;t[n].t<=e?i=n+1:s=n}return i-1}_getVisibleData(t,e,i){if(!t||0===t.length)return[];let s=this._bisectLeft(t,e),n=this._bisectRight(t,i);return s=Math.max(0,s-1),n=Math.min(t.length-1,n+1),s>n?[]:t.slice(s,n+1)}_processHistory(t,e,i,s){if(!Array.isArray(t))return void(this._history={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[],startTime:s.getTime()});const n={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[]},o=(t,e,i)=>{const s=parseFloat(i);isNaN(s)||t.push({t:e,val:s})};for(const s of t){if(!s||0===s.length)continue;const t=s[0].entity_id,a=t===e;if(a||t===i)for(const t of s){const e=new Date(t.last_updated).getTime(),i=t.attributes;if(i)if(a)null!=i.calculated_coef_int&&o(n.kint,e,i.calculated_coef_int),null!=i.calculated_coef_ext&&o(n.kext,e,i.calculated_coef_ext);else{null!=i.current_temperature&&o(n.temp,e,i.current_temperature),null!=i.temperature&&o(n.setpoint,e,i.temperature);let t=null;null!=i.specific_states?.ext_current_temperature?t=i.specific_states.ext_current_temperature:null!=i.ext_current_temperature&&(t=i.ext_current_temperature),null!=t&&o(n.extTemp,e,t),void 0!==i.hvac_action&&n.heating.push({t:e,val:"heating"===i.hvac_action?1:0})}}}for(const t in n)n[t].sort((t,e)=>t.t-e.t);this._history={...n,startTime:s.getTime()}}_getLearningData(){const t=this.hass.states[this.config.learning_entity];return t?{state:t.state,kint:parseFloat(t.attributes.calculated_coef_int)||0,kext:parseFloat(t.attributes.calculated_coef_ext)||0,kintCycles:t.attributes.coeff_int_cycles||0,kextCycles:t.attributes.coeff_ext_cycles||0,confidence:parseFloat(t.attributes.model_confidence)||0,status:t.attributes.last_learning_status||"",learningStartDt:t.attributes.learning_start_dt||"",learningDone:t.attributes.learning_done}:null}_toggleAutoTpi(t){this.hass&&this.config&&(t?this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!1,reinitialise:!1}):this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!0,reinitialise:this._resetChecked}),this._resetChecked=!1)}_toggleResetCheckbox(){this._resetChecked=!this._resetChecked,this.requestUpdate()}_toggleHeating(){this._showHeating=!this._showHeating}_toggleSetpoint(){this._showSetpoint=!this._showSetpoint}_toggleKint(){this._showKint=!this._showKint}_toggleKext(){this._showKext=!this._showKext}_toggleExtTemp(){this._showExtTemp=!this._showExtTemp}_toggleTemp(){this._showTemp=!this._showTemp}_handleWheel(t){if(t.preventDefault(),!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=t.clientX-e.left,s=t.clientY-e.top,n=60,o=60,a=40,r=60,h=e.width-n-o,l=e.height-a-r,c=Math.max(0,Math.min(1,(i-n)/h)),p=Date.now(),d=this._history.startTime,_=Math.max(p-d,216e5),g=_/this._zoomLevel,f=d+this._panOffset+c*g,u=this._getYValueFromPosition(s,a,l),m=t.deltaY>0?.9:1.1,y=Math.max(1,Math.min(20,this._zoomLevel*m)),x=Math.max(1,Math.min(20,this._yZoomLevel*m));this._zoomLevel=y,this._yZoomLevel=x;const v=_/y;this._panOffset=f-d-c*v;const b=a+l/2,w=a+l-u*l;this._yPanOffset=s-(b+(w-b)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._tooltip=null,this.requestUpdate()}_zoomIn(){this._zoomLevel=Math.min(20,1.2*this._zoomLevel),this._yZoomLevel=Math.min(20,1.2*this._yZoomLevel),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_zoomOut(){this._zoomLevel=Math.max(1,this._zoomLevel/1.2),this._yZoomLevel=Math.max(1,this._yZoomLevel/1.2),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_resetZoom(){this._zoomLevel=1,this._panOffset=0,this._yZoomLevel=1,this._yPanOffset=0}_clampPanOffset(){if(!this._history)return;const t=Date.now()-this._history.startTime,e=Math.max(t,216e5),i=e-e/this._zoomLevel;this._panOffset=Math.max(0,Math.min(i,this._panOffset))}_clampYPanOffset(){this._yPanOffset=Math.max(-1e4,Math.min(1e4,this._yPanOffset))}_applyYZoom(t,e,i){if(1===this._yZoomLevel&&0===this._yPanOffset)return t;const s=e+i/2;return s+(t-s)*this._yZoomLevel+this._yPanOffset}_getYValueFromPosition(t,e,i){const s=e+i/2;return(e+i-(s+(t-this._yPanOffset-s)/this._yZoomLevel))/i}_getSVGPoint(t,e,i){const s=t.createSVGPoint();return s.x=e,s.y=i,s.matrixTransform(t.getScreenCTM().inverse())}_handleTouchMove(t){t.preventDefault();const e=t.currentTarget,i=t.touches[0],{x:s,y:n}=this._getSVGPoint(e,i.clientX,i.clientY);this._processCursorMove(s,n)}_handleMouseMove(t){const e=t.currentTarget,{x:i,y:s}=this._getSVGPoint(e,t.clientX,t.clientY);this._processCursorMove(i,s)}_handleMouseDown(t){this._isDragging=!0,this._dragStartX=t.clientX,this._dragStartY=t.clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset,t.currentTarget.style.cursor="grabbing"}_handleMouseMove_Drag(t){if(!this._isDragging||!this._history)return;const e=60,i=60,s=t.currentTarget.getBoundingClientRect().width-e-i,n=this._dragStartX-t.clientX,o=this._dragStartY-t.clientY,a=Date.now(),r=this._history.startTime,h=n/s*(Math.max(a-r,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+h,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-o)}_handleMouseUp(t){this._isDragging=!1,t.currentTarget.style.cursor="default"}_handleTouchStart(t){if(1===t.touches.length)this._isDragging=!0,this._isPinching=!1,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset;else if(2===t.touches.length){this._isDragging=!1,this._isPinching=!0;const e=t.touches[0].clientX-t.touches[1].clientX,i=t.touches[0].clientY-t.touches[1].clientY;this._pinchStartDist=Math.hypot(e,i),this._pinchStartZoom=this._zoomLevel,this._pinchStartYZoom=this._yZoomLevel}}_handleTouchMove_Drag(t){if(!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=60,s=60,n=40,o=60,a=e.width-i-s,r=e.height-n-o;if(this._isDragging&&1===t.touches.length){t.preventDefault();const e=this._dragStartX-t.touches[0].clientX,i=this._dragStartY-t.touches[0].clientY,s=Date.now(),n=this._history.startTime,o=e/a*(Math.max(s-n,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+o,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-i)}else if(this._isPinching&&2===t.touches.length){t.preventDefault();const s=t.touches[0],o=t.touches[1],h=s.clientX-o.clientX,l=s.clientY-o.clientY,c=Math.hypot(h,l);if(this._pinchStartDist<=10)return;const p=c/this._pinchStartDist,d=(s.clientX+o.clientX)/2,_=(s.clientY+o.clientY)/2,g=d-e.left,f=_-e.top,u=Math.max(0,Math.min(1,(g-i)/a)),m=Date.now(),y=this._history.startTime,x=Math.max(m-y,216e5),v=x/this._zoomLevel,b=y+this._panOffset+u*v,w=this._getYValueFromPosition(f,n,r),$=Math.max(1,Math.min(20,this._pinchStartZoom*p)),k=Math.max(1,Math.min(20,this._pinchStartYZoom*p));this._zoomLevel=$,this._yZoomLevel=k;const M=x/$;this._panOffset=b-y-u*M;const S=n+r/2,T=n+r-w*r;this._yPanOffset=f-(S+(T-S)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}}_handleTouchEnd(t){0===t.touches.length?(this._isDragging=!1,this._isPinching=!1):1===t.touches.length&&this._isPinching&&(this._isPinching=!1,this._isDragging=!0,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset)}_processCursorMove(t,e){if(!this._chartState)return;const{xMin:i,xMax:s,chartWidth:n,chartHeight:o,padding:a,kint:r,kext:h,temp:l,extTemp:c,setpoint:p,getY_Kint:d,getY_Kext:_,getY_Temp:g}=this._chartState,f=t-a.left;if(f<0||f>n)return void(this._tooltip=null);const u=i+f/n*(s-i),m=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);return i>=0&&i<t.length?t[i].val:null},y=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);if(i<0)return t[0].val;if(i>=t.length-1)return t[t.length-1].val;const s=t[i],n=t[i+1],o=s.t,a=n.t,r=s.val,h=n.val;if(a===o)return r;return r+(h-r)*((e-o)/(a-o))},x=this._showKint?m(r,u):null,v=this._showKext?m(h,u):null,b=this._showTemp?y(l,u):null,w=this._showExtTemp?y(c,u):null,$=this._showSetpoint?m(p,u):null;let k=1/0,M=1/0,S=1/0,T=1/0,O=1/0;null!==x&&(k=d(x)),null!==v&&(M=_(v)),null!==b&&(S=g(b)),null!==w&&(T=g(w)),null!==$&&(O=g($));const C=Math.abs(e-k),L=Math.abs(e-M),D=Math.abs(e-S),Y=Math.abs(e-T),z=Math.abs(e-O);let P="kint",F=C;if(L<F&&(F=L,P="kext"),D<F&&(F=D,P="temp"),Y<F&&(F=Y,P="extTemp"),z<F&&(F=z,P="setpoint"),F>50)return void(this._tooltip=null);let Z=x,K="rgb(255, 235, 59)",E="Coef INT",X=k,H=4;"kext"===P?(Z=v,K="rgb(76, 175, 80)",E="Coef EXT",X=M):"temp"===P?(Z=b,K="rgb(33, 150, 243)",E="Température",X=S,H=1):"extTemp"===P?(Z=w,K="rgb(25, 50, 100)",E="Ext Temp",X=T,H=1):"setpoint"===P&&(Z=$,K="rgba(255, 152, 0, 0.8)",E="Consigne",X=O,H=1),this._tooltip=null!==Z?{x:t,y:e,t:u,value:Z,color:K,title:E,targetY:X,precision:H}:null}_handleMouseLeave(){this._tooltip=null}_renderTooltip(){if(!this._tooltip||null===this._tooltip.value)return e``;const t=new Date(this._tooltip.t).toLocaleString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}),{x:i,targetY:s}=this._tooltip,n=this._width>0?this._width:800,o=i>n/2;return e`
      <div class="tooltip" style="
        left: ${o?"auto":`${i+20}px`};
        right: ${o?n-i+20+"px":"auto"};
        top: ${`${s}px`};
        transform: ${"translate(0, -50%)"};
        border-left: 5px solid ${this._tooltip.color};
      ">
        <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 2px;">${this._tooltip.title}</div>
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 4px;">${t}</div>
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(this._tooltip.precision)}</div>
      </div>
    `}_calculateChartState(){if(!this._history)return null;const{kint:t,kext:e,temp:i,heating:s,setpoint:n,extTemp:o}=this._history,a=this._width>0?this._width:800,r={top:10,right:60,bottom:40,left:60},h=a-r.left-r.right,l=300-r.top-r.bottom,c=Date.now();let p=this._history.startTime,d=c;const _=216e5,g=c-p;c-p<_&&(d=p+_);const f=Math.max(g,_)/this._zoomLevel;let u=p+this._panOffset,m=u+f;let y=0,x=1;if(t.length>0){let e=1/0,i=-1/0;for(const s of t)s.val<e&&(e=s.val),s.val>i&&(i=s.val);y=Math.min(0,e),x=Math.max(1,i),x>1&&(x=Math.ceil(10*x)/10)}let v=0,b=.1;if(e.length>0){let t=1/0,i=-1/0;for(const s of e)s.val<t&&(t=s.val),s.val>i&&(i=s.val);v=Math.min(0,t),b=Math.max(.1,i),b>.1&&(b=Math.ceil(100*b)/100)}let w=-20,$=40;const k=[...i,...o,...n];if(k.length>0){const t=Math.min(...k.map(t=>t.val)),e=Math.max(...k.map(t=>t.val));if(w=Math.max(-20,Math.floor(t-1)),$=Math.min(40,Math.ceil(e+1)),$-w<5){const t=(w+$)/2;w=Math.max(-20,t-2.5),$=Math.min(40,t+2.5)}}return{width:a,height:300,padding:r,chartWidth:h,chartHeight:l,xMin:u,xMax:m,getX:t=>m===u?r.left:r.left+(t-u)/(m-u)*h,getY_Kint:t=>{const e=r.top+l-(t-y)/(x-y)*l;return this._applyYZoom(e,r.top,l)},getY_Kext:t=>{const e=r.top+l-(t-v)/(b-v)*l;return this._applyYZoom(e,r.top,l)},getY_Temp:t=>{if($===w)return r.top+l/2;const e=r.top+l-(t-w)/($-w)*l;return this._applyYZoom(e,r.top,l)},kintMin:y,kintMax:x,kextMin:v,kextMax:b,kint:t,kext:e,temp:i,heating:s,setpoint:n,extTemp:o}}_generateStaticContent(t){if(!t)return i``;const{width:e,height:s,padding:n,chartWidth:o,chartHeight:a,xMin:r,xMax:h,getX:l,getY_Kint:c,getY_Kext:p,getY_Temp:d,kintMin:_,kintMax:g,kextMin:f,kextMax:u,kint:m,kext:y,temp:x,heating:v,setpoint:b,extTemp:w}=t,$=(t,e)=>0===t.length?"":t.map((t,i)=>`${0===i?"M":"L"} ${l(t.t).toFixed(1)},${e(t.val).toFixed(1)}`).join(" "),k=(t,e)=>{if(0===t.length)return"";let i=`M ${l(t[0].t).toFixed(1)},${e(t[0].val).toFixed(1)}`;for(let s=0;s<t.length-1;s++){const n=t[s],o=t[s+1];i+=` L ${l(o.t).toFixed(1)},${e(n.val).toFixed(1)}`,i+=` L ${l(o.t).toFixed(1)},${e(o.val).toFixed(1)}`}const s=t[t.length-1],n=Date.now();return n>s.t&&(i+=` L ${l(n).toFixed(1)},${e(s.val).toFixed(1)}`),i},M=this._showKint?this._getVisibleData(m,r,h):[],S=this._showKext?this._getVisibleData(y,r,h):[],T=this._showTemp?this._getVisibleData(x,r,h):[],O=this._showExtTemp?this._getVisibleData(w,r,h):[],C=this._showSetpoint?this._getVisibleData(b,r,h):[],L=M.length>0?k(M,c):"",D=S.length>0?k(S,p):"",Y=T.length>0?$(T,d):"",z=O.length>0?$(O,d):"",P=C.length>0?k(C,d):"",F=C.length>0?((t,e)=>{if(0===t.length)return"";let i=`M ${l(t[0].t).toFixed(1)},${n.top+a}`;for(let s=0;s<t.length-1;s++){const n=t[s],o=t[s+1];i+=` L ${l(o.t).toFixed(1)},${e(n.val).toFixed(1)}`,i+=` L ${l(o.t).toFixed(1)},${e(o.val).toFixed(1)}`}const s=t[t.length-1],o=Date.now();return o>s.t&&(i+=` L ${l(o).toFixed(1)},${e(s.val).toFixed(1)}`),i+=` L ${l(t[t.length-1].t).toFixed(1)},${n.top+a}`,i+=` L ${l(t[0].t).toFixed(1)},${n.top+a} Z`,i})(C,d):"",Z=[];if(this._showHeating&&v.length>0){const t=e-n.right;let s=this._bisectLeft(v,r),o=this._bisectRight(v,h);s=Math.max(0,s-1),o=Math.min(v.length-1,o+1);for(let e=s;e<=o;e++)if(v[e]&&1===v[e].val){const s=v[e].t,o=e<v.length-1?v[e+1].t:Date.now();if(o<r||s>h)continue;const c=l(s),p=l(o),d=Math.max(n.left,Math.min(c,p)),_=Math.min(t,Math.max(c,p))-d;_>0&&Z.push(i`
              <rect
                x="${d}"
                y="${n.top+a-20}"
                width="${_}"
                height="20"
                fill="rgba(255, 152, 0, 0.5)"
                clip-path="url(#chart-clip)"
              />
            `)}}const K=[],E=g>2?.5:.25;for(let t=Math.ceil(_/E)*E;t<=g+.001;t+=E)K.push(t);const X=K.map(t=>{const s=c(t);return i`
        <line x1="${n.left}" y1="${s}" x2="${e-n.right}" y2="${s}" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.3" />
        <text x="${n.left-8}" y="${s+5}" text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9">${t.toFixed(2)}</text>
      `}),H=[],R=u>.5?.1:.05;for(let t=Math.ceil(f/R)*R;t<=u+1e-4;t+=R)H.push(t);const N=H.map(t=>{const s=p(t);return i`
        <text x="${e-n.right+8}" y="${s+5}" text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9">${t.toFixed(2)}</text>
      `}),B=[],j=(h-r)/5,V=[36e5,72e5,108e5,144e5,216e5,432e5,864e5];let A=V.find(t=>j<=t)||V[V.length-1];const U=new Date(r);U.setMinutes(0,0,0),U.getTime()<r&&U.setTime(U.getTime()+36e5);let I=U.getTime();for(;I<=h;){const t=new Date(I),e=t.getHours();if(e%(A/36e5)===0){const o=l(I),r=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`;let h="";if(0===e){const e={day:"numeric",month:"short"};h=t.toLocaleDateString("fr-FR",e)}B.push(i`
          <line x1="${o}" y1="${n.top+a}" x2="${o}" y2="${n.top+a+5}" stroke="#aaa" stroke-width="1" />
          <text x="${o}" y="${s-18}" text-anchor="middle" font-size="12" fill="#aaa">${r}</text>
          ${h?i`<text x="${o}" y="${s-4}" text-anchor="middle" font-size="10" fill="#888">${h}</text>`:""}
        `)}I+=36e5}return i`
      <defs>
        <clipPath id="chart-clip">
          <rect x="${n.left}" y="${n.top}" width="${o}" height="${a}" />
        </clipPath>
      </defs>

      ${X}
      ${N}
      ${B}

      <rect x="${n.left}" y="${n.top}" width="${o}" height="${a}" fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5" />

      ${Z}
      ${F?i`<path d="${F}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${P?i`<path d="${P}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${Y?i`<path d="${Y}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${z?i`<path d="${z}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${D?i`<path d="${D}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${L?i`<path d="${L}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
    `}_renderChart(){if(this._loading)return e`<div class="loading">Loading history data...</div>`;if(this._error)return e`<div class="error">${this._error}</div>`;if(!this._history||0===this._history.kint.length&&0===this._history.kext.length)return e`<div class="no-data">No history data available</div>`;this._chartState||(this._chartState=this._calculateChartState()),!this._staticChartContent&&this._chartState&&(this._staticChartContent=this._generateStaticContent(this._chartState));const{height:t,width:s}=this._chartState,n=this._chartState.padding;let o=i``;if(this._tooltip&&null!==this._tooltip.value){const e=this._tooltip.x,s=this._tooltip.targetY;o=i`
        <g style="pointer-events: none;">
          <line x1="${e}" y1="${n.top}" x2="${e}" y2="${t-n.bottom}" stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3" />
          <circle cx="${e}" cy="${s}" r="6" fill="white" stroke="${this._tooltip.color}" stroke-width="3" />
        </g>
      `}return e`
      <svg
        width="100%"
        height="${t}"
        viewBox="0 0 ${s} ${t}"
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
        ${o}
      </svg>
    `}render(){if(!this.hass||!this.config)return e``;const t=this._getLearningData();if(!t)return e`
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${this.config.learning_entity}</p>
          </div>
        </ha-card>
      `;const i=Math.round(100*t.confidence),s="Active"===t.state,n=s?"Active":"Off",o=t.status||"Waiting for update...",a=s?"Stop Learning":"Start Learning",r=s?"mdi:stop":"mdi:play";return e`
      <ha-card>
        <div class="card-content">
          <div class="header-row">
            <div class="header-title">${this.config.name||"Auto-TPI Learning"}</div>
            
            <div class="controls-container">
               ${s?"":e`
                <div class="checkbox-container" @click="${()=>this._toggleResetCheckbox()}">
                  <ha-checkbox
                    .checked=${this._resetChecked}
                    style="pointer-events: none;"
                  ></ha-checkbox>
                  <span class="checkbox-label">Reset</span>
                </div>
              `}

              <mwc-button
                @click=${()=>this._toggleAutoTpi(s)}
                class="${s?"stop-btn":"start-btn"}"
                dense
                raised
              >
                <ha-icon icon="${r}" style="margin-right: 4px;"></ha-icon>
                ${a}
              </mwc-button>
            </div>
          </div>

          <div class="telemetry">
            <div class="telemetry-content">
              <div class="telem-line">
                <span class="label">State:</span>
                <span style="${s?"color: var(--success-color, #4CAF50); font-weight: bold;":""}">${n}</span>
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
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 16px;
      font-weight: 500;
    }
    .controls-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .checkbox-label {
      font-size: 14px;
      margin-left: 4px;
    }

    /* Button Colors */
    mwc-button.start-btn {
      --mdc-theme-primary: var(--success-color, #4CAF50);
      --mdc-theme-on-primary: white;
      cursor: pointer;
    }
    mwc-button.stop-btn {
      --mdc-theme-primary: var(--error-color, #F44336);
      --mdc-theme-on-primary: white;
      cursor: pointer;
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
  `}customElements.define("auto-tpi-learning-card",n);class o extends t{static properties={hass:{type:Object},config:{type:Object}};setConfig(t){this.config=t}_findLearningSensor(t){if(!this.hass||!t)return null;const e=t.replace("climate.",""),i=`sensor.${e}_auto_tpi_learning_state`;if(this.hass.states[i])return i;return Object.keys(this.hass.states).find(t=>t.startsWith("sensor.")&&t.includes(e)&&t.endsWith("_auto_tpi_learning_state"))||null}_climateChanged(t){const e=t.detail.value,i={...this.config};i.climate_entity=e;const s=this._findLearningSensor(e);if(s&&(i.learning_entity=s),!i.name&&e){const t=e.replace("climate.","").replace(/_/g," ");i.name=t.charAt(0).toUpperCase()+t.slice(1)}this._fireConfigChanged(i)}_learningChanged(t){const e={...this.config};e.learning_entity=t.detail.value,this._fireConfigChanged(e)}_nameChanged(t){const e={...this.config};e.name=t.target.value,this._fireConfigChanged(e)}_fireConfigChanged(t){const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}render(){return this.hass&&this.config?e`
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
  `}customElements.define("auto-tpi-learning-card-editor",o),window.customCards=window.customCards||[],window.customCards.push({type:"auto-tpi-learning-card",name:"Auto-TPI Learning Card",description:"Visualization of Versatile Thermostat Auto-TPI learning process"});
