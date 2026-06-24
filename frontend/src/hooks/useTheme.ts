import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "theme";

function read(): Theme {
  const v = localStorage.getItem(KEY);
  return v === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// Анхны утгыг модуль ачаалахад нэг удаа тавьж, гялсхийлтээс сэргийлнэ
apply(read());

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}
