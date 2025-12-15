import { LitElement, html, css, svg } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class AutoTPILearningCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _history: { type: Object },
    _loading: { type: Boolean },
    _error: { type: String },
    _showTemp: { type: Boolean },
    _showHeating: { type: Boolean },
    _lastFetchTime: { type: Number },
    _lastStartDt: { type: String },
    _tooltip: { type: Object },
    _width: { type: Number }
  };

  static getConfigElement() {
    return document.createElement("auto-tpi-learning-card-editor");
  }

  static getStubConfig() {
    return {
      learning_entity: "sensor.thermostat_salon_auto_tpi_learning_state",
      climate_entity: "climate.thermostat_salon",
      name: "Thermostat Salon"
    };
  }

  constructor() {
    super();
    this._history = null;
    this._loading = false;
    this._error = null;
    this._showTemp = true;
    this._showHeating = true;
    this._lastFetchTime = 0;
    this._lastStartDt = null;
    this._tooltip = null;
    this._width = 1; // Default to avoiding div by zero
    this._resizeObserver = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          this._width = entry.contentRect.width;
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  setConfig(config) {
    if (!config.learning_entity) {
      throw new Error('You need to define learning_entity');
    }
    if (!config.climate_entity) {
      throw new Error('You need to define climate_entity');
    }
    this.config = config;
    // Reset history on config change to force refetch
    this._history = null;
    this._lastFetchTime = 0;
    this._lastStartDt = null;
  }

  getCardSize() {
    return 5;
  }

  getLayoutOptions() {
    return {
      grid_columns: 4,
      grid_min_columns: 2,
      grid_rows: 5,
      grid_min_rows: 5
    };
  }
  
  shouldUpdate(changedProps) {
    if (changedProps.has('hass')) {
      // Don't update purely on hass changes unless we need to fetch data
      // or if the relevant entities have changed state (for telemetry).
      // We will handle the fetch trigger in updated() or willUpdate()
      return true;
    }
    return true;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('hass') && this.hass && this.config) {
      const learningEntityId = this.config.learning_entity;
      const learningState = this.hass.states[learningEntityId];
      const currentStartDt = learningState?.attributes?.learning_start_dt;

      // Check if learning start date changed (new cycle)
      if (currentStartDt && this._lastStartDt && currentStartDt !== this._lastStartDt) {
         this._history = null; // Force refetch
      }
      if (currentStartDt) {
          this._lastStartDt = currentStartDt;
      }

      // Fetch history if not yet loaded or if it's been a while (> 5 mins)
      const now = Date.now();
      const isStale = (now - this._lastFetchTime) > 5 * 60 * 1000;
      
      const shouldFetch = (!this._history || isStale) && !this._loading;
      
      if (shouldFetch) {
        this._fetchHistory();
      }
    }
  }

  async _fetchHistory() {
    if (this._loading || !this.hass || !this.config) return;

    this._loading = true;
    this._error = null;

    try {
      const learningEntityId = this.config.learning_entity;
      const climateEntityId = this.config.climate_entity;
      
      // Get current state to determine start time
      const learningState = this.hass.states[learningEntityId];
      let startTimeStr = learningState?.attributes?.learning_start_dt;
      
      let startTime;
      if (startTimeStr) {
        startTime = new Date(startTimeStr);
      } else {
        // Default to 24h ago if not found
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const startTimeIso = startTime.toISOString();
      const endTimeIso = new Date().toISOString();
      const entityIds = [learningEntityId, climateEntityId].join(',');

      // Construct URL for history API
      // We set significant_changes_only=0 to ensure we get all attribute updates.
      // minimal_response must be omitted (or false) to receive attributes; setting it to 0 might be interpreted as true by the API.
      const url = `history/period/${startTimeIso}?filter_entity_id=${entityIds}&end_time=${endTimeIso}&significant_changes_only=0`;

      const response = await this.hass.callApi('GET', url);
      
      this._processHistory(response, learningEntityId, climateEntityId, startTime);
      this._lastFetchTime = Date.now();

    } catch (err) {
      console.error("Error fetching history:", err);
      this._error = "Failed to fetch history data.";
    } finally {
      this._loading = false;
    }
  }

  _processHistory(rawHistory, learningEntityId, climateEntityId, startTime) {
    if (!Array.isArray(rawHistory)) {
      this._history = { kint: [], kext: [], temp: [], heating: [], startTime: startTime.getTime() };
      return;
    }

    const kintSeries = [];
    const kextSeries = [];
    const tempSeries = [];
    const heatingSeries = [];

    // Iterate over the results. The API returns an array of arrays.
    // Each inner array corresponds to an entity history.
    for (const entityHistory of rawHistory) {
      if (!entityHistory || entityHistory.length === 0) continue;
      
      const entityId = entityHistory[0].entity_id;

      if (entityId === learningEntityId) {
        for (const state of entityHistory) {
          const t = new Date(state.last_updated).getTime();
          const attrs = state.attributes;
          
          if (attrs) {
            if (attrs.calculated_coef_int !== undefined && attrs.calculated_coef_int !== null) {
              const val = parseFloat(attrs.calculated_coef_int);
              if (!isNaN(val)) kintSeries.push({ t, val });
            }
            if (attrs.calculated_coef_ext !== undefined && attrs.calculated_coef_ext !== null) {
              const val = parseFloat(attrs.calculated_coef_ext);
              if (!isNaN(val)) kextSeries.push({ t, val });
            }
          }
        }
      } else if (entityId === climateEntityId) {
        for (const state of entityHistory) {
          const t = new Date(state.last_updated).getTime();
          const attrs = state.attributes;
          
          if (attrs) {
            if (attrs.current_temperature !== undefined && attrs.current_temperature !== null) {
              const val = parseFloat(attrs.current_temperature);
              if (!isNaN(val)) tempSeries.push({ t, val });
            }
            if (attrs.hvac_action !== undefined) {
              const isHeating = attrs.hvac_action === 'heating' ? 1 : 0;
              heatingSeries.push({ t, val: isHeating });
            }
          }
        }
      }
    }

    this._history = {
      kint: kintSeries,
      kext: kextSeries,
      temp: tempSeries,
      heating: heatingSeries,
      startTime: startTime.getTime()
    };
  }

  _getLearningData() {
    const entity = this.hass.states[this.config.learning_entity];
    if (!entity) return null;

    return {
      state: entity.state,
      kint: parseFloat(entity.attributes.calculated_coef_int) || 0,
      kext: parseFloat(entity.attributes.calculated_coef_ext) || 0,
      kintCycles: entity.attributes.coeff_int_cycles || 0,
      kextCycles: entity.attributes.coeff_ext_cycles || 0,
      confidence: parseFloat(entity.attributes.model_confidence) || 0,
      status: entity.attributes.last_learning_status || '',
      learningStartDt: entity.attributes.learning_start_dt || ''
    };
  }

  _toggleTemp() {
    this._showTemp = !this._showTemp;
  }

  _toggleHeating() {
    this._showHeating = !this._showHeating;
  }

  _getSVGPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  _handleTouchMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp) {
    e.preventDefault(); // Prevent scrolling while touching chart
    const svg = e.currentTarget;
    const touch = e.touches[0];
    const { x, y } = this._getSVGPoint(svg, touch.clientX, touch.clientY);
    this._processCursorMove(x, y, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp);
  }

  _handleMouseMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp) {
    const svg = e.currentTarget;
    const { x, y } = this._getSVGPoint(svg, e.clientX, e.clientY);
    this._processCursorMove(x, y, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp);
  }

  _processCursorMove(mouseX, mouseY, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp) {
    const x = mouseX - padding.left;
    
    // Check if inside chart area
    if (x < 0 || x > chartWidth) {
      this._tooltip = null;
      return;
    }

    // Convert x to time
    const t = xMin + (x / chartWidth) * (xMax - xMin);

    // Helper: Step function value
    const findStepValue = (series, time) => {
      if (!series || series.length === 0) return null;
      let val = null;
      for (const p of series) {
        if (p.t <= time) val = p.val;
        else break;
      }
      return val;
    };

    // Helper: Linear Interpolation for Temperature
    const findLinearValue = (series, time) => {
      if (!series || series.length === 0) return null;
      
      let p1 = null;
      let p2 = null;
      
      // Find surrounding points
      for (let i = 0; i < series.length; i++) {
        if (series[i].t <= time) {
          p1 = series[i];
        } else {
          p2 = series[i];
          break;
        }
      }

      // If before first point
      if (!p1 && p2) return p2.val;
      // If after last point
      if (p1 && !p2) return p1.val;
      // If empty (covered by check above)
      if (!p1 && !p2) return null;
      
      // Interpolate
      const t1 = p1.t;
      const t2 = p2.t;
      const v1 = p1.val;
      const v2 = p2.val;
      
      if (t2 === t1) return v1;
      
      const factor = (time - t1) / (t2 - t1);
      return v1 + (v2 - v1) * factor;
    };

    const kintValue = findStepValue(kint, t);
    const kextValue = findStepValue(kext, t);
    const tempValue = this._showTemp ? findLinearValue(temp, t) : null;

    // Calculate vertical distances to find closest series
    let yKint = Infinity, yKext = Infinity, yTemp = Infinity;
    
    if (kintValue !== null) yKint = getY_Kint(kintValue);
    if (kextValue !== null) yKext = getY_Kext(kextValue);
    if (tempValue !== null) yTemp = getY_Temp(tempValue);

    const distKint = Math.abs(mouseY - yKint);
    const distKext = Math.abs(mouseY - yKext);
    const distTemp = Math.abs(mouseY - yTemp);

    let active = 'kint';
    let minDist = distKint;

    if (distKext < minDist) { minDist = distKext; active = 'kext'; }
    if (distTemp < minDist) { minDist = distTemp; active = 'temp'; }

    // Prepare tooltip data based on active series
    let activeValue = kintValue;
    let activeColor = 'rgb(255, 235, 59)';
    let activeTitle = 'Coef INT';
    let activeY = yKint;

    if (active === 'kext') {
      activeValue = kextValue;
      activeColor = 'rgb(76, 175, 80)';
      activeTitle = 'Coef EXT';
      activeY = yKext;
    } else if (active === 'temp') {
      activeValue = tempValue;
      activeColor = 'rgb(33, 150, 243)';
      activeTitle = 'Température';
      activeY = yTemp;
    }

    if (activeValue === null) {
      this._tooltip = null;
      return;
    }

    this._tooltip = {
      x: mouseX,
      y: mouseY,
      t,
      value: activeValue,
      color: activeColor,
      title: activeTitle,
      targetY: activeY
    };
  }

  _handleMouseLeave() {
    this._tooltip = null;
  }

  _renderTooltip() {
    if (!this._tooltip || this._tooltip.value === null) return html``;

    const date = new Date(this._tooltip.t);
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateStr = date.toLocaleString('fr-FR', dateOptions);

    const { x, targetY } = this._tooltip;
    const width = this._width > 0 ? this._width : 800;
    const height = 350; // Match CSS height
    
    // Horizontal positioning: Flip if on right side
    const isRightSide = x > width / 2;
    const leftPos = isRightSide ? 'auto' : `${x + 20}px`;
    const rightPos = isRightSide ? `${width - x + 20}px` : 'auto';

    // Vertical positioning: try to center on point, but clamp to container
    const topPos = `${targetY}px`;
    const translate = 'translate(0, -50%)'; // Center vertically on the point

    return html`
      <div class="tooltip" style="
        left: ${leftPos};
        right: ${rightPos};
        top: ${topPos};
        transform: ${translate};
        border-left: 5px solid ${this._tooltip.color};
      ">
        <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 2px;">${this._tooltip.title}</div>
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 4px;">${dateStr}</div>
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(4)}</div>
      </div>
    `;
  }

  _renderChart() {
    if (this._loading) {
      return html`<div class="loading">Loading history data...</div>`;
    }
    if (this._error) {
      return html`<div class="error">${this._error}</div>`;
    }
    if (!this._history || (this._history.kint.length === 0 && this._history.kext.length === 0)) {
      return html`<div class="no-data">No history data available</div>`;
    }

    const { kint, kext, temp, heating } = this._history;

    // Use current observed width, or fallback to a reasonable default
    // We substract 32px for card padding (16px * 2) roughly
    const width = this._width > 0 ? this._width : 800;
    const height = 350;
    
    // Padding to accommodate labels
    const padding = { top: 40, right: 60, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Determine X scale (Time)
    const now = Date.now();
    let xMin = this._history.startTime;
    let xMax = now;

    // Enforce minimum 6-hour window
    const minDuration = 6 * 60 * 60 * 1000;
    if (xMax - xMin < minDuration) {
      xMax = xMin + minDuration;
    }

    // Scale Helpers
    const getX = (t) => {
      if (xMax === xMin) return padding.left;
      return padding.left + ((t - xMin) / (xMax - xMin)) * chartWidth;
    };

    // Y Scale 1: Kint (Left) - Fixed 0 to 1
    const kintMin = 0;
    const kintMax = 1;
    const getY_Kint = (val) => {
      return padding.top + chartHeight - ((val - kintMin) / (kintMax - kintMin)) * chartHeight;
    };

    // Y Scale 2: Kext (Right) - Fixed 0 to 0.1
    const kextMin = 0;
    const kextMax = 0.1;
    const getY_Kext = (val) => {
      // Clamp value for drawing
      const v = Math.max(kextMin, Math.min(kextMax, val));
      return padding.top + chartHeight - ((v - kextMin) / (kextMax - kextMin)) * chartHeight;
    };

    // Y Scale 3: Temp (Overlay) - Auto Scale
    let tempMin = Infinity;
    let tempMax = -Infinity;
    if (this._showTemp && temp.length > 0) {
      for (const p of temp) {
        if (p.val < tempMin) tempMin = p.val;
        if (p.val > tempMax) tempMax = p.val;
      }
      // Add padding to temp range
      tempMin = Math.floor(tempMin - 1);
      tempMax = Math.ceil(tempMax + 1);
    } else {
      tempMin = 0;
      tempMax = 30;
    }
    
    const getY_Temp = (val) => {
      if (tempMax === tempMin) return padding.top + chartHeight / 2;
      return padding.top + chartHeight - ((val - tempMin) / (tempMax - tempMin)) * chartHeight;
    };

    // Generate Paths
    const createLinePath = (data, scaleY) => {
      if (data.length === 0) return '';
      return data.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)},${scaleY(d.val).toFixed(1)}`
      ).join(' ');
    };

    const createSteppedLinePath = (data, scaleY) => {
      if (data.length === 0) return '';
      let path = `M ${getX(data[0].t).toFixed(1)},${scaleY(data[0].val).toFixed(1)}`;
      
      for (let i = 0; i < data.length - 1; i++) {
        const p1 = data[i];
        const p2 = data[i+1];
        // Horizontal line to next timestamp with current value
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p1.val).toFixed(1)}`;
        // Vertical line to new value
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p2.val).toFixed(1)}`;
      }

      // Extend last point to 'now'
      const lastP = data[data.length - 1];
      const currentNow = Date.now();
      if (currentNow > lastP.t) {
         path += ` L ${getX(currentNow).toFixed(1)},${scaleY(lastP.val).toFixed(1)}`;
      }

      return path;
    };

    const kintPath = createSteppedLinePath(kint, getY_Kint);
    const kextPath = createSteppedLinePath(kext, getY_Kext);
    const tempPath = this._showTemp ? createLinePath(temp, getY_Temp) : '';

    // Heating Bars
    const heatingRects = [];
    if (this._showHeating && heating.length > 0) {
      for (let i = 0; i < heating.length - 1; i++) {
        if (heating[i].val === 1) {
          const x1 = getX(heating[i].t);
          const x2 = getX(heating[i+1].t);
          const w = x2 - x1;
          if (w > 0) {
             heatingRects.push(svg`
              <rect 
                x="${x1}" 
                y="${padding.top + chartHeight - 20}" 
                width="${w}" 
                height="20" 
                fill="rgba(255, 152, 0, 0.5)"
              />
            `);
          }
        }
      }
      // Handle last point to 'now' if heating
      const last = heating[heating.length - 1];
      if (last.val === 1) {
         const x1 = getX(last.t);
         const x2 = getX(Date.now());
         const w = x2 - x1;
         if (w > 0) {
            heatingRects.push(svg`
              <rect 
                x="${x1}" 
                y="${padding.top + chartHeight - 20}" 
                width="${w}" 
                height="20" 
                fill="rgba(255, 152, 0, 0.5)"
              />
            `);
         }
      }
    }

    // Grid Lines (based on Kint)
    const kintGrid = [0, 0.25, 0.5, 0.75, 1.0].map(val => {
      const y = getY_Kint(val);
      return svg`
        <line 
          x1="${padding.left}" y1="${y}" 
          x2="${width - padding.right}" y2="${y}" 
          stroke="var(--divider-color, #444)" 
          stroke-width="1" 
          opacity="0.3" 
        />
        <text 
          x="${padding.left - 8}" y="${y + 5}"
          text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9"
        >${val.toFixed(2)}</text>
      `;
    });

    // Kext Axis Labels (Right)
    const kextLabels = [0, 0.05, 0.1].map(val => {
      const y = getY_Kext(val);
      return svg`
        <text 
          x="${width - padding.right + 8}" y="${y + 5}"
          text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9"
        >${val.toFixed(2)}</text>
      `;
    });

    // Time Axis Labels (Smart Ticks)
    const timeLabels = [];
    const durationMs = xMax - xMin;
    
    // Determine target interval (aim for ~5-7 labels)
    const targetTicks = 5;
    const rawInterval = durationMs / targetTicks;
    
    // defined intervals in ms: 1h, 2h, 3h, 4h, 6h, 12h, 24h
    const niceIntervals = [
      3600000, 
      2 * 3600000, 
      3 * 3600000, 
      4 * 3600000, 
      6 * 3600000, 
      12 * 3600000, 
      24 * 3600000
    ];
    
    // Find closest nice interval
    let tickInterval = niceIntervals[niceIntervals.length - 1];
    for (const interval of niceIntervals) {
      if (rawInterval <= interval) {
        tickInterval = interval;
        break;
      }
    }
    
    // Determine start time rounded to next hour
    const startDate = new Date(xMin);
    startDate.setMinutes(0, 0, 0); // floor to hour
    if (startDate.getTime() < xMin) {
        startDate.setTime(startDate.getTime() + 3600000);
    }
    
    let currentTickTime = startDate.getTime();
    
    while (currentTickTime <= xMax) {
       const d = new Date(currentTickTime);
       const h = d.getHours();
       const hoursInInterval = tickInterval / 3600000;
       
       // Check if this hour matches our interval requirement (e.g. 0, 2, 4...)
       if (h % hoursInInterval === 0) {
          const xPos = getX(currentTickTime);
          
          const label = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          
          // Date label if crossing midnight (00:00) or if it's the first label and meaningful
          let subLabel = '';
          if (h === 0) {
             const dayOptions = { day: 'numeric', month: 'short' };
             subLabel = d.toLocaleDateString('fr-FR', dayOptions);
          }

          timeLabels.push(svg`
            <line 
              x1="${xPos}" y1="${padding.top + chartHeight}" 
              x2="${xPos}" y2="${padding.top + chartHeight + 5}" 
              stroke="#aaa" stroke-width="1" 
            />
            <text 
              x="${xPos}" y="${height - 18}"
              text-anchor="middle" font-size="12" fill="#aaa"
            >${label}</text>
            ${subLabel ? svg`<text x="${xPos}" y="${height - 4}" text-anchor="middle" font-size="10" fill="#888">${subLabel}</text>` : ''}
          `);
       }
       currentTickTime += 3600000; // Step by 1 hour to check alignment
    }

    // Tooltip indicators (line and circle)
    let tooltipIndicators = svg``;
    if (this._tooltip && this._tooltip.value !== null) {
      const tx = this._tooltip.x;
      const ty = this._tooltip.targetY;
      
      tooltipIndicators = svg`
        <g style="pointer-events: none;">
          <line
            x1="${tx}" y1="${padding.top}"
            x2="${tx}" y2="${height - padding.bottom}"
            stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3"
          />
          <circle cx="${tx}" cy="${ty}" r="6" fill="white" stroke="${this._tooltip.color}" stroke-width="3" />
        </g>
      `;
    }

    return html`
      <svg
        width="100%" 
        height="${height}" 
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="xMidYMid meet"
        @mousemove="${(e) => this._handleMouseMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp)}"
        @mouseleave="${this._handleMouseLeave}"
        @touchstart="${(e) => this._handleTouchMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp)}"
        @touchmove="${(e) => this._handleTouchMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp)}"
        @touchend="${this._handleMouseLeave}"
      >
        <!-- Grid & Axes -->
        ${kintGrid}
        ${kextLabels}
        ${timeLabels}

        <!-- Frame -->
        <rect
          x="${padding.left}" y="${padding.top}"
          width="${chartWidth}" height="${chartHeight}"
          fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5"
        />

        <!-- Data -->
        ${heatingRects}
        ${this._showTemp ? svg`<path d="${tempPath}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" />` : ''}
        <path d="${kextPath}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" />
        <path d="${kintPath}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" />

        <!-- Overlay for Tooltip Indicators -->
        ${tooltipIndicators}
      </svg>
    `;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const learningData = this._getLearningData();
    
    if (!learningData) {
      return html`
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${this.config.learning_entity}</p>
          </div>
        </ha-card>
      `;
    }

    const confidence = Math.round(learningData.confidence * 100);
    const isStateOn = learningData.state === 'Active';
    const autoTpiState = isStateOn ? 'Active' : 'Off';
    const status = learningData.status || 'Waiting for update...';

    return html`
      <ha-card>
        <div class="card-content">
          <div class="header">${this.config.name || 'Auto-TPI Learning'}</div>

          <div class="telemetry">
            <!-- Band 1 -->
            <div class="telem-line">
              <span class="label">State:</span>
              <span style="${isStateOn ? 'color: var(--success-color, #4CAF50); font-weight: bold;' : ''}">${autoTpiState}</span>
              &nbsp;|&nbsp;
              <span class="label">Confidence:</span> ${confidence}%
            </div>

            <!-- Band 2 -->
            <div class="telem-line" style="align-items: flex-start;">
              <div style="display: flex; flex-direction: column; margin-right: 24px;">
                <span class="kint-color">Kint: ${learningData.kint.toFixed(4)}</span>
                <span style="font-size: 0.9em; opacity: 0.8;">Cycles: ${learningData.kintCycles}</span>
              </div>
              <div style="display: flex; flex-direction: column;">
                <span class="kext-color">Kext: ${learningData.kext.toFixed(4)}</span>
                <span style="font-size: 0.9em; opacity: 0.8;">Cycles: ${learningData.kextCycles}</span>
              </div>
            </div>

            <!-- Band 3 -->
            <div class="telem-line status">
              ${status}
            </div>
          </div>

          <div class="chart-container">
            ${this._renderChart()}
            ${this._renderTooltip()}
          </div>
          
          <div class="legend">
             <div class="legend-item"><span class="dot kint-bg"></span> Kint</div>
             <div class="legend-item"><span class="dot kext-bg"></span> Kext</div>
             <div class="legend-item clickable" @click="${this._toggleTemp}">
               <span class="dot temp-bg" style="opacity: ${this._showTemp ? 1 : 0.3}"></span> Temp
             </div>
             <div class="legend-item clickable" @click="${this._toggleHeating}">
               <span class="dot heating-bg" style="opacity: ${this._showHeating ? 1 : 0.3}"></span> Heating
             </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow);
      color: var(--primary-text-color);
    }
    .card-content {
      padding: 16px;
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
      height: 350px;
      position: relative;
      margin-bottom: 8px;
      overflow: hidden;
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
      gap: 16px;
      font-size: 14px;
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
  `;
}

customElements.define('auto-tpi-learning-card', AutoTPILearningCard);

class AutoTPILearningCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  setConfig(config) {
    this.config = config;
  }

  _findLearningSensor(climateEntityId) {
    if (!this.hass || !climateEntityId) return null;

    // Extraire le nom de base du climate (ex: "thermostat_salon" de "climate.thermostat_salon")
    const climateName = climateEntityId.replace('climate.', '');

    // Chercher le sensor correspondant
    const sensorPattern = `sensor.${climateName}_auto_tpi_learning_state`;

    // Vérifier si ce sensor existe
    if (this.hass.states[sensorPattern]) {
      return sensorPattern;
    }

    // Sinon chercher tous les sensors qui contiennent le nom et _auto_tpi_learning_state
    const allEntities = Object.keys(this.hass.states);
    const matchingSensor = allEntities.find(entityId =>
      entityId.startsWith('sensor.') &&
      entityId.includes(climateName) &&
      entityId.endsWith('_auto_tpi_learning_state')
    );

    return matchingSensor || null;
  }

  _climateChanged(ev) {
    const newClimateEntity = ev.detail.value;
    const newConfig = { ...this.config };

    newConfig.climate_entity = newClimateEntity;

    // Essayer de trouver automatiquement le learning sensor
    const learningSensor = this._findLearningSensor(newClimateEntity);
    if (learningSensor) {
      newConfig.learning_entity = learningSensor;
    }

    // Si le name n'est pas défini, générer un nom basé sur le climate
    if (!newConfig.name && newClimateEntity) {
      const climateName = newClimateEntity.replace('climate.', '').replace(/_/g, ' ');
      newConfig.name = climateName.charAt(0).toUpperCase() + climateName.slice(1);
    }

    this._fireConfigChanged(newConfig);
  }

  _learningChanged(ev) {
    const newConfig = { ...this.config };
    newConfig.learning_entity = ev.detail.value;
    this._fireConfigChanged(newConfig);
  }

  _nameChanged(ev) {
    const newConfig = { ...this.config };
    newConfig.name = ev.target.value;
    this._fireConfigChanged(newConfig);
  }

  _fireConfigChanged(newConfig) {
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="option">
          <label>Nom</label>
          <input 
            type="text" 
            .value="${this.config.name || ''}" 
            @input="${this._nameChanged}"
          >
        </div>
        
        <div class="option">
          <label>Entité Climate</label>
          <ha-entity-picker
            .hass="${this.hass}"
            .value="${this.config.climate_entity || ''}"
            .includeDomains="${['climate']}"
            @value-changed="${this._climateChanged}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="option">
          <label>Entité Learning (sensor)</label>
          <ha-entity-picker
            .hass="${this.hass}"
            .value="${this.config.learning_entity || ''}"
            .includeDomains="${['sensor']}"
            .entityFilter="${(entityId) => entityId.includes('_auto_tpi_learning_state')}"
            @value-changed="${this._learningChanged}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>
      </div>
    `;
  }

  static styles = css`
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
  `;
}

customElements.define('auto-tpi-learning-card-editor', AutoTPILearningCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'auto-tpi-learning-card',
  name: 'Auto-TPI Learning Card',
  description: 'Visualization of Versatile Thermostat Auto-TPI learning process'
});