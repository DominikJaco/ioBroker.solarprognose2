// admin/src/index.tsx
import React from "react";
import { SettingsPage, Theme } from "@iobroker/adapter-react-v5";

// Importiere die Übersetzungen
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";
import it from "../i18n/it.json";
import nl from "../i18n/nl.json";
import pl from "../i18n/pl.json";
import pt from "../i18n/pt.json";
import ru from "../i18n/ru.json";
import uk from "../i18n/uk.json";
import zhCn from "../i18n/zh-cn.json";

// Importiere die Konfiguration
import config from "../jsonConfig.json";

const AppSettings: React.FC<{ theme: "light" | "dark" }> = ({ theme }) => {
  return (
    <Theme theme={theme}>
      <SettingsPage
        adapter="solarprognose2"
        config={config}
        translations={{
          de,
          en,
          es,
          fr,
          it,
          nl,
          pl,
          pt,
          ru,
          uk,
          zhCn
        }}
      />
    </Theme>
  );
};

export default AppSettings;