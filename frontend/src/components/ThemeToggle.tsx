import { useTheme } from "../hooks/useTheme";
import { Icon } from "./Icons";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "Гэрэл" : "Харанхуй";
  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={`${next} горим`}
      aria-label={`${next} горим`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
