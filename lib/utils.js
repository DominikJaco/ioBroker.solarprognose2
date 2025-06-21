/**
 * Utility functions for SolarPrognose adapter
 */
class SolarUtils {
    static getDayName(dayOffset, lang) {
        const days = {
            en: {
                '-2': 'Day before yesterday',
                '-1': 'Yesterday',
                '0': 'Today',
                '1': 'Tomorrow',
                '2': 'Day after tomorrow',
                '3': 'In 3 days',
                '4': 'In 4 days',
                '5': 'In 5 days',
                '6': 'In 6 days'
            },
            de: {
                '-2': 'Vorgestern',
                '-1': 'Gestern',
                '0': 'Heute',
                '1': 'Morgen',
                '2': 'Übermorgen',
                '3': 'In 3 Tagen',
                '4': 'In 4 Tagen',
                '5': 'In 5 Tagen',
                '6': 'In 6 Tagen'
            },
            ru: {
                '-2': 'Позавчера',
                '-1': 'Вчера',
                '0': 'Сегодня',
                '1': 'Завтра',
                '2': 'Послезавтра',
                '3': 'Через 3 дня',
                '4': 'Через 4 дня',
                '5': 'Через 5 дней',
                '6': 'Через 6 дней'
            },
            // Add other languages similarly
            fr: {
                '-2': 'Avant-hier',
                '-1': 'Hier',
                '0': 'Aujourd\'hui',
                '1': 'Demain',
                '2': 'Après-demain',
                '3': 'Dans 3 jours',
                '4': 'Dans 4 jours',
                '5': 'Dans 5 jours',
                '6': 'Dans 6 jours'
            }
        };
        
        return days[lang]?.[dayOffset] || days['en'][dayOffset] || `Day ${dayOffset}`;
    }

    static calculateTimeComponents(totalSeconds) {
        return {
            hour: Math.floor(totalSeconds / 3600),
            minute: Math.floor((totalSeconds % 3600) / 60),
            second: totalSeconds % 60
        };
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SolarUtils;