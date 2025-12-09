import { useTheme } from "../../contexts/ThemeContext";
import { Send } from "lucide-react";

const MessengerContact = () => {
  const { isDark } = useTheme();

  return (
    <a
      href="https://m.me/100046862849862"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 right-4 z-40 animate-fade-in transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-blue-600/90 to-blue-700/90 border border-blue-500/30 shadow-lg shadow-blue-500/20 hover:from-blue-500/90 hover:to-blue-600/90"
          : "bg-gradient-to-br from-blue-500/90 to-blue-600/90 border border-blue-400/40 shadow-lg shadow-blue-400/20 hover:from-blue-400/90 hover:to-blue-500/90"
      } rounded-lg p-2 backdrop-blur-xl hover:shadow-xl hover:scale-110 transform cursor-pointer group`}
      title="Liên hệ qua Messenger"
    >
      {/* Icon */}
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${isDark ? "text-white" : "text-white"}`}>
          <Send size={14} strokeWidth={2} />
        </div>
        <span className="text-xs font-bold text-white">Liên hệ</span>
      </div>

      {/* Hover pulse effect */}
      <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
    </a>
  );
};

export default MessengerContact;
