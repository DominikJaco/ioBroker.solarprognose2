# ioBroker.solarprognose2 Adapter

![Logo](https://raw.githubusercontent.com/DominikJaco/ioBroker.solarprognose2/main/admin/solarprognose2.png)

[![NPM version](https://img.shields.io/npm/v/iobroker.solarprognose2.svg)](https://www.npmjs.com/package/iobroker.solarprognose2)
[![Downloads](https://img.shields.io/npm/dm/iobroker.solarprognose2.svg)](https://www.npmjs.com/package/iobroker.solarprognose2)
![Number of Installations](https://iobroker.live/badges/solarprognose2-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/solarprognose2-stable.svg)
[![Dependency Status](https://img.shields.io/david/DominikJaco/ioBroker.solarprognose2.svg)](https://david-dm.org/DominikJaco/ioBroker.solarprognose2)
[![Known Vulnerabilities](https://snyk.io/test/github/DominikJaco/ioBroker.solarprognose2/badge.svg)](https://snyk.io/test/github/DominikJaco/ioBroker.solarprognose2)

**Tests:** ![Test and Release](https://github.com/DominikJaco/ioBroker.solarprognose2/workflows/Test%20and%20Release/badge.svg)

## Solarprognose2 Adapter für ioBroker

Dieser Adapter liefert Solarprognosen für ioBroker basierend auf Daten von [solarprognose.de](https://www.solarprognose.de). Er bietet stündliche Vorhersagen der Solarproduktion für mehrere Tage im Voraus.

## Funktionen

- **Mehrtagesprognose**: Vorhersage der Solarproduktion für bis zu 7 Tage
- **UTC-basierte Zeitsteuerung**: Präzise Zeitberechnungen unabhängig von lokalen Zeitzonen
- **Automatische Updates**: 
  - Tägliches Vollupdate um 01:XX UTC
  - Teilupdates während der Produktionsstunden
- **Flexible Konfiguration**: Anpassbarer Vorhersagezeitraum und Update-Intervalle
- **Detaillierte Zustände**: Stündliche Prognosewerte und Tagesgesamtsummen

## Installation

1. **Adapter installieren**:
   - Über die ioBroker Admin-Oberfläche: "Adapter" → Suche nach "solarprognose2" → Installieren
   - Oder via CLI: `iobroker add solarprognose2`

2. **Adapter konfigurieren**:
   - In der ioBroker Admin-Oberfläche: "Instanzen" → solarprognose2 Instanz → Konfiguration

## Konfiguration

### Obligatorische Parameter

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|----------|
| **Access Token** | Von solarprognose.de bezogenes API-Token | `bdb1667e6a17553bbe82b6d3169d77bc` |
| **Inverter ID** | ID des Wechselrichters bei solarprognose.de | `6620` |
| **Item** | Gerätetyp (`inverter` oder `system`) | `inverter` |

### Optionale Parameter

| Parameter | Beschreibung | Standard | Bereich |
|-----------|-------------|----------|---------|
| **Start Day** | Erster Prognosetag (negative Werte = Vergangenheit) | `-2` | -7 bis 0 |
| **End Day** | Letzter Prognosetag (positive Werte = Zukunft) | `3` | 0 bis 7 |
| **Update Intervall** | Häufigkeit der Teilupdates während Produktion | `2` | 0-24 (0 = deaktiviert) |
| **Default API Time** | Standard-API-Zeit (Sekunden nach Stunde) | `2133` | 0-3599 |

## Update-Zeitplan

### Tägliches Vollupdate
- **Zeitpunkt**: Täglich um 01:XX UTC
- **XX**: Wird dynamisch von der API bestimmt (oder Default-Wert)
- **Funktion**: Lädt Prognosedaten für alle konfigurierten Tage
- **Dauer**: Ca. 5-10 Sekunden

### Teilupdates
- **Aktivierung**: Nur wenn "Update Intervall" > 0 konfiguriert ist
- **Zeitpunkt**: Zur vollen UTC-Stunde während der Produktionszeit
- **Beispiele**:
  - Intervall = 1: Updates jede Stunde (06:00, 07:00, ...)
  - Intervall = 2: Updates alle 2 Stunden (06:00, 08:00, ...)
- **Funktion**: Aktualisiert nur die Daten für den aktuellen Tag
- **Dauer**: Ca. 2-5 Sekunden

## Zustände

### Info-Zustände
| Zustandspfad | Beschreibung | Typ |
|--------------|-------------|------|
| `info.connection` | Verbindungsstatus zur API | boolean |
| `settings.preferredApiTime` | Bevorzugte API-Zeit (Sekunden) | number |
| `settings.lastUpdate` | Zeitpunkt des letzten Updates | string |

### Prognose-Zustände
Für jeden Prognosetag werden folgende Zustände erstellt:

| Zustandspfad | Beschreibung | Typ | Einheit |
|--------------|-------------|------|---------|
| `forecast.[tag].XX_00` | Prognostizierte Leistung um XX:00 UTC | number | W |
| `forecast.[tag].total` | Prognostizierte Tagesgesamtproduktion | number | Wh |

**Tagnamen**:
- `day_minus7` bis `day_minus1` (vergangene Tage)
- `today` (heute)
- `tomorrow` (morgen)
- `in_2_days` bis `in_7_days` (zukünftige Tage)

## Beispieldaten
forecast.today.06_00 = 125 W
forecast.today.07_00 = 340 W
forecast.today.08_00 = 780 W
...
forecast.today.total = 5200 Wh

forecast.tomorrow.06_00 = 110 W
forecast.tomorrow.07_00 = 320 W
...
forecast.tomorrow.total = 4800 Wh

## Fehlerbehandlung
- Bei Verbindungsproblemen wird `info.connection = false`
- Fehler werden detailliert im ioBroker-Log protokolliert
- Automatische Wiederholung bei API-Fehlern

## Unterstützung
Bei Problemen oder Fragen:
- [GitHub Issues](https://github.com/DominikJaco/ioBroker.solarprognose2/issues)
- [ioBroker Forum](https://forum.iobroker.net)

## Changelog
[Siehe CHANGELOG.md](CHANGELOG.md)
# [0.0.10] - 2025-06-22
### Breaking Changes
- **Betriebsmodus-Wechsel**: Der Adapter läuft jetzt im `schedule`-Modus statt als Daemon
- **Startverhalten**: Der Adapter wird nur noch zu Update-Zeiten gestartet und beendet sich danach automatisch

## Entwickler
- DominikJaco ([GitHub](https://github.com/DominikJaco))

## License
MIT License

Copyright (c) 2025 DominikJaco <dominikjaco@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.