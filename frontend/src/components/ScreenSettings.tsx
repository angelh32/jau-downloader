import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export default function ScreenSettings() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("settings.title")}</h2>
      <p className="subtitle">{t("settings.coming_soon")}</p>

      <div className="setting-row">
        <label>{t("language.label")}</label>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
}
