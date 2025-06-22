'use strict';
let waitTimeout = null;   // Für den Timeout-Reference
let waitResolve = null;   // Für die resolve-Funktion
const utils = require('@iobroker/adapter-core');
const got = require('got');
const moment = require('moment');

class Solarprognose2 extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: 'solarprognose2',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.activeHours = [];
        this.apiTime = 0;
        this.instance = 0;
    }

    async onReady() {
        try {
            this.instance = this.instance;
            await this.validateConfig();
            await this.createStates();
            await this.initializeSettings();
            
            const apiTimeState = await this.getStateAsync('settings.preferredApiTime');
            this.apiTime = apiTimeState?.val || this.config.defaultApiTime;
            
            await this.preciseTiming();
        } catch (error) {
            this.log.error(`Initialization failed: ${error.message}`);
            this.stop();
        }
    }

    // ... (validateConfig, createStates, initializeSettings, getDayName bleiben unverändert)

    async preciseTiming() {
        const now = moment.utc();
        const apiMinutes = Math.floor(this.apiTime / 60);
        const apiSeconds = this.apiTime % 60;
        
        // Sekunde nach der vollen Stunde für den Vorlauf
        const leadSeconds = 0;  // Genaue volle Stunde
        const leadMinutes = apiMinutes;
        
        // Nächster Vorlauf-Zeitpunkt (volle Stunde + API-Minuten)
        let nextLeadTime = moment.utc(now)
            .set({ minute: leadMinutes, second: leadSeconds, millisecond: 0 });
            
        if (nextLeadTime.isBefore(now)) {
            nextLeadTime.add(1, 'hours');
        }
        
        // Wartezeit bis zum Vorlauf
        const waitTime = nextLeadTime.diff(now);
        
        this.log.info(`Current time: ${now.format('HH:mm:ss')} UTC`);
        this.log.info(`Lead time: ${nextLeadTime.format('HH:mm:ss')} UTC`);
        this.log.info(`Waiting ${waitTime}ms for lead time`);
        
        if (waitTime > 0) {
            // Original:
            // await new Promise(resolve => setTimeout(resolve, waitTime));
            // Geändert:
            await new Promise((resolve) => {
            waitResolve = resolve;  // resolve-Funktion speichern

            waitTimeout = setTimeout(() => {
                resolve();
                waitTimeout = null;   // Reset nach Ausführung
                waitResolve = null;
            }, waitTime);
            });
        }
        
        // Jetzt sind wir an der vollen Stunde + API-Minuten
        this.log.info('Starting preparation for API call');
        await this.prepareForApiCall();
        
        // Warte auf die genaue API-Sekunde
        const targetSeconds = apiSeconds;
        const currentSeconds = moment.utc().seconds();
        let secondsToWait = targetSeconds - currentSeconds;
        
        if (secondsToWait < 0) {
            secondsToWait += 60;
        }
        
        if (secondsToWait > 0) {
            this.log.info(`Waiting ${secondsToWait} seconds for API second`);
            // Original:
            //await new Promise(resolve => setTimeout(resolve, secondsToWait * 1000));
            // Geändert:
            await new Promise((resolve) => {
            waitResolve = resolve;  // resolve-Funktion speichern

            waitTimeout = setTimeout(() => {
                resolve();
                waitTimeout = null;   // Reset nach Ausführung
                waitResolve = null;
            }, secondsToWait * 1000);
            });
        }
        
        const currentTime = moment.utc().format('HH:mm:ss.SSS');
        this.log.info(`Executing API call at ${currentTime} UTC`);
        await this.executeUpdate();
    }

    async prepareForApiCall() {
        await this.setStateAsync('info.connection', false, true);
        this.log.info('System prepared for API call');
    }

    async executeUpdate() {
        const currentHour = moment.utc().hour();
        
        if (currentHour === 1) {
            await this.fullUpdate();
        } else {
            await this.partialUpdate();
        }
        
        await this.updateSchedule();
        this.stop();
    }

    async fullUpdate() {
        this.log.info('Starting FULL update');
        
        try {
            const data = await this.fetchForecastData();
            await this.processForecastData(data);
            
            if (data.preferredNextApiRequestAt?.secondOfHour) {
                this.apiTime = data.preferredNextApiRequestAt.secondOfHour;
                await this.setStateAsync('settings.preferredApiTime', {
                    val: this.apiTime,
                    ack: true
                });
            }
            
            await this.setStateAsync('info.connection', true, true);
        } catch (error) {
            this.log.error(`Full update failed: ${error.message}`);
        }
    }

    async partialUpdate() {
        this.log.info('Starting PARTIAL update');
        
        try {
            const data = await this.fetchForecastData();
            await this.processForecastData(data, true);
            await this.setStateAsync('info.connection', true, true);
        } catch (error) {
            this.log.error(`Partial update failed: ${error.message}`);
        }
    }

    async processForecastData(data, partial = false) {
        let todayTotal = 0;
        
        for (const [epoch, values] of Object.entries(data.data)) {
            if (!Array.isArray(values) || values.length < 2) continue;
            
            const [currentPower, cumulativeEnergy] = values;
            const time = moment.unix(epoch).utc();
            const dayOffset = time.diff(moment.utc().startOf('day'), 'days');
            const dayName = this.getDayName(dayOffset);
            const hour = time.hour();
            
            if (partial && dayOffset !== 0) continue;
            
            if (dayOffset === 0) {
                if (!this.activeHours.includes(hour)) {
                    this.activeHours.push(hour);
                }
                todayTotal = cumulativeEnergy;
            }
            
            await this.setStateAsync(`forecast.${dayName}.${hour.toString().padStart(2, '0')}_00`, {
                val: currentPower,
                ack: true
            });
            
            await this.setStateAsync(`forecast.${dayName}.total`, {
                val: cumulativeEnergy,
                ack: true
            });
        }
        
        if (!partial) {
            await this.setStateAsync('forecast.today.total', {
                val: todayTotal,
                ack: true
            });
        }
        
        await this.setStateAsync('settings.lastUpdate', {
            val: moment.utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC',
            ack: true
        });
    }

    async fetchForecastData() {
        const params = new URLSearchParams({
            'access-token': this.config.accessToken,
            'item': this.config.item,
            'id': this.config.inverterId,
            '_format': 'json',
            'start_day': this.config.startDay,
            'end_day': this.config.endDay
        });
        
        const url = `https://www.solarprognose.de/web/solarprediction/api/v1?${params}`;
        
        const response = await got(url, {
            timeout: 20000,
            retry: 0,
            headers: { 
                'User-Agent': 'ioBroker SolarPrognose2 Adapter',
                'Accept': 'application/json'
            }
        });
        
        return JSON.parse(response.body);
    }

    async updateSchedule() {
        try {
            const apiMinutes = Math.floor(this.apiTime / 60);
            const apiSeconds = this.apiTime % 60;
            
            // 1. Tägliches Vollupdate (01:XX:XX UTC)
            const fullUpdateCron = `${apiSeconds} ${apiMinutes} 1 * * *`;
            
            // 2. Teilupdates - nur Minutenkomponente
            const partialCrons = [];
            if (this.config.updateEveryXHour > 0 && this.activeHours.length > 0) {
                const sortedHours = [...this.activeHours].sort((a, b) => a - b);
                const updateHours = [];
                
                for (let i = 0; i < sortedHours.length; i += this.config.updateEveryXHour) {
                    updateHours.push(sortedHours[i]);
                }
                
                if (!updateHours.includes(sortedHours[0])) {
                    updateHours.unshift(sortedHours[0]);
                }
                
                // Für jede Stunde: Starte zur vollen Stunde + API-Minuten
                updateHours.forEach(hour => {
                    partialCrons.push(`${apiSeconds} ${apiMinutes} ${hour} * * *`);
                });
            }
            
            const scheduleString = [fullUpdateCron, ...partialCrons].join(';');
            
            await this.extendObjectAsync(this.instance, {
                common: { schedule: scheduleString }
            });
            
            this.log.info(`Updated schedule: ${scheduleString}`);
        } catch (error) {
            this.log.error(`Schedule update failed: ${error.message}`);
        }
    }

    onUnload(callback) {
        try {
            // Existierenden Timeout abbrechen
            if (waitTimeout) {
            clearTimeout(waitTimeout);
            waitTimeout = null;
            }
            
            // Promise manuell auflösen (verhindert Hängen)
            if (waitResolve) {
            waitResolve();
            waitResolve = null;
            }
            
            // Hier ggf. andere Resourcen bereinigen
            callback();
        } catch (err) {
            callback();
        }
    }
}

if (module.parent) {
    module.exports = (options) => new Solarprognose2(options);
} else {
    new Solarprognose2();
}