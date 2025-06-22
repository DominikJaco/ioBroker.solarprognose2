// admin/src/index.tsx
import { JsonConfigComponent, loadTranslations } from "@iobroker/adapter-react-v5";
import { Theme, ThemeType } from "@iobroker/adapter-react-v5/types";
import * as React from "react";

// Laden der Übersetzungen
const translations = {
  de: require("../i18n/de.json"),
  en: require("../i18n/en.json"),
  ru: require("../i18n/ru.json"),
};

interface SettingsProps {
  theme: ThemeType;
}

const SettingsPage: React.FC<SettingsProps> = ({ theme }) => {
  return (
    <Theme theme={theme}>
      <JsonConfigComponent
        adapter="solarprognose2"
        translations={translations}
      />
    </Theme>
  );
};

// Initialisierung der Übersetzungen
loadTranslations(translations);

export default SettingsPage;