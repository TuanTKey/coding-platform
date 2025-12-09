import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Clock } from "lucide-react";

const DateTimeWidget = () => {
  const { isDark } = useTheme();
  const [dateTime, setDateTime] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format date: dd/MM/yyyy
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      // Format time: HH:mm:ss
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      setDateTime({
        date: formattedDate,
        time: formattedTime,
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 animate-fade-in transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
          : "bg-gradient-to-br from-white/90 to-slate-50/90 border border-cyan-400/40 shadow-lg shadow-cyan-400/20"
      } rounded-lg p-2 backdrop-blur-xl hover:shadow-xl hover:scale-105 transform cursor-default group`}
    >
      {/* Icon */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`p-1 rounded ${
            isDark
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-cyan-100/50 text-cyan-600"
          }`}
        >
          <Clock size={14} strokeWidth={2} />
        </div>
        <span
          className={`text-xs font-bold ${
            isDark ? "text-cyan-400/70" : "text-cyan-600/70"
          }`}
        >
          Giờ
        </span>
      </div>

      {/* Date and Time Display */}
      <div className="space-y-0.5">
        {/* Date */}
        <div className="flex items-baseline gap-1">
          <span
            className={`text-xs font-bold tracking-tight group-hover:text-cyan-400 transition-colors ${
              isDark ? "text-cyan-300" : "text-cyan-600"
            }`}
          >
            {dateTime.date}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-baseline gap-0.5">
          <span
            className={`text-sm font-bold tracking-tighter group-hover:text-cyan-400 transition-colors ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {dateTime.time}
          </span>
          <span
            className={`text-xs font-semibold ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            VN
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-1 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        <span
          className={`text-xs font-medium ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Live
        </span>
      </div>
    </div>
  );
};

export default DateTimeWidget;
