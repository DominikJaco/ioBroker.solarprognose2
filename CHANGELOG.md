# Changelog

## [0.0.3] - 2025-06-23
### Added
- Comprehensive testing framework with Mocha and Chai
- Basic unit tests for adapter configuration and package validation
- GitHub Actions integration for automated testing
- Test directory structure with sample tests

### Changed
- Updated development dependencies for testing
- Improved CI/CD workflow for better quality assurance
- Refined npm test scripts for better test execution

## [0.0.2] - 2025-06-23
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