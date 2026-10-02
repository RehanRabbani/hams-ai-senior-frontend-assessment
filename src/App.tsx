import { useEffect, useRef, useState } from "react";
import { useLiveCalls } from "./hooks/useLiveCalls";
import { CallBoard } from "./components/CallBoard";
import { CallDetails } from "./components/CallDetails";
import { translations, type UiLanguage } from "./core/i18n";
import "./App.css";

function App() {
  const {
    calls,
    connected,
    chaosEnabled,
    announcement,
    toggleChaos,
    disconnect,
    reconnect,
  } = useLiveCalls();

  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [language, setLanguage] = useState<UiLanguage>("ar");

  const callDetailsRef = useRef<HTMLElement | null>(null);

  const t = translations[language];

  const selectedCall =
    calls.find((call) => call.callId === selectedCallId) ?? null;

  useEffect(() => {
    if (selectedCallId) {
      callDetailsRef.current?.focus();
    }
  }, [selectedCallId]);

  return (
    <div
      className="app-layout"
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language}
    >
      <div className="language-switch">
        <label htmlFor="ui-language">{t.language}</label>

        <select
          id="ui-language"
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as UiLanguage)
          }
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {connected ? "Connection restored" : "Connection lost"}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <CallBoard
        calls={calls}
        selectedCallId={selectedCallId}
        connected={connected}
        chaosEnabled={chaosEnabled}
        onSelect={setSelectedCallId}
        onToggleChaos={toggleChaos}
        onDisconnect={disconnect}
        onReconnect={reconnect}
      />

      <CallDetails
        call={selectedCall}
        detailsRef={callDetailsRef}
      />
    </div>
  );
}

export default App;