const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const SolarUtils = require('./lib/utils');

class SolarPrognose extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'solarprognose'
        });
        
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        
        this.timers = {};
        this.config = {};
        this.systemLang = 'en';
    }

    async onReady() {
        try {
            this.systemLang = this.systemConfig.common.language;
            this.config = this.config.native;
            
            // Set connection state
            await this.setStateAsync('info.connection', true, true);
            
            // Initialize objects
            await this.initializeObjects();
            
            // Schedule first update
            await this.scheduleFirstUpdate();
            
            this.log.info('Adapter initialized');
        } catch (error) {
            this.log.error(`Initialization failed: ${error.message}`);
            await this.setStateAsync('info.connection', false, true);
        }
    }

    async initializeObjects() {
        // Create forecast structure
        await this.setObjectNotExistsAsync('forecasts', {
            type: 'channel',
            common: {
                name: 'Solar Forecasts',
                desc: 'Contains solar forecast data'
            },
            native: {}
        });
        
        await this.setObjectNotExistsAsync('forecasts.arrays', {
            type: 'channel',
            common: {
                name: 'Forecast Arrays',
                desc: 'Contains forecast data as JSON arrays'
            },
            native: {}
        });

        // Create day channels
        for (let day = this.config.startDay; day <= this.config.endDay; day++) {
            const dayName = SolarUtils.getDayName(day, this.systemLang);
            
            // Day channel
            await this.setObjectNotExistsAsync(`forecasts.${dayName}`, {
                type: 'channel',
                common: { name: dayName },
                native: {}
            });
            
            // Hour states
            for (let hour = 0; hour < 24; hour++) {
                const hh = hour.toString().padStart(2, '0');
                await this.setObjectNotExistsAsync(`forecasts.${dayName}.${hh}00`, {
                    type: 'state',
                    common: {
                        name: `${hh}:00`,
                        type: 'number',
                        role: 'value',
                        unit: 'kW',
                        read: true,
                        write: false
                    },
                    native: {}
                });
            }
            
            // Array state
            await this.setObjectNotExistsAsync(`forecasts.arrays.${dayName}`, {
                type: 'state',
                common: {
                    name: `${dayName} Forecast Array`,
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                    def: JSON.stringify(Array(24).fill(0))
                },
                native: {}
            });
        }
    }

    async fetchForecast() {
        const params = new URLSearchParams({
            'access-token': this.config.accessToken,
            'project': this.config.project,
            'item': this.config.item,
            'id': this.config.inverterId,
            'type': this.config.apiType,
            '_format': 'json',
            'start_day': this.config.startDay,
            'end_day': this.config.endDay
        });
        
        const url = `https://www.solarprognose.de/web/solarprediction/api/v1?${params}`;
        
        const response = await axios.get(url, {
            timeout: this.config.requestTimeout,
            validateStatus: (status) => status < 500
        });
        
        if (response.status !== 200) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        if (response.data.status !== 0) {
            throw new Error(`API error ${response.data.status}`);
        }
        
        return response.data;
    }

    async processDay(data, dayOffset) {
        const dayName = SolarUtils.getDayName(dayOffset, this.systemLang);
        const hourlyArray = Array(24).fill(0);
        let dayTotal = 0;
        const isHourly = this.config.apiType === 'hourly';

        if (isHourly) {
            // Process hourly data
            const timestamps = Object.keys(data.data)
                .map(ts => parseInt(ts))
                .sort((a, b) => a - b);
            
            for (const epoch of timestamps) {
                const values = data.data[epoch];
                const date = new Date(epoch * 1000);
                const hour = date.getHours();
                hourlyArray[hour] = values[0]; // currentPower
                dayTotal = values[1]; // cumulativeEnergy
            }
        } else {
            // Process daily data
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            const dateKey = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`;
            dayTotal = data.data[dateKey] || 0;
            const avgHourly = dayTotal / 24;
            hourlyArray.fill(avgHourly);
        }
        
        // Update states
        const stateUpdates = [];
        
        for (let hour = 0; hour < 24; hour++) {
            const hh = hour.toString().padStart(2, '0');
            stateUpdates.push(
                this.setStateAsync(`forecasts.${dayName}.${hh}00`, hourlyArray[hour], true)
            );
        }
        
        stateUpdates.push(
            this.setStateAsync(`forecasts.arrays.${dayName}`, JSON.stringify(hourlyArray), true)
        );
        
        await Promise.all(stateUpdates);
        
        return {
            preferredApiTime: data.preferredNextApiRequestAt?.secondOfHour
        };
    }

    async updateForecast() {
        try {
            const data = await this.fetchForecast();
            const dayProcessing = [];
            
            for (let day = this.config.startDay; day <= this.config.endDay; day++) {
                dayProcessing.push(this.processDay(data, day));
            }
            
            await Promise.all(dayProcessing);
            this.log.info('Forecast updated successfully');
            return true;
        } catch (error) {
            this.log.error(`Forecast update failed: ${error.message}`);
            return false;
        }
    }

    async scheduleFirstUpdate() {
        const now = new Date();
        const utcSeconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
        let delaySeconds = this.config.defaultApiTime - utcSeconds;
        if (delaySeconds < 0) delaySeconds += 86400;
        
        this.timers.firstUpdate = setTimeout(async () => {
            const success = await this.updateForecast();
            if (success) this.scheduleRecurring();
        }, delaySeconds * 1000);
        
        this.log.info(`First update scheduled in ${delaySeconds} seconds`);
    }

    scheduleRecurring() {
        // Clear existing timers
        if (this.timers.daily) clearInterval(this.timers.daily);
        if (this.timers.hourly) clearInterval(this.timers.hourly);
        
        // Daily update
        this.timers.daily = setInterval(async () => {
            await this.updateForecast();
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        // Hourly updates
        if (this.config.updateEveryXHour > 0) {
            this.timers.hourly = setInterval(async () => {
                await this.updateForecast();
            }, this.config.updateEveryXHour * 60 * 60 * 1000);
        }
        
        this.log.info('Recurring updates scheduled');
    }

    onUnload(callback) {
        try {
            Object.values(this.timers).forEach(timer => clearTimeout(timer));
            this.setState('info.connection', false, true);
            this.log.info('Adapter stopped');
            callback();
        } catch (error) {
            callback();
        }
    }

    onStateChange(id, state) {
        if (state && !state.ack) {
            this.log.debug(`State ${id} changed: ${state.val}`);
        }
    }
}

function startAdapter(options) {
    return new SolarPrognose(options);
}

module.exports = startAdapter;