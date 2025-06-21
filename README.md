# iobroker.solarprognose2

[![NPM version](http://img.shields.io/npm/v/iobroker.solarprognose2.svg)](https://www.npmjs.com/package/iobroker.solarprognose2)
![Number of Installations](http://iobroker.live/badges/solarprognose2-installed.svg)
![Stable version](http://iobroker.live/badges/solarprognose2-stable.svg)

Solar forecast adapter for ioBroker that retrieves data from solarprognose.de.

## Features
- Supports both hourly and daily forecasts
- Multilingual interface (11 languages)
- Automatic scheduling based on API recommendations
- Stores data in multiple formats:
  - Individual hour states
  - Daily totals
  - JSON arrays for easy processing
- Configurable update intervals
- Advanced error handling with retries

## Installation
1. Install via ioBroker Admin Interface
2. Configure with your API token and inverter details
3. Adapter will automatically fetch forecasts

## Configuration
1. **API Settings**: Enter your access token and inverter details
2. **Forecast Settings**: Choose forecast type and day range
3. **Advanced Settings**: Fine-tune update behavior

## Supported Languages
- English (en)
- German (de)
- Russian (ru)
- Portuguese (pt)
- Dutch (nl)
- French (fr)
- Italian (it)
- Spanish (es)
- Polish (pl)
- Ukrainian (uk)
- Chinese (zh-cn)

## Changelog
### 1.0.0
- Initial release

## License
MIT License

Copyright (c) [year] [fullname]
