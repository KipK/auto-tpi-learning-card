import{LitElement as t,html as e,svg as i,css as s}from"https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";class o extends t{static properties={hass:{type:Object},config:{type:Object},_history:{type:Object},_loading:{type:Boolean},_error:{type:String},_showTemp:{type:Boolean},_showHeating:{type:Boolean},_showSetpoint:{type:Boolean},_showKint:{type:Boolean},_showKext:{type:Boolean},_showExtTemp:{type:Boolean},_lastFetchTime:{type:Number},_lastStartDt:{type:String},_tooltip:{type:Object},_width:{type:Number},_zoomLevel:{type:Number},_panOffset:{type:Number},_isDragging:{type:Boolean},_dragStartX:{type:Number},_dragStartOffset:{type:Number},_yZoomLevel:{type:Number},_yPanOffset:{type:Number},_isYDragging:{type:Boolean},_dragStartY:{type:Number},_dragStartYOffset:{type:Number},_isPinching:{type:Boolean},_pinchStartDist:{type:Number},_pinchStartZoom:{type:Number},_pinchStartYZoom:{type:Number},_resetChecked:{type:Boolean},_boostKintChecked:{type:Boolean},_unboostKextChecked:{type:Boolean},_showOptions:{type:Boolean}};static getConfigElement(){return document.createElement("auto-tpi-learning-card-editor")}static getStubConfig(){return{learning_entity:"",climate_entity:"",name:""}}constructor(){super(),this._history=null,this._loading=!1,this._error=null,this._showTemp=!0,this._showHeating=!0,this._showSetpoint=!0,this._showKint=!0,this._showKext=!0,this._showExtTemp=!0,this._lastFetchTime=0,this._lastStartDt=null,this._tooltip=null,this._width=1,this._resizeObserver=null,this._zoomLevel=1,this._panOffset=0,this._isDragging=!1,this._dragStartX=0,this._dragStartOffset=0,this._yZoomLevel=1,this._yPanOffset=0,this._isYDragging=!1,this._dragStartY=0,this._dragStartYOffset=0,this._resetChecked=!1,this._boostKintChecked=!1,this._unboostKextChecked=!1,this._showOptions=!1}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(t=>{for(let e of t)e.contentRect.width>0&&(this._width=e.contentRect.width)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(t){if(!t.learning_entity)throw new Error("You need to define learning_entity");if(!t.climate_entity)throw new Error("You need to define climate_entity");this.config=t,this._history=null,this._lastFetchTime=0,this._lastStartDt=null}getCardSize(){}getLayoutOptions(){return{}}shouldUpdate(t){return!0}willUpdate(t){(t.has("_width")||t.has("_zoomLevel")||t.has("_panOffset")||t.has("_yZoomLevel")||t.has("_yPanOffset")||t.has("_history"))&&(this._chartState=null,this._staticChartContent=null),(t.has("_showTemp")||t.has("_showHeating")||t.has("_showSetpoint")||t.has("_showKint")||t.has("_showKext")||t.has("_showExtTemp"))&&(this._staticChartContent=null)}updated(t){if(super.updated(t),t.has("hass")&&this.hass&&this.config){const t=this.config.learning_entity,e=this.hass.states[t],i=e?.attributes?.learning_start_dt;i&&this._lastStartDt&&i!==this._lastStartDt&&(this._history=null),i&&(this._lastStartDt=i);const s=Date.now()-this._lastFetchTime>3e5,o=this._history&&this._history.endTime;(!this._history||s&&!o)&&!this._loading&&this._fetchHistory()}}async _fetchHistory(){if(!this._loading&&this.hass&&this.config){this._loading=!0,this._error=null;try{const t=this.config.learning_entity,e=this.config.climate_entity,i=this.hass.states[t];let s,o=i?.attributes?.learning_start_dt;s=o?new Date(o):new Date(Date.now()-864e5);const n=s.toISOString(),a=(new Date).toISOString(),r=`history/period/${n}?filter_entity_id=${[t,e].join(",")}&end_time=${a}&significant_changes_only=0`,h=await this.hass.callApi("GET",r);this._processHistory(h,t,e,s),this._lastFetchTime=Date.now()}catch(t){console.error("Error fetching history:",t),this._error="Failed to fetch history data."}finally{this._loading=!1}}}_bisectLeft(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<e?i=o+1:s=o}return i}_bisectRight(t,e){let i=0,s=t.length;for(;i<s;){const o=i+s>>>1;t[o].t<=e?i=o+1:s=o}return i-1}_getVisibleData(t,e,i){if(!t||0===t.length)return[];let s=this._bisectLeft(t,e),o=this._bisectRight(t,i);return s=Math.max(0,s-1),o=Math.min(t.length-1,o+1),s>o?[]:t.slice(s,o+1)}_processHistory(t,e,i,s){if(!Array.isArray(t))return void(this._history={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[],startTime:s.getTime()});const o={kint:[],kext:[],temp:[],heating:[],setpoint:[],extTemp:[]};let n=null;const a=(t,e,i)=>{const s=parseFloat(i);isNaN(s)||t.push({t:e,val:s})};for(const s of t){if(!s||0===s.length)continue;const t=s[0].entity_id,r=t===e;if(r||t===i)for(const t of s){const e=new Date(t.last_updated).getTime(),i=t.attributes;if(i)if(r){const s=i.coeff_int_cycles||0,r=i.coeff_ext_cycles||0;"Off"===t.state&&s>=50&&r>=50&&(null===n||e<n)&&(n=e),null!=i.calculated_coef_int&&a(o.kint,e,i.calculated_coef_int),null!=i.calculated_coef_ext&&a(o.kext,e,i.calculated_coef_ext)}else{null!=i.current_temperature&&a(o.temp,e,i.current_temperature),null!=i.temperature&&a(o.setpoint,e,i.temperature);let t=null;null!=i.specific_states?.ext_current_temperature?t=i.specific_states.ext_current_temperature:null!=i.ext_current_temperature&&(t=i.ext_current_temperature),null!=t&&a(o.extTemp,e,t),void 0!==i.hvac_action&&o.heating.push({t:e,val:"heating"===i.hvac_action?1:0})}}}for(const t in o)o[t].sort((t,e)=>t.t-e.t);this._history={...o,startTime:s.getTime(),endTime:n}}_getLearningData(){const t=this.hass.states[this.config.learning_entity];return t?{state:t.state,kint:parseFloat(t.attributes.calculated_coef_int)||0,kext:parseFloat(t.attributes.calculated_coef_ext)||0,kintCycles:t.attributes.coeff_int_cycles||0,kextCycles:t.attributes.coeff_ext_cycles||0,confidence:parseFloat(t.attributes.model_confidence)||0,status:t.attributes.last_learning_status||"",learningStartDt:t.attributes.learning_start_dt||"",learningDone:t.attributes.learning_done,allowKintBoost:t.attributes.allow_kint_boost_on_stagnation,allowKextCompensation:t.attributes.allow_kext_compensation_on_overshoot}:null}_toggleAutoTpi(t){this.hass&&this.config&&(t?this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!1,reinitialise:!1}):this.hass.callService("versatile_thermostat","set_auto_tpi_mode",{entity_id:this.config.climate_entity,auto_tpi_mode:!0,reinitialise:this._resetChecked,allow_kint_boost_on_stagnation:this._boostKintChecked,allow_kext_compensation_on_overshoot:this._unboostKextChecked}),this._resetChecked=!1)}_toggleResetCheckbox(){this._resetChecked=!this._resetChecked,this.requestUpdate()}_toggleBoostKintCheckbox(){this._boostKintChecked=!this._boostKintChecked,this.requestUpdate()}_toggleUnboostKextCheckbox(){this._unboostKextChecked=!this._unboostKextChecked,this.requestUpdate()}_toggleOptions(){this._showOptions=!this._showOptions}_toggleHeating(){this._showHeating=!this._showHeating}_toggleSetpoint(){this._showSetpoint=!this._showSetpoint}_toggleKint(){this._showKint=!this._showKint}_toggleKext(){this._showKext=!this._showKext}_toggleExtTemp(){this._showExtTemp=!this._showExtTemp}_toggleTemp(){this._showTemp=!this._showTemp}_handleWheel(t){if(t.preventDefault(),!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=t.clientX-e.left,s=t.clientY-e.top,o=60,n=60,a=40,r=60,h=e.width-o-n,l=e.height-a-r,c=Math.max(0,Math.min(1,(i-o)/h)),d=this._history.endTime||Date.now(),p=this._history.startTime,_=Math.max(d-p,216e5),g=_/this._zoomLevel,u=p+this._panOffset+c*g,f=this._getYValueFromPosition(s,a,l),m=t.deltaY>0?.9:1.1,x=Math.max(1,Math.min(20,this._zoomLevel*m)),y=Math.max(1,Math.min(20,this._yZoomLevel*m));this._zoomLevel=x,this._yZoomLevel=y;const b=_/x;this._panOffset=u-p-c*b;const v=a+l/2,w=a+l-f*l;this._yPanOffset=s-(v+(w-v)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._tooltip=null,this.requestUpdate()}_zoomIn(){this._zoomLevel=Math.min(20,1.2*this._zoomLevel),this._yZoomLevel=Math.min(20,1.2*this._yZoomLevel),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_zoomOut(){this._zoomLevel=Math.max(1,this._zoomLevel/1.2),this._yZoomLevel=Math.max(1,this._yZoomLevel/1.2),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}_resetZoom(){this._zoomLevel=1,this._panOffset=0,this._yZoomLevel=1,this._yPanOffset=0}_clampPanOffset(){if(!this._history)return;const t=(this._history.endTime||Date.now())-this._history.startTime,e=Math.max(t,216e5),i=e-e/this._zoomLevel;this._panOffset=Math.max(0,Math.min(i,this._panOffset))}_clampYPanOffset(){this._yPanOffset=Math.max(-1e4,Math.min(1e4,this._yPanOffset))}_applyYZoom(t,e,i){if(1===this._yZoomLevel&&0===this._yPanOffset)return t;const s=e+i/2;return s+(t-s)*this._yZoomLevel+this._yPanOffset}_getYValueFromPosition(t,e,i){const s=e+i/2;return(e+i-(s+(t-this._yPanOffset-s)/this._yZoomLevel))/i}_getSVGPoint(t,e,i){const s=t.createSVGPoint();return s.x=e,s.y=i,s.matrixTransform(t.getScreenCTM().inverse())}_handleTouchMove(t){t.preventDefault();const e=t.currentTarget,i=t.touches[0],{x:s,y:o}=this._getSVGPoint(e,i.clientX,i.clientY);this._processCursorMove(s,o)}_handleMouseMove(t){const e=t.currentTarget,{x:i,y:s}=this._getSVGPoint(e,t.clientX,t.clientY);this._processCursorMove(i,s)}_handleMouseDown(t){this._isDragging=!0,this._dragStartX=t.clientX,this._dragStartY=t.clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset,t.currentTarget.style.cursor="grabbing"}_handleMouseMove_Drag(t){if(!this._isDragging||!this._history)return;const e=60,i=60,s=t.currentTarget.getBoundingClientRect().width-e-i,o=this._dragStartX-t.clientX,n=this._dragStartY-t.clientY,a=this._history.endTime||Date.now(),r=this._history.startTime,h=o/s*(Math.max(a-r,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+h,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-n)}_handleMouseUp(t){this._isDragging=!1,t.currentTarget.style.cursor="default"}_handleTouchStart(t){if(1===t.touches.length)this._isDragging=!0,this._isPinching=!1,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset;else if(2===t.touches.length){this._isDragging=!1,this._isPinching=!0;const e=t.touches[0].clientX-t.touches[1].clientX,i=t.touches[0].clientY-t.touches[1].clientY;this._pinchStartDist=Math.hypot(e,i),this._pinchStartZoom=this._zoomLevel,this._pinchStartYZoom=this._yZoomLevel}}_handleTouchMove_Drag(t){if(!this._history)return;const e=t.currentTarget.getBoundingClientRect(),i=60,s=60,o=40,n=60,a=e.width-i-s,r=e.height-o-n;if(this._isDragging&&1===t.touches.length){t.preventDefault();const e=this._dragStartX-t.touches[0].clientX,i=this._dragStartY-t.touches[0].clientY,s=this._history.endTime||Date.now(),o=this._history.startTime,n=e/a*(Math.max(s-o,216e5)/this._zoomLevel);this._panOffset=this._dragStartOffset+n,this._clampPanOffset(),this._yZoomLevel>1&&(this._yPanOffset=this._dragStartYOffset-i)}else if(this._isPinching&&2===t.touches.length){t.preventDefault();const s=t.touches[0],n=t.touches[1],h=s.clientX-n.clientX,l=s.clientY-n.clientY,c=Math.hypot(h,l);if(this._pinchStartDist<=10)return;const d=c/this._pinchStartDist,p=(s.clientX+n.clientX)/2,_=(s.clientY+n.clientY)/2,g=p-e.left,u=_-e.top,f=Math.max(0,Math.min(1,(g-i)/a)),m=this._history.endTime||Date.now(),x=this._history.startTime,y=Math.max(m-x,216e5),b=y/this._zoomLevel,v=x+this._panOffset+f*b,w=this._getYValueFromPosition(u,o,r),k=Math.max(1,Math.min(20,this._pinchStartZoom*d)),$=Math.max(1,Math.min(20,this._pinchStartYZoom*d));this._zoomLevel=k,this._yZoomLevel=$;const M=y/k;this._panOffset=v-x-f*M;const S=o+r/2,T=o+r-w*r;this._yPanOffset=u-(S+(T-S)*this._yZoomLevel),1===this._zoomLevel&&(this._panOffset=0),1===this._yZoomLevel&&(this._yPanOffset=0),this._clampPanOffset(),this._clampYPanOffset(),this.requestUpdate()}}_handleTouchEnd(t){0===t.touches.length?(this._isDragging=!1,this._isPinching=!1):1===t.touches.length&&this._isPinching&&(this._isPinching=!1,this._isDragging=!0,this._dragStartX=t.touches[0].clientX,this._dragStartY=t.touches[0].clientY,this._dragStartOffset=this._panOffset,this._dragStartYOffset=this._yPanOffset)}_processCursorMove(t,e){if(!this._chartState)return;const{xMin:i,xMax:s,chartWidth:o,chartHeight:n,padding:a,kint:r,kext:h,temp:l,extTemp:c,setpoint:d,getY_Kint:p,getY_Kext:_,getY_Temp:g}=this._chartState,u=t-a.left;if(u<0||u>o)return void(this._tooltip=null);const f=i+u/o*(s-i),m=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);return i>=0&&i<t.length?t[i].val:null},x=(t,e)=>{if(!t||0===t.length)return null;const i=this._bisectRight(t,e);if(i<0)return t[0].val;if(i>=t.length-1)return t[t.length-1].val;const s=t[i],o=t[i+1],n=s.t,a=o.t,r=s.val,h=o.val;if(a===n)return r;return r+(h-r)*((e-n)/(a-n))},y=this._showKint?m(r,f):null,b=this._showKext?m(h,f):null,v=this._showTemp?x(l,f):null,w=this._showExtTemp?x(c,f):null,k=this._showSetpoint?m(d,f):null;let $=1/0,M=1/0,S=1/0,T=1/0,C=1/0;null!==y&&($=p(y)),null!==b&&(M=_(b)),null!==v&&(S=g(v)),null!==w&&(T=g(w)),null!==k&&(C=g(k));const O=Math.abs(e-$),L=Math.abs(e-M),D=Math.abs(e-S),Y=Math.abs(e-T),z=Math.abs(e-C);let K="kint",P=O;if(L<P&&(P=L,K="kext"),D<P&&(P=D,K="temp"),Y<P&&(P=Y,K="extTemp"),z<P&&(P=z,K="setpoint"),P>50)return void(this._tooltip=null);let F=y,Z="rgb(255, 235, 59)",E="Coef INT",X=$,B=4;"kext"===K?(F=b,Z="rgb(76, 175, 80)",E="Coef EXT",X=M):"temp"===K?(F=v,Z="rgb(33, 150, 243)",E="Température",X=S,B=1):"extTemp"===K?(F=w,Z="rgb(25, 50, 100)",E="Ext Temp",X=T,B=1):"setpoint"===K&&(F=k,Z="rgba(255, 152, 0, 0.8)",E="Consigne",X=C,B=1),this._tooltip=null!==F?{x:t,y:e,t:f,value:F,color:Z,title:E,targetY:X,precision:B}:null}_handleMouseLeave(){this._tooltip=null}_renderTooltip(){if(!this._tooltip||null===this._tooltip.value)return e``;const t=new Date(this._tooltip.t).toLocaleString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}),{x:i,targetY:s}=this._tooltip,o=this._width>0?this._width:800,n=i>o/2;return e`
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
    `}_calculateChartState(){if(!this._history)return null;const{kint:t,kext:e,temp:i,heating:s,setpoint:o,extTemp:n}=this._history,a=this._width>0?this._width:800,r={top:10,right:60,bottom:40,left:60},h=a-r.left-r.right,l=300-r.top-r.bottom,c=this._history.endTime||Date.now();let d=this._history.startTime,p=c;const _=216e5,g=c-d;c-d<_&&(p=d+_);const u=Math.max(g,_)/this._zoomLevel;let f=d+this._panOffset,m=f+u;let x=0,y=1;if(t.length>0){let e=1/0,i=-1/0;for(const s of t)s.val<e&&(e=s.val),s.val>i&&(i=s.val);x=Math.min(0,e),y=Math.max(1,i),y>1&&(y=Math.ceil(10*y)/10)}let b=0,v=.1;if(e.length>0){let t=1/0,i=-1/0;for(const s of e)s.val<t&&(t=s.val),s.val>i&&(i=s.val);b=Math.min(0,t),v=Math.max(.1,i),v>.1&&(v=Math.ceil(100*v)/100)}let w=-20,k=40;const $=[...i,...n,...o];if($.length>0){const t=Math.min(...$.map(t=>t.val)),e=Math.max(...$.map(t=>t.val));if(w=Math.max(-20,Math.floor(t-1)),k=Math.min(40,Math.ceil(e+1)),k-w<5){const t=(w+k)/2;w=Math.max(-20,t-2.5),k=Math.min(40,t+2.5)}}return{width:a,height:300,padding:r,chartWidth:h,chartHeight:l,xMin:f,xMax:m,getX:t=>m===f?r.left:r.left+(t-f)/(m-f)*h,getY_Kint:t=>{const e=r.top+l-(t-x)/(y-x)*l;return this._applyYZoom(e,r.top,l)},getY_Kext:t=>{const e=r.top+l-(t-b)/(v-b)*l;return this._applyYZoom(e,r.top,l)},getY_Temp:t=>{if(k===w)return r.top+l/2;const e=r.top+l-(t-w)/(k-w)*l;return this._applyYZoom(e,r.top,l)},kintMin:x,kintMax:y,kextMin:b,kextMax:v,kint:t,kext:e,temp:i,heating:s,setpoint:o,extTemp:n}}_generateStaticContent(t){if(!t)return i``;const{width:e,height:s,padding:o,chartWidth:n,chartHeight:a,xMin:r,xMax:h,getX:l,getY_Kint:c,getY_Kext:d,getY_Temp:p,kintMin:_,kintMax:g,kextMin:u,kextMax:f,kint:m,kext:x,temp:y,heating:b,setpoint:v,extTemp:w}=t,k=(t,e)=>0===t.length?"":t.map((t,i)=>`${0===i?"M":"L"} ${l(t.t).toFixed(1)},${e(t.val).toFixed(1)}`).join(" "),$=(t,e)=>{if(0===t.length)return"";let i=`M ${l(t[0].t).toFixed(1)},${e(t[0].val).toFixed(1)}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${l(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${l(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const s=t[t.length-1],o=this._history?.endTime||Date.now();return o>s.t&&(i+=` L ${l(o).toFixed(1)},${e(s.val).toFixed(1)}`),i},M=this._showKint?this._getVisibleData(m,r,h):[],S=this._showKext?this._getVisibleData(x,r,h):[],T=this._showTemp?this._getVisibleData(y,r,h):[],C=this._showExtTemp?this._getVisibleData(w,r,h):[],O=this._showSetpoint?this._getVisibleData(v,r,h):[],L=M.length>0?$(M,c):"",D=S.length>0?$(S,d):"",Y=T.length>0?k(T,p):"",z=C.length>0?k(C,p):"",K=O.length>0?$(O,p):"",P=O.length>0?((t,e)=>{if(0===t.length)return"";let i=`M ${l(t[0].t).toFixed(1)},${o.top+a}`;for(let s=0;s<t.length-1;s++){const o=t[s],n=t[s+1];i+=` L ${l(n.t).toFixed(1)},${e(o.val).toFixed(1)}`,i+=` L ${l(n.t).toFixed(1)},${e(n.val).toFixed(1)}`}const s=t[t.length-1],n=this._history?.endTime||Date.now();return n>s.t&&(i+=` L ${l(n).toFixed(1)},${e(s.val).toFixed(1)}`),i+=` L ${l(t[t.length-1].t).toFixed(1)},${o.top+a}`,i+=` L ${l(t[0].t).toFixed(1)},${o.top+a} Z`,i})(O,p):"",F=[];if(this._showHeating&&b.length>0){const t=e-o.right;let s=this._bisectLeft(b,r),n=this._bisectRight(b,h);s=Math.max(0,s-1),n=Math.min(b.length-1,n+1);for(let e=s;e<=n;e++)if(b[e]&&1===b[e].val){const s=b[e].t,n=e<b.length-1?b[e+1].t:this._history?.endTime||Date.now();if(n<r||s>h)continue;const c=l(s),d=l(n),p=Math.max(o.left,Math.min(c,d)),_=Math.min(t,Math.max(c,d))-p;_>0&&F.push(i`
              <rect
                x="${p}"
                y="${o.top+a-20}"
                width="${_}"
                height="20"
                fill="rgba(255, 152, 0, 0.5)"
                clip-path="url(#chart-clip)"
              />
            `)}}const Z=[],E=g>2?.5:.25;for(let t=Math.ceil(_/E)*E;t<=g+.001;t+=E)Z.push(t);const X=Z.map(t=>{const s=c(t);return i`
        <line x1="${o.left}" y1="${s}" x2="${e-o.right}" y2="${s}" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.3" />
        <text x="${o.left-8}" y="${s+5}" text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9">${t.toFixed(2)}</text>
      `}),B=[],j=f>.5?.1:.05;for(let t=Math.ceil(u/j)*j;t<=f+1e-4;t+=j)B.push(t);const H=B.map(t=>{const s=d(t);return i`
        <text x="${e-o.right+8}" y="${s+5}" text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9">${t.toFixed(2)}</text>
      `}),R=[],N=(h-r)/5,U=[36e5,72e5,108e5,144e5,216e5,432e5,864e5];let V=U.find(t=>N<=t)||U[U.length-1];const A=new Date(r);A.setMinutes(0,0,0),A.getTime()<r&&A.setTime(A.getTime()+36e5);let I=A.getTime();for(;I<=h;){const t=new Date(I),e=t.getHours();if(e%(V/36e5)===0){const n=l(I),r=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`;let h="";if(0===e){const e={day:"numeric",month:"short"};h=t.toLocaleDateString("fr-FR",e)}R.push(i`
          <line x1="${n}" y1="${o.top+a}" x2="${n}" y2="${o.top+a+5}" stroke="#aaa" stroke-width="1" />
          <text x="${n}" y="${s-18}" text-anchor="middle" font-size="12" fill="#aaa">${r}</text>
          ${h?i`<text x="${n}" y="${s-4}" text-anchor="middle" font-size="10" fill="#888">${h}</text>`:""}
        `)}I+=36e5}return i`
      <defs>
        <clipPath id="chart-clip">
          <rect x="${o.left}" y="${o.top}" width="${n}" height="${a}" />
        </clipPath>
      </defs>

      ${X}
      ${H}
      ${R}

      <rect x="${o.left}" y="${o.top}" width="${n}" height="${a}" fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5" />

      ${F}
      ${P?i`<path d="${P}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${K?i`<path d="${K}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${Y?i`<path d="${Y}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${z?i`<path d="${z}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${D?i`<path d="${D}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
      ${L?i`<path d="${L}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />`:""}
    `}_renderChart(){if(this._loading)return e`<div class="loading">Loading history data...</div>`;if(this._error)return e`<div class="error">${this._error}</div>`;if(!this._history||0===this._history.kint.length&&0===this._history.kext.length)return e`<div class="no-data">No history data available</div>`;this._chartState||(this._chartState=this._calculateChartState()),!this._staticChartContent&&this._chartState&&(this._staticChartContent=this._generateStaticContent(this._chartState));const{height:t,width:s}=this._chartState,o=this._chartState.padding;let n=i``;if(this._tooltip&&null!==this._tooltip.value){const e=this._tooltip.x,s=this._tooltip.targetY;n=i`
        <g style="pointer-events: none;">
          <line x1="${e}" y1="${o.top}" x2="${e}" y2="${t-o.bottom}" stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3" />
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
        ${n}
      </svg>
    `}render(){if(!this.hass||!this.config)return e``;const t=this._getLearningData();if(!t)return e`
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${this.config.learning_entity}</p>
          </div>
        </ha-card>
      `;const i=Math.round(100*t.confidence),s="Active"===t.state,o=s?"Active":"Off",n=t.status||"Waiting for update...",a=s?"Stop Learning":"Start Learning",r=s?"mdi:stop":"mdi:play";return e`
      <ha-card>
        <div class="card-content">
          <div class="header-row">
            <div class="header-title">${this.config.name||"Auto-TPI Learning"}</div>
            
            <div class="controls-container">
              <div class="main-controls">
                <mwc-button
                  @click=${()=>this._toggleAutoTpi(s)}
                  class="${s?"stop-btn":"start-btn"}"
                  dense
                  raised
                >
                  <ha-icon icon="${r}" style="margin-right: 4px;"></ha-icon>
                  ${a}
                </mwc-button>
                <ha-icon-button
                   @click="${()=>this._toggleOptions()}"
                   style="margin-left: 0px; color: var(--secondary-text-color);"
                   title="Options"
                >
                  <ha-icon icon="${this._showOptions?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
                </ha-icon-button>
              </div>

               ${this._showOptions?e`
                 <div class="options-container">
                 ${s?e`
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
                `:e`
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
  `}customElements.get("auto-tpi-learning-card")||customElements.define("auto-tpi-learning-card",o);class n extends t{static properties={hass:{type:Object},config:{type:Object}};setConfig(t){this.config=t}_findLearningSensor(t){if(!this.hass||!t)return null;const e=t.replace("climate.",""),i=`sensor.${e}_auto_tpi_learning_state`;if(this.hass.states[i])return i;return Object.keys(this.hass.states).find(t=>t.startsWith("sensor.")&&t.includes(e)&&t.endsWith("_auto_tpi_learning_state"))||null}_climateChanged(t){const e=t.detail.value,i={...this.config};i.climate_entity=e;const s=this._findLearningSensor(e);if(s&&(i.learning_entity=s),!i.name&&e){const t=e.replace("climate.","").replace(/_/g," ");i.name=t.charAt(0).toUpperCase()+t.slice(1)}this._fireConfigChanged(i)}_learningChanged(t){const e={...this.config};e.learning_entity=t.detail.value,this._fireConfigChanged(e)}_nameChanged(t){const e={...this.config};e.name=t.target.value,this._fireConfigChanged(e)}_fireConfigChanged(t){const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}render(){return this.hass&&this.config?e`
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
  `}customElements.get("auto-tpi-learning-card-editor")||customElements.define("auto-tpi-learning-card-editor",n),window.customCards=window.customCards||[],window.customCards.some(t=>"auto-tpi-learning-card"===t.type)||window.customCards.push({type:"auto-tpi-learning-card",name:"Auto-TPI Learning Card",description:"Visualization of Versatile Thermostat Auto-TPI learning process"});
