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
    _showSetpoint: { type: Boolean },
    _showKint: { type: Boolean },
    _showKext: { type: Boolean },
    _showExtTemp: { type: Boolean },
    _lastFetchTime: { type: Number },
    _lastStartDt: { type: String },
    _tooltip: { type: Object },
    _width: { type: Number },
    _zoomLevel: { type: Number },
    _panOffset: { type: Number },
    _isDragging: { type: Boolean },
    _dragStartX: { type: Number },
    _dragStartOffset: { type: Number },
    _yZoomLevel: { type: Number },
    _yPanOffset: { type: Number },
    _isYDragging: { type: Boolean },
    _dragStartY: { type: Number },
    _dragStartYOffset: { type: Number }
  };

  static getConfigElement() {
    return document.createElement("auto-tpi-learning-card-editor");
  }

  static getStubConfig() {
    return {
      learning_entity: "",
      climate_entity: "",
      name: ""
    };
  }

  constructor() {
    super();
    this._history = null;
    this._loading = false;
    this._error = null;
    this._showTemp = true;
    this._showHeating = true;
    this._showSetpoint = true;
    this._showKint = true;
    this._showKext = true;
    this._showExtTemp = true;
    this._lastFetchTime = 0;
    this._lastStartDt = null;
    this._tooltip = null;
    this._width = 1;
    this._resizeObserver = null;
    this._zoomLevel = 1;
    this._panOffset = 0;
    this._isDragging = false;
    this._dragStartX = 0;
    this._dragStartOffset = 0;
    this._yZoomLevel = 1;
    this._yPanOffset = 0;
    this._isYDragging = false;
    this._dragStartY = 0;
    this._dragStartYOffset = 0;
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
    return true;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('hass') && this.hass && this.config) {
      const learningEntityId = this.config.learning_entity;
      const learningState = this.hass.states[learningEntityId];
      const currentStartDt = learningState?.attributes?.learning_start_dt;

      if (currentStartDt && this._lastStartDt && currentStartDt !== this._lastStartDt) {
        this._history = null;
      }
      if (currentStartDt) {
        this._lastStartDt = currentStartDt;
      }

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

      const learningState = this.hass.states[learningEntityId];
      let startTimeStr = learningState?.attributes?.learning_start_dt;

      let startTime;
      if (startTimeStr) {
        startTime = new Date(startTimeStr);
      } else {
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const startTimeIso = startTime.toISOString();
      const endTimeIso = new Date().toISOString();
      const entityIds = [learningEntityId, climateEntityId].join(',');

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
      this._history = { kint: [], kext: [], temp: [], heating: [], setpoint: [], startTime: startTime.getTime() };
      return;
    }

    const kintSeries = [];
    const kextSeries = [];
    const tempSeries = [];
    const heatingSeries = [];
    const setpointSeries = [];
    const extTempSeries = [];

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
            if (attrs.temperature !== undefined && attrs.temperature !== null) {
              const val = parseFloat(attrs.temperature);
              if (!isNaN(val)) setpointSeries.push({ t, val });
            }
            // Check for external temperature in specific_states
            let extTempVal = null;
            if (attrs.specific_states && attrs.specific_states.ext_current_temperature !== undefined && attrs.specific_states.ext_current_temperature !== null) {
              extTempVal = parseFloat(attrs.specific_states.ext_current_temperature);
            }
            // Also check direct attribute for compatibility
            else if (attrs.ext_current_temperature !== undefined && attrs.ext_current_temperature !== null) {
              extTempVal = parseFloat(attrs.ext_current_temperature);
            }

            if (extTempVal !== null && !isNaN(extTempVal)) {
              extTempSeries.push({ t, val: extTempVal });
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
      setpoint: setpointSeries,
      extTemp: extTempSeries,
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

  _toggleSetpoint() {
    this._showSetpoint = !this._showSetpoint;
  }

  _toggleKint() {
    this._showKint = !this._showKint;
  }

  _toggleKext() {
    this._showKext = !this._showKext;
  }

  _toggleExtTemp() {
    this._showExtTemp = !this._showExtTemp;
  }

  _handleWheel(e) {
    console.log("Wheel event triggered!", e.deltaY);
    e.preventDefault();

    if (!this._history) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculer la position relative dans le graphique (0 à 1)
    const padding = { left: 60, right: 60, top: 40, bottom: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const relativeX = (mouseX - padding.left) / chartWidth;
    const relativeY = (mouseY - padding.top) / chartHeight;

    // Clamp entre 0 et 1
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));

    const now = Date.now();
    const startTime = this._history.startTime;
    const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);

    // Calculer le temps actuel sous le curseur
    const visibleDuration = totalDuration / this._zoomLevel;
    const currentTimeUnderCursor = startTime + this._panOffset + (clampedX * visibleDuration);

    // Appliquer le zoom
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;

    // Zoom X (time axis) - center on initial cursor position
    const newZoomLevel = Math.max(1, Math.min(10, this._zoomLevel * zoomFactor));
    const newVisibleDuration = totalDuration / newZoomLevel;
    // Calculate pan offset to keep the cursor position stable during zoom
    const timeUnderCursorBeforeZoom = startTime + this._panOffset + (clampedX * visibleDuration);
    this._panOffset = timeUnderCursorBeforeZoom - startTime - (clampedX * newVisibleDuration);
    this._zoomLevel = newZoomLevel;

    // Zoom Y (value axis) - center on initial cursor position
    const newYZoomLevel = Math.max(1, Math.min(10, this._yZoomLevel * zoomFactor));

    // Calculate Y value under cursor to maintain position during zoom
    const cursorYPos = mouseY;
    const chartTop = padding.top;
    const chartBottom = rect.height - padding.bottom;

    // Calculate the Y value that should remain under the cursor after zoom
    // We need to convert cursor position to value space, then back after zoom
    const cursorYRelative = (cursorYPos - chartTop) / chartHeight;

    // For proper zoom centering, we calculate the pan adjustment needed
    // to keep the same relative position under the cursor
    const zoomChangeFactor = (newYZoomLevel - this._yZoomLevel) / newYZoomLevel;
    const cursorFromCenter = cursorYPos - (chartTop + chartHeight / 2);
    const panAdjustment = cursorFromCenter * zoomChangeFactor;

    this._yPanOffset = this._yPanOffset + panAdjustment;
    this._yZoomLevel = newYZoomLevel;

    // Reset pan offsets when returning to 100% zoom to ensure proper centering
    if (newYZoomLevel === 1) {
        this._yPanOffset = 0;
    }
    if (newZoomLevel === 1) {
        this._panOffset = 0;
    }

    this._clampPanOffset();
    this._clampYPanOffset();
    this.requestUpdate();
  }

  _zoomIn() {
    this._zoomLevel = Math.min(10, this._zoomLevel * 1.2);
    this._yZoomLevel = Math.min(10, this._yZoomLevel * 1.2);
    this._clampPanOffset();
    this._clampYPanOffset();
    this.requestUpdate();
  }

  _zoomOut() {
    this._zoomLevel = Math.max(1, this._zoomLevel / 1.2);
    this._yZoomLevel = Math.max(1, this._yZoomLevel / 1.2);
    // Reset pan offsets when returning to 100% zoom
    if (this._zoomLevel === 1) {
        this._panOffset = 0;
    }
    if (this._yZoomLevel === 1) {
        this._yPanOffset = 0;
    }
    this._clampPanOffset();
    this._clampYPanOffset();
    this.requestUpdate();
  }

  _resetZoom() {
    this._zoomLevel = 1;
    this._panOffset = 0;
    this._yZoomLevel = 1;
    this._yPanOffset = 0;
  }


  _clampPanOffset() {
    if (!this._history) return;
    const now = Date.now();
    const startTime = this._history.startTime;
    const totalDuration = now - startTime;
    const minDuration = 6 * 60 * 60 * 1000;
    const duration = Math.max(totalDuration, minDuration);

    const visibleDuration = duration / this._zoomLevel;
    const maxOffset = duration - visibleDuration;

    this._panOffset = Math.max(0, Math.min(maxOffset, this._panOffset));
  }

  _clampYPanOffset() {
    // Y-axis clamping - we'll implement this based on the visible range
    // For now, just ensure it doesn't go too far
    const maxYOffset = 1000; // This will be calculated more precisely later
    const minYOffset = -1000;
    this._yPanOffset = Math.max(minYOffset, Math.min(maxYOffset, this._yPanOffset));
  }

  _applyYZoom(baseY, chartTop, chartHeight) {
    if (this._yZoomLevel === 1 && this._yPanOffset === 0) {
      return baseY;
    }

    // Calculate the center of the chart
    const centerY = chartTop + chartHeight / 2;

    // Apply zoom by moving points toward/away from center
    const zoomFactor = this._yZoomLevel;
    const yFromCenter = baseY - centerY;
    const zoomedY = centerY + yFromCenter * zoomFactor;

    // Apply pan offset
    return zoomedY + this._yPanOffset;
  }

  _getYValueFromPosition(yPos, chartTop, chartHeight) {
    // Convert Y position back to value space for cursor position calculation
    if (this._yZoomLevel === 1 && this._yPanOffset === 0) {
      // No zoom, simple linear mapping
      return (chartTop + chartHeight - yPos) / chartHeight;
    }

    // Reverse the zoom transformation
    const centerY = chartTop + chartHeight / 2;
    const zoomedY = yPos - this._yPanOffset;
    const yFromCenter = zoomedY - centerY;
    const baseY = centerY + yFromCenter / this._yZoomLevel;

    // Convert to normalized value (0-1)
    return (chartTop + chartHeight - baseY) / chartHeight;
  }

  _getSVGPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  _handleTouchMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp) {
    e.preventDefault();
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
  _handleMouseDown(e) {
    this._isDragging = true;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._dragStartOffset = this._panOffset;
    this._dragStartYOffset = this._yPanOffset;
    e.currentTarget.style.cursor = 'grabbing';
  }

  _handleMouseMove_Drag(e) {
    if (!this._isDragging || !this._history) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const padding = { left: 60, right: 60, top: 40, bottom: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const deltaX = this._dragStartX - e.clientX;
    const deltaY = this._dragStartY - e.clientY;

    const now = Date.now();
    const startTime = this._history.startTime;
    const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
    const visibleDuration = totalDuration / this._zoomLevel;

    // Convert pixel delta to time delta for X-axis
    const deltaTime = (deltaX / chartWidth) * visibleDuration;
    this._panOffset = this._dragStartOffset + deltaTime;
    this._clampPanOffset();

    // Only allow Y-axis dragging if Y zoom is greater than 1
    if (this._yZoomLevel > 1) {
      // Convert pixel delta to value delta for Y-axis
      // Y-axis uses a different scale - we need to convert pixels to value units
      // Note: We invert the deltaY because dragging up should move content up (show higher values)
      const deltaYPixels = -deltaY; // Invert the direction
      const yScaleFactor = chartHeight / 100; // Assume 100 units range for Y-axis
      const deltaYValue = (deltaYPixels / chartHeight) * 100 * this._yZoomLevel;

      this._yPanOffset = this._dragStartYOffset + deltaYValue;
      this._clampYPanOffset();
    }
  }

  _handleMouseUp(e) {
    this._isDragging = false;
    e.currentTarget.style.cursor = 'default';
  }

  _handleTouchStart(e) {
    if (e.touches.length === 1) {
      this._isDragging = true;
      this._dragStartX = e.touches[0].clientX;
      this._dragStartY = e.touches[0].clientY;
      this._dragStartOffset = this._panOffset;
      this._dragStartYOffset = this._yPanOffset;
    }
  }

  _handleTouchMove_Drag(e) {
    if (!this._isDragging || !this._history || e.touches.length !== 1) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const padding = { left: 60, right: 60, top: 40, bottom: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const deltaX = this._dragStartX - e.touches[0].clientX;
    const deltaY = this._dragStartY - e.touches[0].clientY;

    const now = Date.now();
    const startTime = this._history.startTime;
    const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
    const visibleDuration = totalDuration / this._zoomLevel;

    // Convert pixel delta to time delta for X-axis
    const deltaTime = (deltaX / chartWidth) * visibleDuration;
    this._panOffset = this._dragStartOffset + deltaTime;
    this._clampPanOffset();

    // Only allow Y-axis dragging if Y zoom is greater than 1
    if (this._yZoomLevel > 1) {
      // Convert pixel delta to value delta for Y-axis
      // Note: We invert the deltaY because dragging up should move content up (show higher values)
      const deltaYPixels = -deltaY; // Invert the direction
      const yScaleFactor = chartHeight / 100; // Assume 100 units range for Y-axis
      const deltaYValue = (deltaYPixels / chartHeight) * 100 * this._yZoomLevel;

      this._yPanOffset = this._dragStartYOffset + deltaYValue;
      this._clampYPanOffset();
    }
  }

  _handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this._isDragging = false;
    }
  }

  _processCursorMove(mouseX, mouseY, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp) {
    const x = mouseX - padding.left;

    if (x < 0 || x > chartWidth) {
      this._tooltip = null;
      return;
    }

    const t = xMin + (x / chartWidth) * (xMax - xMin);

    const findStepValue = (series, time) => {
      if (!series || series.length === 0) return null;
      let val = null;
      for (const p of series) {
        if (p.t <= time) val = p.val;
        else break;
      }
      return val;
    };

    const findLinearValue = (series, time) => {
      if (!series || series.length === 0) return null;

      let p1 = null;
      let p2 = null;

      for (let i = 0; i < series.length; i++) {
        if (series[i].t <= time) {
          p1 = series[i];
        } else {
          p2 = series[i];
          break;
        }
      }

      if (!p1 && p2) return p2.val;
      if (p1 && !p2) return p1.val;
      if (!p1 && !p2) return null;

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

    const isRightSide = x > width / 2;
    const leftPos = isRightSide ? 'auto' : `${x + 20}px`;
    const rightPos = isRightSide ? `${width - x + 20}px` : 'auto';

    const topPos = `${targetY}px`;
    const translate = 'translate(0, -50%)';

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
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(1)}</div>
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

    const { kint, kext, temp, heating, setpoint, extTemp } = this._history;

    const width = this._width > 0 ? this._width : 800;
    const height = 350;

    const padding = { top: 40, right: 60, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const now = Date.now();
    let baseXMin = this._history.startTime;
    let baseXMax = now;

    const minDuration = 6 * 60 * 60 * 1000;
    const totalDuration = baseXMax - baseXMin;
    const duration = Math.max(totalDuration, minDuration);

    if (baseXMax - baseXMin < minDuration) {
      baseXMax = baseXMin + minDuration;
    }

    const visibleDuration = duration / this._zoomLevel;
    let xMin = baseXMin + this._panOffset;
    let xMax = xMin + visibleDuration;

    const getX = (t) => {
      if (xMax === xMin) return padding.left;
      return padding.left + ((t - xMin) / (xMax - xMin)) * chartWidth;
    };

    const kintMin = 0;
    const kintMax = 1;
    const getY_Kint = (val) => {
      const baseY = padding.top + chartHeight - ((val - kintMin) / (kintMax - kintMin)) * chartHeight;
      return this._applyYZoom(baseY, padding.top, chartHeight);
    };

    const kextMin = 0;
    const kextMax = 0.1;
    const getY_Kext = (val) => {
      const v = Math.max(kextMin, Math.min(kextMax, val));
      const baseY = padding.top + chartHeight - ((v - kextMin) / (kextMax - kextMin)) * chartHeight;
      return this._applyYZoom(baseY, padding.top, chartHeight);
    };

    // Dynamic temperature scale based on all temperature curves (temp, extTemp, setpoint)
    // with bounds between -20° and 40°
    let tempMin = -20;
    let tempMax = 40;

    // Calculate min/max from all temperature data regardless of visibility
    const allTempData = [...temp, ...extTemp, ...setpoint];
    if (allTempData.length > 0) {
      const dataMin = Math.min(...allTempData.map(p => p.val));
      const dataMax = Math.max(...allTempData.map(p => p.val));

      // Apply bounds but keep dynamic range
      tempMin = Math.max(-20, Math.floor(dataMin - 1));
      tempMax = Math.min(40, Math.ceil(dataMax + 1));

      // Ensure minimum range of 5 degrees
      if (tempMax - tempMin < 5) {
        const center = (tempMin + tempMax) / 2;
        tempMin = Math.max(-20, center - 2.5);
        tempMax = Math.min(40, center + 2.5);
      }
    }

    const getY_Temp = (val) => {
      if (tempMax === tempMin) return padding.top + chartHeight / 2;
      const baseY = padding.top + chartHeight - ((val - tempMin) / (tempMax - tempMin)) * chartHeight;
      return this._applyYZoom(baseY, padding.top, chartHeight);
    };

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
        const p2 = data[i + 1];
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p1.val).toFixed(1)}`;
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p2.val).toFixed(1)}`;
      }

      const lastP = data[data.length - 1];
      const currentNow = Date.now();
      if (currentNow > lastP.t) {
        path += ` L ${getX(currentNow).toFixed(1)},${scaleY(lastP.val).toFixed(1)}`;
      }

      return path;
    };

    const createFilledSteppedAreaPath = (data, scaleY) => {
      if (data.length === 0) return '';
      let path = `M ${getX(data[0].t).toFixed(1)},${padding.top + chartHeight}`;

      for (let i = 0; i < data.length - 1; i++) {
        const p1 = data[i];
        const p2 = data[i + 1];
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p1.val).toFixed(1)}`;
        path += ` L ${getX(p2.t).toFixed(1)},${scaleY(p2.val).toFixed(1)}`;
      }

      const lastP = data[data.length - 1];
      const currentNow = Date.now();
      if (currentNow > lastP.t) {
        path += ` L ${getX(currentNow).toFixed(1)},${scaleY(lastP.val).toFixed(1)}`;
      }

      path += ` L ${getX(data[data.length - 1].t).toFixed(1)},${padding.top + chartHeight}`;
      path += ` L ${getX(data[0].t).toFixed(1)},${padding.top + chartHeight} Z`;

      return path;
    };

    const kintPath = this._showKint ? createSteppedLinePath(kint, getY_Kint) : '';
    const kextPath = this._showKext ? createSteppedLinePath(kext, getY_Kext) : '';
    const tempPath = this._showTemp ? createLinePath(temp, getY_Temp) : '';
    const extTempPath = this._showExtTemp ? createLinePath(extTemp, getY_Temp) : '';
    const setpointPath = this._showSetpoint ? createSteppedLinePath(setpoint, getY_Temp) : '';
    const setpointFilledPath = this._showSetpoint ? createFilledSteppedAreaPath(setpoint, getY_Temp) : '';

    const heatingRects = [];
    if (this._showHeating && heating.length > 0) {
      for (let i = 0; i < heating.length - 1; i++) {
        if (heating[i].val === 1) {
          const x1 = getX(heating[i].t);
          const x2 = getX(heating[i + 1].t);
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

    const kextLabels = [0, 0.05, 0.1].map(val => {
      const y = getY_Kext(val);
      return svg`
        <text 
          x="${width - padding.right + 8}" y="${y + 5}"
          text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9"
        >${val.toFixed(2)}</text>
      `;
    });

    const timeLabels = [];
    const durationMs = xMax - xMin;

    const targetTicks = 5;
    const rawInterval = durationMs / targetTicks;

    const niceIntervals = [
      3600000,
      2 * 3600000,
      3 * 3600000,
      4 * 3600000,
      6 * 3600000,
      12 * 3600000,
      24 * 3600000
    ];

    let tickInterval = niceIntervals[niceIntervals.length - 1];
    for (const interval of niceIntervals) {
      if (rawInterval <= interval) {
        tickInterval = interval;
        break;
      }
    }

    const startDate = new Date(xMin);
    startDate.setMinutes(0, 0, 0);
    if (startDate.getTime() < xMin) {
      startDate.setTime(startDate.getTime() + 3600000);
    }

    let currentTickTime = startDate.getTime();

    while (currentTickTime <= xMax) {
      const d = new Date(currentTickTime);
      const h = d.getHours();
      const hoursInInterval = tickInterval / 3600000;

      if (h % hoursInInterval === 0) {
        const xPos = getX(currentTickTime);

        const label = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

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
      currentTickTime += 3600000;
    }

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
        style="cursor: ${this._isDragging ? 'grabbing' : 'default'}; overflow: hidden;"
        @wheel="${this._handleWheel}"
        @mousedown="${this._handleMouseDown}"
        @mousemove="${(e) => {
        this._handleMouseMove_Drag(e);
        if (!this._isDragging) {
          this._handleMouseMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp);
        }
      }}"
        @mouseup="${this._handleMouseUp}"
        @mouseleave="${(e) => {
        this._handleMouseUp(e);
        this._handleMouseLeave();
      }}"
        @touchstart="${this._handleTouchStart}"
        @touchmove="${(e) => {
        this._handleTouchMove_Drag(e);
        if (!this._isDragging) {
          this._handleTouchMove(e, xMin, xMax, chartWidth, chartHeight, padding, kint, kext, temp, getY_Kint, getY_Kext, getY_Temp);
        }
      }}"
        @touchend="${this._handleTouchEnd}"
      >
        <defs>
          <clipPath id="chart-clip">
            <rect x="${padding.left}" y="${padding.top}" width="${chartWidth}" height="${chartHeight}" />
          </clipPath>
        </defs>

        ${kintGrid}
        ${kextLabels}
        ${timeLabels}

        <rect
          x="${padding.left}" y="${padding.top}"
          width="${chartWidth}" height="${chartHeight}"
          fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5"
        />

        ${heatingRects}
        ${setpointFilledPath ? svg`<path d="${setpointFilledPath}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
        ${setpointPath ? svg`<path d="${setpointPath}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
        ${tempPath ? svg`<path d="${tempPath}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
        ${extTempPath ? svg`<path d="${extTempPath}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
        ${kextPath ? svg`<path d="${kextPath}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
        ${kintPath ? svg`<path d="${kintPath}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}

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
            <div class="telem-line">
              <span class="label">State:</span>
              <span style="${isStateOn ? 'color: var(--success-color, #4CAF50); font-weight: bold;' : ''}">${autoTpiState}</span>
              &nbsp;|&nbsp;
              <span class="label">Confidence:</span> ${confidence}%
            </div>

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

            <div class="telem-line status">
              ${status}
            </div>
          </div>

          <div class="chart-container">
            <div class="zoom-controls">
              <ha-icon-button @click="${this._zoomIn}">
                <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${this._resetZoom}">
                <ha-icon icon="mdi:magnify-remove-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${this._zoomOut}">
                <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
              </ha-icon-button>
            </div>
            ${this._renderChart()}
            ${this._renderTooltip()}
          </div>
          
          <div class="legend">
            <div class="legend-item clickable" @click="${this._toggleKint}">
              <span class="dot kint-bg" style="opacity: ${this._showKint ? 1 : 0.3}"></span> Kint
            </div>
            <div class="legend-item clickable" @click="${this._toggleKext}">
              <span class="dot kext-bg" style="opacity: ${this._showKext ? 1 : 0.3}"></span> Kext
            </div>
            <div class="legend-item clickable" @click="${this._toggleSetpoint}">
              <span class="dot setpoint-bg" style="opacity: ${this._showSetpoint ? 1 : 0.3}"></span> SetPoint
            </div>
            <div class="legend-item clickable" @click="${this._toggleExtTemp}">
              <span class="dot ext-temp-bg" style="opacity: ${this._showExtTemp ? 1 : 0.3}"></span> ExtTemp
            </div>
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
    .setpoint-bg { background: rgba(255, 152, 0, 0.7); }
    .ext-temp-bg { background: rgb(25, 50, 100); }
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

    const climateName = climateEntityId.replace('climate.', '');
    const sensorPattern = `sensor.${climateName}_auto_tpi_learning_state`;

    if (this.hass.states[sensorPattern]) {
      return sensorPattern;
    }

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

    const learningSensor = this._findLearningSensor(newClimateEntity);
    if (learningSensor) {
      newConfig.learning_entity = learningSensor;
    }

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