import { useTheme } from "../../contexts/ThemeContext";

const CodeJudgeLogo = () => {
  const { isDark } = useTheme();

  return (
    <div className="relative flex items-center gap-3 transition-opacity group hover:opacity-80">
      {/* Main Logo Container with Satellites */}
      <div className="relative w-12 h-12">
        {/* Orbiting Satellites */}
        <style>{`
          @keyframes orbit {
            from {
              transform: rotate(0deg) translateX(20px) rotate(0deg);
            }
            to {
              transform: rotate(360deg) translateX(20px) rotate(-360deg);
            }
          }

          @keyframes pulse-glow {
            0%, 100% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
          }

          .satellite {
            animation: orbit 8s linear infinite;
          }

          .satellite:nth-child(2) {
            animation-delay: -2.67s;
          }

          .satellite:nth-child(3) {
            animation-delay: -5.33s;
          }

          .glow-pulse {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>

        {/* Central Icon - Globe/Web */}
        <div
          className={`absolute inset-0 p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center ${
            isDark
              ? "group-hover:shadow-cyan-500/50"
              : "group-hover:shadow-cyan-400/50"
          }`}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Globe */}
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>

          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-xl bg-cyan-400 opacity-0 group-hover:opacity-20 glow-pulse transition-all`}
          />
        </div>

        {/* Three Satellites Orbiting */}
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="satellite absolute w-full h-full"
            style={{
              transformOrigin: "50% 50%",
            }}
          >
            {/* Orbital ring (visible on hover) */}
            {index === 0 && (
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30 group-hover:border-cyan-400/50 transition-all" />
            )}

            {/* Satellite dot */}
            <div
              className={`absolute w-2 h-2 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg ${
                index === 0
                  ? "bg-cyan-300"
                  : index === 1
                  ? "bg-blue-300"
                  : "bg-purple-300"
              }`}
              style={{
                transform: `translate(20px, -1px)`,
                boxShadow: `0 0 8px ${
                  index === 0
                    ? "rgba(34, 211, 238, 0.8)"
                    : index === 1
                    ? "rgba(96, 165, 250, 0.8)"
                    : "rgba(168, 85, 247, 0.8)"
                }`,
              }}
            >
              {/* Satellite glow */}
              <div
                className={`absolute inset-0 rounded-full animate-pulse ${
                  index === 0
                    ? "bg-cyan-300/40"
                    : index === 1
                    ? "bg-blue-300/40"
                    : "bg-purple-300/40"
                }`}
                style={{
                  boxShadow: `0 0 12px ${
                    index === 0
                      ? "rgba(34, 211, 238, 0.6)"
                      : index === 1
                      ? "rgba(96, 165, 250, 0.6)"
                      : "rgba(168, 85, 247, 0.6)"
                  }`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Text */}
      <div>
        <div
          className={`text-lg font-bold tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Code<span className="text-cyan-400">Judge</span>
        </div>
        <div
          className={`text-xs font-medium ${
            isDark ? "text-cyan-400/60" : "text-cyan-600/60"
          }`}
        >
          Learn to Code
        </div>
      </div>
    </div>
  );
};

export default CodeJudgeLogo;
