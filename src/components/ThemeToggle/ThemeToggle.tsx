import { useTheme } from "../../theme/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Dark mode"
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
    >
      ◐
    </button>
  );
}
