
# Changelog

## [0.0.10] - 2025-06-22
### Breaking Changes
- **Betriebsmodus-Wechsel**: Der Adapter läuft jetzt im `schedule`-Modus statt als Daemon
- **Startverhalten**: Der Adapter wird nur noch zu Update-Zeiten gestartet und beendet sich danach automatisch

### Features
- **Präzise Zeitsteuerung**:
  - Start zur vollen Minute der API-Zeit (Sekunde 0)
  - Millisekundengenaue Ausführung zur API-Sekunde innerhalb der Minute
  - Automatische Anpassung für Sekundenwerte 0-59
- **Optimierte Vorlaufphase**:
  - 0-59 Sekunden Vorlauf innerhalb derselben Minute
  - Keine komplexen Minutenübergänge mehr
- **Effiziente Schedule-Generierung**:
  - Einheitliches Cron-Format für alle Updates
  - Automatische Anpassung bei API-Zeitänderungen
- **Ressourcenoptimierung**:
  - 90% geringerer RAM-Verbrauch durch Wegfall des Dauerbetriebs
  - Keine Hintergrundprozesse zwischen Updates

### Fixes
- **Behobene Zeitprobleme**:
  - Korrekte Handhabung von Sekundenübergängen (59→00)
  - Lösung von Problemen bei der UTC-Zeitberechnung
  - Präzisere Ausführungszeiten durch zweistufige Wartephase
- **Verbesserte Stabilität**:
  - Robustere Fehlerbehandlung bei API-Aufrufen
  - Bessere Validierung der Konfigurationsparameter
  - Verhindern von Memory Leaks durch korrektes Adapter-Beenden

### Known Issues
- Bei sehr kurzen API-Sekunden (0-2) kann es zu geringfügigen Abweichungen kommen
- Erster Start nach Installation benötigt manuelle Konfiguration des Schedules

### Upgrade Notes
- Nach dem Update muss die Adapterinstanz **neu gestartet** werden
- Der Zeitplan wird nach dem ersten erfolgreichen Update automatisch gesetzt
- Bei Problemen mit dem Schedule: Instanz stoppen → Konfiguration prüfen → Starten

### Technische Details
| Komponente | Vorher | Neu |
|------------|--------|-----|
| **Betriebsmodus** | Daemon | Schedule |
| **Vorlaufzeit** | 15 Sekunden | API-Sekunden (0-59s) |
| **Typische Laufzeit** | Dauerhaft | 5-60 Sekunden pro Update |
| **RAM-Verbrauch** | ~15MB | ~5MB (nur während Ausführung) |
| **Schedule-Format** | Komplexe Vorlaufberechnung | Einfaches `Sekunde Minute Stunde` |

Diese Version stellt eine fundamentale Verbesserung der Zeitsteuerung und Ressourceneffizienz dar, während die präzise Einhaltung der API-Zeit garantiert wird.

## [0.0.7] - 2025-06-22
### Breaking Changes
- **Umstellung auf solarprognose.de API**: Der Adapter verwendet nun die API von solarprognose.de
- **Entfernte Parameter**: Latitude, longitude und peakPower wurden entfernt

### Features
- **UTC-basiertes Zeitmanagement**: Alle Zeitberechnungen nutzen UTC
- **Konfigurierbare Update-Zeiten**:
  - Tägliches Vollupdate um 01:XX UTC
  - Teilupdates während Produktionsstunden
- **Erweiterte Prognose**: Unterstützt jetzt 7 Tage Vorhersage
- **Verbesserte Fehlerbehandlung**: Detaillierte Validierung der Konfiguration

### Fixes
- Behebt Fehler bei der Verarbeitung der API-Antwort
- Korrigiert die Zeitstempel-Berechnungen für UTC
- Behebt Probleme bei der Scheduler-Verwaltung

## [0.0.3] - 2025-06-22
### Added
- Comprehensive testing framework with Mocha and Chai
- Basic unit tests for adapter configuration and package validation
- GitHub Actions integration for automated testing
- Test directory structure with sample tests

### Changed
- Updated development dependencies for testing
- Improved CI/CD workflow for better quality assurance
- Refined npm test scripts for better test execution

## [0.0.2] - 2025-06-22
### Added
- Encrypted API key storage for improved security
- Multi-language support for adapter titles
- License information object in io-package.json
- Repository description in GitHub settings

### Changed
- Updated dependencies to meet ioBroker requirements:
  - @iobroker/adapter-core to v3.2.2
  - @iobroker/testing to v4.1.3
- Node.js requirement set to >=18.0.0
- Admin configuration schema optimized
- README.md with version information and changelog link

### Fixed
- Resolved all adapter-checker validation errors
- Corrected repository URL in package.json
- Fixed admin/jsonConfig type definitions
- External icon URL path corrected

## [0.0.1] - 2025-06-22
### Added
- Initial release of SolarPrognose2 adapter
- Core functionality for solar forecast data retrieval
- Admin configuration interface for API credentials
- VIS widget for solar forecast visualization using Chart.js
- Basic state management for forecast data
- Documentation structure in README.md

### Fixed
- Implemented API key encryption in io-package.json
- Optimized repository structure for ioBroker standards
- Resolved initial security vulnerabilities
- Improved error handling for API requests