# Versatile Thermostat Auto-TPI Learning Card

Lovelace Home-assistant card for **Versatile Thermostat** AUTO-TPI feature.

The main goal of this card is to display historical data of an Auto TPI learning session. It allows you to visualize the convergence of the coefficients (Kint and Kext) and analyze their correlation with internal/external temperatures and heating cycles.

![image](assets/card.png)

## Requirements

*   [Versatile Thermostat](https://github.com/jmcollin78/versatile_thermostat) integration installed.
*   A thermostat entity configured with **Auto-TPI** enabled.

## Installation

### Via the Home Assistant Marketplace (HACS) (Recommended)

This card is available in the Home Assistant Marketplace (HACS before Home Assistant 2026.11).

<!-- ha-marketplace:exclude-start -->
[![Open your Home Assistant instance and open a repository in the Marketplace.](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=KipK&repository=auto-tpi-learning-card&category=plugin)

Home Assistant older than 2026.11: [open it in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=KipK&repository=auto-tpi-learning-card&category=plugin).
<!-- ha-marketplace:exclude-end -->

1.  Use the button above to add this repository, **or** manually add this repository URL to the Marketplace (HACS before Home Assistant 2026.11):
    *   Go to **HACS** > **Frontend**.
    *   Click the 3 dots in the top right corner > **Custom repositories**.
    *   URL: `https://github.com/KipK/auto-tpi-learning-card`
    *   Category: **Lovelace**
    *   Click **Add**.

2.  Search for **Auto TPI Learning** and click **Download**.

3.  Reload your resources if prompted.

### Manual Installation

1.  Download the `auto-tpi-learning-card.js` file from the [Releases](https://github.com/KipK/auto-tpi-learning-card/releases) page or the `dist` folder.
2.  Copy the file to your Home Assistant `config/www/community/auto-tpi-learning-card/` directory.
3.  Add the resource to your Dashboard:
    *   Go to **Settings** > **Dashboards** > **Three dots** (top right) > **Resources**.
    *   Click **Add Resource**.
    *   URL: `/local/community/auto-tpi-learning-card/auto-tpi-learning-card.js`
    *   Resource Type: **JavaScript Module**.

## Configuration

You can configure the card using the visual editor or via YAML.

### Visual Editor

1.  Edit your dashboard.
2.  Click **Add Card**.
3.  Search for and select **Auto-TPI Learning Card**.
4.  **Name**: (Optional) specific title for the card.
5.  **Climate Entity**: Select your Versatile Thermostat entity.
6.  **Learning Entity**: Select the associated learning state sensor (e.g., `sensor.thermostat_auto_tpi_learning_state`). The editor will attempt to auto-detect this based on the climate entity.
7.  **External Temperature Entity**: (Optional) Select the outdoor temperature sensor to display the outside temperature curve. Leave empty to hide this curve.

![image](assets/config.png)

### YAML Configuration

```yaml
type: custom:auto-tpi-learning-card
name: Salon Learning Session
climate_entity: climate.salon
learning_entity: sensor.salon_auto_tpi_learning_state
ext_temp_entity: sensor.outdoor_temperature
```

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | **Yes** | `custom:auto-tpi-learning-card` |
| `climate_entity` | string | **Yes** | The VTherm climate entity. |
| `learning_entity` | string | **Yes** | The sensor entity tracking the learning state. |
| `ext_temp_entity` | string | No | Outdoor temperature sensor used for the external temperature curve. When empty, the curve and its legend entry are hidden. |
| `name` | string | No | Custom title for the card. |

## Features

*   **Interactive Chart**:
    *   **Zoom**: Use the mouse wheel or pinch gesture to zoom in/out.
    *   **Pan**: Drag the chart left/right to move through time.
*   **Data Series**:
    *   **Kint**: Calculated Internal Coefficient.
    *   **Kext**: Calculated External Coefficient.
    *   **Temp**: Current room temperature.
    *   **ExtTemp**: External temperature, from the configured external temperature entity (hidden when not configured).
    *   **SetPoint**: Target temperature.
    *   **Heating**: Orange bars indicating when the heating was active.
*   **Legend**: Click on legend items to toggle the visibility of specific series.
*   **Tooltip**: Hover over the chart to see precise values for specific timestamps.

## Build

To build the card from source:

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Build the project:
    ```bash
    npm run build
