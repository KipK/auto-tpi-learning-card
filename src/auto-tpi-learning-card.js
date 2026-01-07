import { LitElement, html, css, svg } from 'lit';

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
    _dragStartYOffset: { type: Number },
    _isPinching: { type: Boolean },
    _pinchStartDist: { type: Number },
    _pinchStartZoom: { type: Number },
    _pinchStartYZoom: { type: Number },
    _resetChecked: { type: Boolean },
    _boostKintChecked: { type: Boolean },
    _unboostKextChecked: { type: Boolean },
    _showOptions: { type: Boolean }
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
    this._resetChecked = false;
    this._boostKintChecked = true;
    this._unboostKextChecked = false;
    this._showOptions = false;
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
    // return 10;
  }

  getLayoutOptions() {
    return {
      //   grid_columns: 12,
      //   grid_min_columns: 6,
      //   grid_rows: 1,
      //   grid_min_rows: 1
    };
  }

  shouldUpdate(changedProps) {
    return true;
  }

  willUpdate(changedProps) {
    // Invalidate Chart State if dimensions or zoom/pan change
    if (changedProps.has('_width') ||
      changedProps.has('_zoomLevel') ||
      changedProps.has('_panOffset') ||
      changedProps.has('_yZoomLevel') ||
      changedProps.has('_yPanOffset') ||
      changedProps.has('_history')) {
      this._chartState = null;
      this._staticChartContent = null;
    }

    // Invalidate Static Content if visibility flags change
    // (Chart State doesn't need to change because it contains all data, 
    // but Static Content generation depends on these flags)
    if (changedProps.has('_showTemp') ||
      changedProps.has('_showHeating') ||
      changedProps.has('_showSetpoint') ||
      changedProps.has('_showKint') ||
      changedProps.has('_showKext') ||
      changedProps.has('_showExtTemp')) {
      this._staticChartContent = null;
    }
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

      // Check if current history matches the current start time
      // This recovers from situations where learning_start_dt was temporarily unavailable
      // and the card fetched a default 24h history containing old "finished" states.
      if (this._history && currentStartDt) {
        const currentStartTs = new Date(currentStartDt).getTime();
        if (Math.abs(this._history.startTime - currentStartTs) > 1000) {
          this._history = null;
        }
      }

      const now = Date.now();
      const isStale = (now - this._lastFetchTime) > 5 * 60 * 1000;
      const isFinished = this._history && this._history.endTime;

      const shouldFetch = (!this._history || (isStale && !isFinished)) && !this._loading;

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

  // --- OPTIMIZATION HELPERS ---

  /**
   * Binary search to find the insertion index of a timestamp.
   * Equivalent to Python's bisect_left
   * @param {Array} data - Array of objects {t, val} sorted by t
   * @param {Number} targetTime - The timestamp to search for
   * @returns {Number} - The index where targetTime could be inserted while maintaining order
   */
  _bisectLeft(data, targetTime) {
    let low = 0;
    let high = data.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (data[mid].t < targetTime) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  /**
   * Binary search to find the index of the last element <= targetTime
   * @param {Array} data - Array of objects {t, val} sorted by t
   * @param {Number} targetTime - The timestamp to search for
   * @returns {Number} - The index of the element, or -1 if all are larger
   */
  _bisectRight(data, targetTime) {
    let low = 0;
    let high = data.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (data[mid].t <= targetTime) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low - 1;
  }

  /**
   * Efficiently get only the data points needed for the current visible window.
   * Includes one point before and one after the window to ensure lines are drawn completely to the edges.
   */
  _getVisibleData(series, xMin, xMax) {
    if (!series || series.length === 0) return [];

    // Find index of first point >= xMin
    let startIndex = this._bisectLeft(series, xMin);
    // Find index of last point <= xMax
    let endIndex = this._bisectRight(series, xMax);

    // Expand window by 1 point on each side to ensure continuity (drawing lines to/from off-screen)
    startIndex = Math.max(0, startIndex - 1);
    endIndex = Math.min(series.length - 1, endIndex + 1);

    if (startIndex > endIndex) return [];

    return series.slice(startIndex, endIndex + 1);
  }

  _processHistory(rawHistory, learningEntityId, climateEntityId, startTime) {
    if (!Array.isArray(rawHistory)) {
      this._history = { kint: [], kext: [], temp: [], heating: [], setpoint: [], extTemp: [], startTime: startTime.getTime() };
      return;
    }

    const series = {
      kint: [],
      kext: [],
      temp: [],
      heating: [],
      setpoint: [],
      extTemp: []
    };

    let endTime = null;

    const safePush = (arr, t, val) => {
      const floatVal = parseFloat(val);
      if (!isNaN(floatVal)) arr.push({ t, val: floatVal });
    };

    for (const entityHistory of rawHistory) {
      if (!entityHistory || entityHistory.length === 0) continue;

      const entityId = entityHistory[0].entity_id;
      const isLearning = entityId === learningEntityId;
      const isClimate = entityId === climateEntityId;

      if (!isLearning && !isClimate) continue;

      for (const state of entityHistory) {
        const t = new Date(state.last_updated).getTime();
        const attrs = state.attributes;
        if (!attrs) continue;

        if (isLearning) {
          // Detect End of Learning
          const kintCycles = attrs.coeff_int_cycles || 0;
          const kextCycles = attrs.coeff_ext_cycles || 0;
          if (state.state === 'Off' && kintCycles >= 50 && kextCycles >= 50) {
            if (endTime === null || t < endTime) {
              endTime = t;
            }
          }

          if (attrs.calculated_coef_int != null) safePush(series.kint, t, attrs.calculated_coef_int);
          if (attrs.calculated_coef_ext != null) safePush(series.kext, t, attrs.calculated_coef_ext);
        } else {
          if (attrs.current_temperature != null) safePush(series.temp, t, attrs.current_temperature);
          if (attrs.temperature != null) safePush(series.setpoint, t, attrs.temperature);

          let extTempVal = null;
          if (attrs.specific_states?.ext_current_temperature != null) {
            extTempVal = attrs.specific_states.ext_current_temperature;
          } else if (attrs.ext_current_temperature != null) {
            extTempVal = attrs.ext_current_temperature;
          }
          if (extTempVal != null) safePush(series.extTemp, t, extTempVal);

          if (attrs.hvac_action !== undefined) {
            series.heating.push({ t, val: attrs.hvac_action === 'heating' ? 1 : 0 });
          }
        }
      }
    }

    // Sort all series by time just in case
    for (const key in series) {
      series[key].sort((a, b) => a.t - b.t);
    }

    // Safety Check: If the entity is currently active (not in a finished state),
    // we should NOT have an endTime. If we detected one from history (e.g. from old data
    // before a reset if start_dt was missing), we must ignore it to keep the graph live.
    const currentEntity = this.hass.states[learningEntityId];
    if (currentEntity) {
      const isCurrentlyOff = currentEntity.state === 'Off';
      const currentKintCycles = currentEntity.attributes.coeff_int_cycles || 0;
      const currentKextCycles = currentEntity.attributes.coeff_ext_cycles || 0;
      const isActuallyFinished = isCurrentlyOff && currentKintCycles >= 50 && currentKextCycles >= 50;

      if (!isActuallyFinished) {
        endTime = null;
      }
    }

    this._history = {
      ...series,
      startTime: startTime.getTime(),
      endTime
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
      learningStartDt: entity.attributes.learning_start_dt || '',
      learningDone: entity.attributes.learning_done,
      allowKintBoost: entity.attributes.allow_kint_boost_on_stagnation,
      allowKextCompensation: entity.attributes.allow_kext_compensation_on_overshoot
    };
  }

  _toggleAutoTpi(isStateOn) {
    if (!this.hass || !this.config) return;

    if (isStateOn) {
        // We want to STOP
        // reinitialise: false
        this.hass.callService('versatile_thermostat', 'set_auto_tpi_mode', {
          entity_id: this.config.climate_entity,
          auto_tpi_mode: false,
          reinitialise: false
        });
    } else {
        // We want to START
        // reinitialise depends on checkbox (default unchecked = false = Resume)
        this.hass.callService('versatile_thermostat', 'set_auto_tpi_mode', {
            entity_id: this.config.climate_entity,
            auto_tpi_mode: true,
            reinitialise: this._resetChecked,
            allow_kint_boost_on_stagnation: this._boostKintChecked,
            allow_kext_compensation_on_overshoot: this._unboostKextChecked
        });
    }

    // Reset the checkbox after action
    this._resetChecked = false;
  }

  _toggleResetCheckbox() {
    this._resetChecked = !this._resetChecked;
    this.requestUpdate();
  }

  _toggleBoostKintCheckbox() {
    this._boostKintChecked = !this._boostKintChecked;
    this.requestUpdate();
  }

  _toggleUnboostKextCheckbox() {
    this._unboostKextChecked = !this._unboostKextChecked;
    this.requestUpdate();
  }

  _toggleOptions() {
    this._showOptions = !this._showOptions;
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

  _toggleTemp() {
    this._showTemp = !this._showTemp;
  }

  _handleWheel(e) {
    e.preventDefault();

    if (!this._history) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate chart dimensions and padding
    const padding = { left: 60, right: 60, top: 40, bottom: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const clampedX = Math.max(0, Math.min(1, (mouseX - padding.left) / chartWidth));

    // --- X-AXIS ZOOM CALCULATION ---
    const now = this._history.endTime || Date.now();
    const startTime = this._history.startTime;
    const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
    const currentVisibleDuration = totalDuration / this._zoomLevel;

    // Calculate the time currently under the cursor
    const timeUnderCursor = startTime + this._panOffset + (clampedX * currentVisibleDuration);

    // --- Y-AXIS ZOOM CALCULATION ---
    // Calculate the normalized value (0-1) currently under the cursor
    const valueNormUnderCursor = this._getYValueFromPosition(mouseY, padding.top, chartHeight);

    // --- APPLY NEW ZOOM ---
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1; // Zoom out / Zoom in
    const newZoomLevel = Math.max(1, Math.min(20, this._zoomLevel * zoomFactor));
    const newYZoomLevel = Math.max(1, Math.min(20, this._yZoomLevel * zoomFactor));

    // --- UPDATE STATE ---
    this._zoomLevel = newZoomLevel;
    this._yZoomLevel = newYZoomLevel;

    // --- RE-CALCULATE OFFSETS TO ANCHOR CURSOR ---

    // 1. Anchor X-Axis
    const newVisibleDuration = totalDuration / newZoomLevel;
    // We want: timeUnderCursor = startTime + newPanOffset + (clampedX * newVisibleDuration)
    this._panOffset = timeUnderCursor - startTime - (clampedX * newVisibleDuration);

    // 2. Anchor Y-Axis
    // We want the screen position of valueNormUnderCursor to remain at mouseY
    // Formula: ScreenY = CenterY + (BaseY - CenterY) * Zoom + PanOffset
    // Where BaseY = Top + Height - (ValueNorm * Height)

    const centerY = padding.top + chartHeight / 2;
    const baseY = padding.top + chartHeight - (valueNormUnderCursor * chartHeight);

    // Solve for PanOffset: PanOffset = ScreenY - (CenterY + (BaseY - CenterY) * Zoom)
    this._yPanOffset = mouseY - (centerY + (baseY - centerY) * this._yZoomLevel);

    // Reset pan offsets when returning to 100% zoom (optional but cleaner)
    if (this._zoomLevel === 1) this._panOffset = 0;
    if (this._yZoomLevel === 1) this._yPanOffset = 0;

    this._clampPanOffset();

    // Clear tooltip to avoid "ghosting" or update it immediately
    // For now, clearing it is safer and simpler. The user will move mouse slightly and it will reappear correctly.
    this._tooltip = null;

    this.requestUpdate();
  }

  _zoomIn() {
    this._zoomLevel = Math.min(20, this._zoomLevel * 1.2);
    this._yZoomLevel = Math.min(20, this._yZoomLevel * 1.2);
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
    const now = this._history.endTime || Date.now();
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
    const maxYOffset = 10000;
    const minYOffset = -10000;
    this._yPanOffset = Math.max(minYOffset, Math.min(maxYOffset, this._yPanOffset));
  }

  _applyYZoom(baseY, chartTop, chartHeight) {
    if (this._yZoomLevel === 1 && this._yPanOffset === 0) {
      return baseY;
    }

    // Apply zoom centered around chart center, then apply pan
    // This creates a consistent zoom experience similar to X-axis
    const centerY = chartTop + chartHeight / 2;
    const yFromCenter = baseY - centerY;
    const zoomedY = centerY + yFromCenter * this._yZoomLevel;

    // Apply pan offset to the zoomed position
    return zoomedY + this._yPanOffset;
  }

  _getYValueFromPosition(yPos, chartTop, chartHeight) {
    // Inverse of _applyYZoom
    // Forward: ScreenY = CenterY + (BaseY - CenterY) * Zoom + PanOffset
    // Inverse: BaseY = CenterY + (ScreenY - PanOffset - CenterY) / Zoom

    const centerY = chartTop + chartHeight / 2;
    const baseY = centerY + (yPos - this._yPanOffset - centerY) / this._yZoomLevel;

    // Convert pixel position (BaseY) to normalized value (0-1)
    // BaseY = Top + Height - (Value * Height)
    // Value = (Top + Height - BaseY) / Height
    return (chartTop + chartHeight - baseY) / chartHeight;
  }

  _getSVGPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  _handleTouchMove(e) {
    e.preventDefault();
    const svg = e.currentTarget;
    const touch = e.touches[0];
    const { x, y } = this._getSVGPoint(svg, touch.clientX, touch.clientY);
    this._processCursorMove(x, y);
  }

  _handleMouseMove(e) {
    const svg = e.currentTarget;
    const { x, y } = this._getSVGPoint(svg, e.clientX, e.clientY);
    this._processCursorMove(x, y);
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

    const deltaX = this._dragStartX - e.clientX;
    const deltaY = this._dragStartY - e.clientY;

    // --- X-Axis Drag ---
    const now = this._history.endTime || Date.now();
    const startTime = this._history.startTime;
    const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
    const visibleDuration = totalDuration / this._zoomLevel;

    // Dragging mouse LEFT (positive deltaX) means moving view RIGHT (increasing time offset)
    const deltaTime = (deltaX / chartWidth) * visibleDuration;
    this._panOffset = this._dragStartOffset + deltaTime;
    this._clampPanOffset();

    // --- Y-Axis Drag ---
    if (this._yZoomLevel > 1) {
      // Dragging mouse UP (positive deltaY because delta = start - current)
      // If we drag UP, we want to see lower values?
      // Standard "pan" logic: Dragging content UP means view moves DOWN relative to content.
      // But usually "hand tool": Dragging UP moves the viewport UP (showing lower parts).
      // Wait. e.clientY decreases when going UP.
      // deltaY = Start - Current. Moving UP -> Current < Start -> deltaY > 0.
      // If I drag UP, I expect the chart to move UP with my mouse.
      // Moving chart UP means increasing the Y-offset (since Y-offset is added to screen position).
      // So if deltaY > 0 (drag up), we want positive change in PanOffset.

      // However, let's verify direction.
      // If I click and drag UP, the content should follow the mouse.
      // So the pixel under my mouse should effectively stay under my mouse.
      // NewY = OldY + (CurrentMouse - StartMouse)
      // NewOffset = OldOffset + (CurrentMouse - StartMouse)
      // CurrentMouse - StartMouse = -deltaY.
      // So NewOffset = OldOffset - deltaY.

      this._yPanOffset = this._dragStartYOffset - deltaY;

      // No strict clamping for Y panning yet as it's infinite canvas essentially,
      // but we can limit it if needed. For now, free panning is fine or minimal clamping.
    }
  }

  _handleMouseUp(e) {
    this._isDragging = false;
    e.currentTarget.style.cursor = 'default';
  }

  _handleTouchStart(e) {
    if (e.touches.length === 1) {
      this._isDragging = true;
      this._isPinching = false;
      this._dragStartX = e.touches[0].clientX;
      this._dragStartY = e.touches[0].clientY;
      this._dragStartOffset = this._panOffset;
      this._dragStartYOffset = this._yPanOffset;
    } else if (e.touches.length === 2) {
      this._isDragging = false;
      this._isPinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this._pinchStartDist = Math.hypot(dx, dy);
      this._pinchStartZoom = this._zoomLevel;
      this._pinchStartYZoom = this._yZoomLevel;
    }
  }

  _handleTouchMove_Drag(e) {
    if (!this._history) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const padding = { left: 60, right: 60, top: 40, bottom: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    if (this._isDragging && e.touches.length === 1) {
      e.preventDefault();

      const deltaX = this._dragStartX - e.touches[0].clientX;
      const deltaY = this._dragStartY - e.touches[0].clientY;

      const now = this._history.endTime || Date.now();
      const startTime = this._history.startTime;
      const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
      const visibleDuration = totalDuration / this._zoomLevel;

      // Convert pixel delta to time delta for X-axis
      const deltaTime = (deltaX / chartWidth) * visibleDuration;
      this._panOffset = this._dragStartOffset + deltaTime;
      this._clampPanOffset();

      // Only allow Y-axis dragging if Y zoom is greater than 1
      if (this._yZoomLevel > 1) {
        this._yPanOffset = this._dragStartYOffset - deltaY;
      }
    } else if (this._isPinching && e.touches.length === 2) {
      e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const newDist = Math.hypot(dx, dy);

      if (this._pinchStartDist <= 10) return;

      const scale = newDist / this._pinchStartDist;

      // Calculate center of pinch
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;
      const mouseX = centerX - rect.left;
      const mouseY = centerY - rect.top;

      // --- X-AXIS Zoom ---
      const clampedX = Math.max(0, Math.min(1, (mouseX - padding.left) / chartWidth));

      const now = this._history.endTime || Date.now();
      const startTime = this._history.startTime;
      const totalDuration = Math.max(now - startTime, 6 * 60 * 60 * 1000);
      const currentVisibleDuration = totalDuration / this._zoomLevel;

      // Time under pinch center before zoom
      const timeUnderCursor = startTime + this._panOffset + (clampedX * currentVisibleDuration);

      // --- Y-AXIS Zoom ---
      // Value under pinch center before zoom
      const valueNormUnderCursor = this._getYValueFromPosition(mouseY, padding.top, chartHeight);

      // --- APPLY ZOOM ---
      const newZoomLevel = Math.max(1, Math.min(20, this._pinchStartZoom * scale));
      const newYZoomLevel = Math.max(1, Math.min(20, this._pinchStartYZoom * scale));

      this._zoomLevel = newZoomLevel;
      this._yZoomLevel = newYZoomLevel;

      // --- RE-CALCULATE OFFSETS ---

      // 1. Anchor X-Axis
      const newVisibleDuration = totalDuration / newZoomLevel;
      this._panOffset = timeUnderCursor - startTime - (clampedX * newVisibleDuration);

      // 2. Anchor Y-Axis
      const chartCenterY = padding.top + chartHeight / 2;
      const baseY = padding.top + chartHeight - (valueNormUnderCursor * chartHeight);

      this._yPanOffset = mouseY - (chartCenterY + (baseY - chartCenterY) * this._yZoomLevel);

      // Reset pan offsets when returning to 100% zoom
      if (this._zoomLevel === 1) this._panOffset = 0;
      if (this._yZoomLevel === 1) this._yPanOffset = 0;

      this._clampPanOffset();
      this._clampYPanOffset();
      this.requestUpdate();
    }
  }

  _handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this._isDragging = false;
      this._isPinching = false;
    } else if (e.touches.length === 1 && this._isPinching) {
      // Transition from pinch to drag (lifted one finger)
      this._isPinching = false;
      this._isDragging = true;
      this._dragStartX = e.touches[0].clientX;
      this._dragStartY = e.touches[0].clientY;
      this._dragStartOffset = this._panOffset;
      this._dragStartYOffset = this._yPanOffset;
    }
  }

  _processCursorMove(mouseX, mouseY) {
    if (!this._chartState) return;

    const {
      xMin, xMax, chartWidth, chartHeight, padding,
      kint, kext, temp, extTemp, setpoint,
      getY_Kint, getY_Kext, getY_Temp
    } = this._chartState;

    const x = mouseX - padding.left;

    if (x < 0 || x > chartWidth) {
      this._tooltip = null;
      return;
    }

    const t = xMin + (x / chartWidth) * (xMax - xMin);

    const findStepValue = (series, time) => {
      if (!series || series.length === 0) return null;
      // Find the index of the last point <= time
      const index = this._bisectRight(series, time);
      if (index >= 0 && index < series.length) {
        return series[index].val;
      }
      return null;
    };

    const findLinearValue = (series, time) => {
      if (!series || series.length === 0) return null;

      const index = this._bisectRight(series, time);

      // Before first point
      if (index < 0) return series[0].val;
      // After last point
      if (index >= series.length - 1) return series[series.length - 1].val;

      const p1 = series[index];
      const p2 = series[index + 1];

      const t1 = p1.t;
      const t2 = p2.t;
      const v1 = p1.val;
      const v2 = p2.val;

      if (t2 === t1) return v1;

      const factor = (time - t1) / (t2 - t1);
      return v1 + (v2 - v1) * factor;
    };

    const kintValue = this._showKint ? findStepValue(kint, t) : null;
    const kextValue = this._showKext ? findStepValue(kext, t) : null;
    const tempValue = this._showTemp ? findLinearValue(temp, t) : null;
    const extTempValue = this._showExtTemp ? findLinearValue(extTemp, t) : null;
    const setpointValue = this._showSetpoint ? findStepValue(setpoint, t) : null;

    let yKint = Infinity, yKext = Infinity, yTemp = Infinity, yExtTemp = Infinity, ySetpoint = Infinity;

    if (kintValue !== null) yKint = getY_Kint(kintValue);
    if (kextValue !== null) yKext = getY_Kext(kextValue);
    if (tempValue !== null) yTemp = getY_Temp(tempValue);
    if (extTempValue !== null) yExtTemp = getY_Temp(extTempValue);
    if (setpointValue !== null) ySetpoint = getY_Temp(setpointValue);

    const distKint = Math.abs(mouseY - yKint);
    const distKext = Math.abs(mouseY - yKext);
    const distTemp = Math.abs(mouseY - yTemp);
    const distExtTemp = Math.abs(mouseY - yExtTemp);
    const distSetpoint = Math.abs(mouseY - ySetpoint);

    let active = 'kint';
    let minDist = distKint;

    if (distKext < minDist) { minDist = distKext; active = 'kext'; }
    if (distTemp < minDist) { minDist = distTemp; active = 'temp'; }
    if (distExtTemp < minDist) { minDist = distExtTemp; active = 'extTemp'; }
    if (distSetpoint < minDist) { minDist = distSetpoint; active = 'setpoint'; }

    // Check threshold (e.g. 50px)
    if (minDist > 50) {
      this._tooltip = null;
      return;
    }

    let activeValue = kintValue;
    let activeColor = 'rgb(255, 235, 59)';
    let activeTitle = 'Coef INT';
    let activeY = yKint;
    let precision = 4;

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
      precision = 1;
    } else if (active === 'extTemp') {
      activeValue = extTempValue;
      activeColor = 'rgb(25, 50, 100)';
      activeTitle = 'Ext Temp';
      activeY = yExtTemp;
      precision = 1;
    } else if (active === 'setpoint') {
      activeValue = setpointValue;
      activeColor = 'rgba(255, 152, 0, 0.8)';
      activeTitle = 'Consigne';
      activeY = ySetpoint;
      precision = 1;
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
      targetY: activeY,
      precision
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
        <div style="font-weight: bold; font-size: 1.2em;">${this._tooltip.value.toFixed(this._tooltip.precision)}</div>
      </div>
    `;
  }

  _calculateChartState() {
    if (!this._history) return null;

    const { kint, kext, temp, heating, setpoint, extTemp } = this._history;

    const width = this._width > 0 ? this._width : 800;
    const height = 300;

    const padding = { top: 10, right: 60, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const now = this._history.endTime || Date.now();
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

    // --- Dynamic Scaling Logic (Same as before) ---

    // Kint
    let kintMin = 0, kintMax = 1;
    if (kint.length > 0) {
      let minVal = Infinity, maxVal = -Infinity;
      for (const p of kint) {
        if (p.val < minVal) minVal = p.val;
        if (p.val > maxVal) maxVal = p.val;
      }
      kintMin = Math.min(0, minVal);
      kintMax = Math.max(1, maxVal);
      if (kintMax > 1) kintMax = Math.ceil(kintMax * 10) / 10;
    }

    const getY_Kint = (val) => {
      const baseY = padding.top + chartHeight - ((val - kintMin) / (kintMax - kintMin)) * chartHeight;
      return this._applyYZoom(baseY, padding.top, chartHeight);
    };

    // Kext
    let kextMin = 0, kextMax = 0.1;
    if (kext.length > 0) {
      let minVal = Infinity, maxVal = -Infinity;
      for (const p of kext) {
        if (p.val < minVal) minVal = p.val;
        if (p.val > maxVal) maxVal = p.val;
      }
      kextMin = Math.min(0, minVal);
      kextMax = Math.max(0.1, maxVal);
      if (kextMax > 0.1) kextMax = Math.ceil(kextMax * 100) / 100;
    }

    const getY_Kext = (val) => {
      const baseY = padding.top + chartHeight - ((val - kextMin) / (kextMax - kextMin)) * chartHeight;
      return this._applyYZoom(baseY, padding.top, chartHeight);
    };

    // Temp
    let tempMin = -20, tempMax = 40;
    const allTempData = [...temp, ...extTemp, ...setpoint];
    if (allTempData.length > 0) {
      const dataMin = Math.min(...allTempData.map(p => p.val));
      const dataMax = Math.max(...allTempData.map(p => p.val));
      tempMin = Math.max(-20, Math.floor(dataMin - 1));
      tempMax = Math.min(40, Math.ceil(dataMax + 1));
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

    return {
      width, height, padding, chartWidth, chartHeight,
      xMin, xMax,
      getX, getY_Kint, getY_Kext, getY_Temp,
      kintMin, kintMax,
      kextMin, kextMax,
      kint, kext, temp, heating, setpoint, extTemp
    };
  }

  _generateStaticContent(state) {
    if (!state) return svg``;

    const {
      width, height, padding, chartWidth, chartHeight,
      xMin, xMax,
      getX, getY_Kint, getY_Kext, getY_Temp,
      kintMin, kintMax,
      kextMin, kextMax,
      kint, kext, temp, heating, setpoint, extTemp
    } = state;

    // Helper functions (defined here to capture scope)
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
      const currentNow = this._history?.endTime || Date.now();
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
      const currentNow = this._history?.endTime || Date.now();
      if (currentNow > lastP.t) {
        path += ` L ${getX(currentNow).toFixed(1)},${scaleY(lastP.val).toFixed(1)}`;
      }
      path += ` L ${getX(data[data.length - 1].t).toFixed(1)},${padding.top + chartHeight}`;
      path += ` L ${getX(data[0].t).toFixed(1)},${padding.top + chartHeight} Z`;
      return path;
    };

    // Calculate Paths (Windowed)
    const visibleKint = this._showKint ? this._getVisibleData(kint, xMin, xMax) : [];
    const visibleKext = this._showKext ? this._getVisibleData(kext, xMin, xMax) : [];
    const visibleTemp = this._showTemp ? this._getVisibleData(temp, xMin, xMax) : [];
    const visibleExtTemp = this._showExtTemp ? this._getVisibleData(extTemp, xMin, xMax) : [];
    const visibleSetpoint = this._showSetpoint ? this._getVisibleData(setpoint, xMin, xMax) : [];

    const kintPath = visibleKint.length > 0 ? createSteppedLinePath(visibleKint, getY_Kint) : '';
    const kextPath = visibleKext.length > 0 ? createSteppedLinePath(visibleKext, getY_Kext) : '';
    const tempPath = visibleTemp.length > 0 ? createLinePath(visibleTemp, getY_Temp) : '';
    const extTempPath = visibleExtTemp.length > 0 ? createLinePath(visibleExtTemp, getY_Temp) : '';
    const setpointPath = visibleSetpoint.length > 0 ? createSteppedLinePath(visibleSetpoint, getY_Temp) : '';
    const setpointFilledPath = visibleSetpoint.length > 0 ? createFilledSteppedAreaPath(visibleSetpoint, getY_Temp) : '';

    // Heating Rects
    const heatingRects = [];
    if (this._showHeating && heating.length > 0) {
      const chartRight = width - padding.right;
      let startIndex = this._bisectLeft(heating, xMin);
      let endIndex = this._bisectRight(heating, xMax);
      startIndex = Math.max(0, startIndex - 1);
      endIndex = Math.min(heating.length - 1, endIndex + 1);

      for (let i = startIndex; i <= endIndex; i++) {
        if (!heating[i]) continue;
        if (heating[i].val === 1) {
          const t1 = heating[i].t;
          const t2 = (i < heating.length - 1) ? heating[i + 1].t : (this._history?.endTime || Date.now());
          if (t2 < xMin || t1 > xMax) continue;

          const x1 = getX(t1);
          const x2 = getX(t2);
          const rectX = Math.max(padding.left, Math.min(x1, x2));
          const effectiveX2 = Math.min(chartRight, Math.max(x1, x2));
          const rectWidth = effectiveX2 - rectX;

          if (rectWidth > 0) {
            heatingRects.push(svg`
              <rect
                x="${rectX}"
                y="${padding.top + chartHeight - 20}"
                width="${rectWidth}"
                height="20"
                fill="rgba(255, 152, 0, 0.5)"
                clip-path="url(#chart-clip)"
              />
            `);
          }
        }
      }
    }

    // Grids and Axes
    const kintTicks = [];
    const kintStep = kintMax > 2 ? 0.5 : 0.25;
    const kintStart = Math.ceil(kintMin / kintStep) * kintStep;
    for (let v = kintStart; v <= kintMax + 0.001; v += kintStep) kintTicks.push(v);

    const kintGrid = kintTicks.map(val => {
      const y = getY_Kint(val);
      return svg`
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.3" />
        <text x="${padding.left - 8}" y="${y + 5}" text-anchor="end" font-size="12" fill="rgb(255, 235, 59)" opacity="0.9">${val.toFixed(2)}</text>
      `;
    });

    const kextTicks = [];
    const kextStep = kextMax > 0.5 ? 0.1 : 0.05;
    const kextStart = Math.ceil(kextMin / kextStep) * kextStep;
    for (let v = kextStart; v <= kextMax + 0.0001; v += kextStep) kextTicks.push(v);

    const kextLabels = kextTicks.map(val => {
      const y = getY_Kext(val);
      return svg`
        <text x="${width - padding.right + 8}" y="${y + 5}" text-anchor="start" font-size="12" fill="rgb(76, 175, 80)" opacity="0.9">${val.toFixed(2)}</text>
      `;
    });

    const timeLabels = [];
    const durationMs = xMax - xMin;
    const targetTicks = 5;
    const rawInterval = durationMs / targetTicks;
    const niceIntervals = [3600000, 2 * 3600000, 3 * 3600000, 4 * 3600000, 6 * 3600000, 12 * 3600000, 24 * 3600000];
    let tickInterval = niceIntervals.find(i => rawInterval <= i) || niceIntervals[niceIntervals.length - 1];

    const startDate = new Date(xMin);
    startDate.setMinutes(0, 0, 0);
    if (startDate.getTime() < xMin) startDate.setTime(startDate.getTime() + 3600000);
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
          <line x1="${xPos}" y1="${padding.top + chartHeight}" x2="${xPos}" y2="${padding.top + chartHeight + 5}" stroke="#aaa" stroke-width="1" />
          <text x="${xPos}" y="${height - 18}" text-anchor="middle" font-size="12" fill="#aaa">${label}</text>
          ${subLabel ? svg`<text x="${xPos}" y="${height - 4}" text-anchor="middle" font-size="10" fill="#888">${subLabel}</text>` : ''}
        `);
      }
      currentTickTime += 3600000;
    }

    return svg`
      <defs>
        <clipPath id="chart-clip">
          <rect x="${padding.left}" y="${padding.top}" width="${chartWidth}" height="${chartHeight}" />
        </clipPath>
      </defs>

      ${kintGrid}
      ${kextLabels}
      ${timeLabels}

      <rect x="${padding.left}" y="${padding.top}" width="${chartWidth}" height="${chartHeight}" fill="transparent" stroke="var(--divider-color, #444)" stroke-width="1" opacity="0.5" />

      ${heatingRects}
      ${setpointFilledPath ? svg`<path d="${setpointFilledPath}" fill="rgba(255, 152, 0, 0.4)" stroke="none" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
      ${setpointPath ? svg`<path d="${setpointPath}" fill="none" stroke="rgba(255, 152, 0, 0.8)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
      ${tempPath ? svg`<path d="${tempPath}" fill="none" stroke="rgb(33, 150, 243)" stroke-width="1.5" opacity="0.7" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
      ${extTempPath ? svg`<path d="${extTempPath}" fill="none" stroke="rgb(25, 50, 100)" stroke-width="1.5" opacity="0.9" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
      ${kextPath ? svg`<path d="${kextPath}" fill="none" stroke="rgb(76, 175, 80)" stroke-width="2" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
      ${kintPath ? svg`<path d="${kintPath}" fill="none" stroke="rgb(255, 235, 59)" stroke-width="2.5" style="pointer-events: none;" clip-path="url(#chart-clip)" />` : ''}
    `;
  }

  _renderChart() {
    if (this._loading) return html`<div class="loading">Loading history data...</div>`;
    if (this._error) return html`<div class="error">${this._error}</div>`;
    if (!this._history || (this._history.kint.length === 0 && this._history.kext.length === 0)) {
      return html`<div class="no-data">No history data available</div>`;
    }

    // 1. Calculate / Update State if needed
    if (!this._chartState) {
      this._chartState = this._calculateChartState();
    }

    // 2. Generate / Update Static Content if needed
    if (!this._staticChartContent && this._chartState) {
      this._staticChartContent = this._generateStaticContent(this._chartState);
    }

    const { height, width } = this._chartState;
    const padding = this._chartState.padding;

    // 3. Render Dynamic Content (Tooltip)
    let tooltipIndicators = svg``;
    if (this._tooltip && this._tooltip.value !== null) {
      const tx = this._tooltip.x;
      const ty = this._tooltip.targetY;
      tooltipIndicators = svg`
        <g style="pointer-events: none;">
          <line x1="${tx}" y1="${padding.top}" x2="${tx}" y2="${height - padding.bottom}" stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="4" opacity="0.3" />
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
        style="cursor: ${this._isDragging ? 'grabbing' : 'default'}; overflow: hidden; touch-action: none;"
        @wheel="${(e) => this._handleWheel(e)}"
        @mousedown="${(e) => this._handleMouseDown(e)}"
        @mousemove="${(e) => {
        this._handleMouseMove_Drag(e);
        if (!this._isDragging) {
          this._handleMouseMove(e);
        }
      }}"
        @mouseup="${(e) => this._handleMouseUp(e)}"
        @mouseleave="${(e) => {
        this._handleMouseUp(e);
        this._handleMouseLeave();
      }}"
        @touchstart="${(e) => this._handleTouchStart(e)}"
        @touchmove="${(e) => {
        this._handleTouchMove_Drag(e);
        if (!this._isDragging && !this._isPinching) {
          this._handleTouchMove(e);
        }
      }}"
        @touchend="${(e) => this._handleTouchEnd(e)}"
      >
        ${this._staticChartContent}
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
    const isStateOn = learningData.state !== 'Off';
    const autoTpiState = isStateOn ? 'Active' : 'Off';
    const status = learningData.status || 'Waiting for update...';

    const buttonLabel = isStateOn ? 'Stop Learning' : 'Start Learning';
    const buttonIcon = isStateOn ? 'mdi:stop' : 'mdi:play';

    return html`
      <ha-card>
        <div class="card-content">
          <div class="header-row">
            <div class="header-title">${this.config.name || 'Auto-TPI Learning'}</div>
            
            <div class="controls-container">
              <div class="main-controls">
                <mwc-button
                  @click=${() => this._toggleAutoTpi(isStateOn)}
                  class="${isStateOn ? 'stop-btn' : 'start-btn'}"
                  dense
                  raised
                >
                  <ha-icon icon="${buttonIcon}" style="margin-right: 4px;"></ha-icon>
                  ${buttonLabel}
                </mwc-button>
                <ha-icon-button
                   @click="${() => this._toggleOptions()}"
                   style="margin-left: 0px; color: var(--secondary-text-color);"
                   title="Options"
                >
                  <ha-icon icon="${this._showOptions ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                </ha-icon-button>
              </div>

               ${this._showOptions ? html`
                 <div class="options-container">
                 ${!isStateOn ? html`
                  <div class="checkbox-container" @click="${() => this._toggleResetCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._resetChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">Reset</span>
                  </div>
                  <div class="checkbox-container" @click="${() => this._toggleBoostKintCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._boostKintChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">boost Kint on stagnation</span>
                  </div>
                   <div class="checkbox-container" @click="${() => this._toggleUnboostKextCheckbox()}">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${this._unboostKextChecked}
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">unboost Kext on overshoot</span>
                  </div>
                ` : html`
                  <div class="checkbox-container disabled">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${learningData.allowKintBoost}
                        disabled
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">boost Kint on stagnation</span>
                  </div>
                  <div class="checkbox-container disabled">
                    <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                      <ha-checkbox
                        .checked=${learningData.allowKextCompensation}
                        disabled
                        style="pointer-events: none;"
                      ></ha-checkbox>
                    </div>
                    <span class="checkbox-label">unboost Kext on overshoot</span>
                  </div>
                `}
                </div>
               ` : ''}
            </div>
          </div>

          <div class="telemetry">
            <div class="telemetry-content">
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
            
            <div class="zoom-controls">
              <ha-icon-button @click="${() => this._zoomIn()}">
                <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${() => this._resetZoom()}">
                <ha-icon icon="mdi:magnify-remove-outline"></ha-icon>
              </ha-icon-button>
              <ha-icon-button @click="${() => this._zoomOut()}">
                <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
              </ha-icon-button>
            </div>
          </div>

            ${this._renderChart()}
            ${this._renderTooltip()}
          </div>
          
          <div class="legend">
            <div class="legend-item clickable" @click="${() => this._toggleKint()}">
              <span class="dot kint-bg" style="opacity: ${this._showKint ? 1 : 0.3}"></span> Kint
            </div>
            <div class="legend-item clickable" @click="${() => this._toggleKext()}">
              <span class="dot kext-bg" style="opacity: ${this._showKext ? 1 : 0.3}"></span> Kext
            </div>
            <div class="legend-item clickable" @click="${() => this._toggleSetpoint()}">
              <span class="dot setpoint-bg" style="opacity: ${this._showSetpoint ? 1 : 0.3}"></span> SetPoint
            </div>
            <div class="legend-item clickable" @click="${() => this._toggleExtTemp()}">
              <span class="dot ext-temp-bg" style="opacity: ${this._showExtTemp ? 1 : 0.3}"></span> ExtTemp
            </div>
            <div class="legend-item clickable" @click="${() => this._toggleTemp()}">
              <span class="dot temp-bg" style="opacity: ${this._showTemp ? 1 : 0.3}"></span> Temp
            </div>
            <div class="legend-item clickable" @click="${() => this._toggleHeating()}">
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
  `;
}

if (!customElements.get('auto-tpi-learning-card')) {
  customElements.define('auto-tpi-learning-card', AutoTPILearningCard);
}

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

if (!customElements.get('auto-tpi-learning-card-editor')) {
  customElements.define('auto-tpi-learning-card-editor', AutoTPILearningCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'auto-tpi-learning-card')) {
  window.customCards.push({
    type: 'auto-tpi-learning-card',
    name: 'Auto-TPI Learning Card',
    description: 'Visualization of Versatile Thermostat Auto-TPI learning process'
  });
}