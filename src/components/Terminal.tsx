"use client";
import { useEffect, useRef } from "react";

interface TerminalProps {
  logs: string[];
  className?: string; // ✅ Add className prop
}

export default function Terminal({ logs, className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className={`bg-[#1E1E1E] text-[#32CD32] p-4 rounded-lg h-[225px] shadow-lg border border-[#2A2A2A] flex-shrink-0 ${className}`}
    >
      <h2 className="text-md font-semibold text-gray-200 mb-2 tracking-wide">
        Terminal
      </h2>
      <div
        className="bg-black p-3 rounded text-sm font-mono h-[180px] overflow-y-auto"
        ref={terminalRef}
      >
        <pre className="whitespace-pre-wrap">
          {logs.length > 0 ? logs.join("\n") : "No logs yet..."}
        </pre>
      </div>
    </div>
  );
}
