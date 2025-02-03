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
            className={`bg-black text-green-400 p-4 rounded h-48 overflow-y-auto ${className}`}
            ref={terminalRef}
        >
            <h2 className="text-lg font-bold mb-2">Terminal</h2>
            <pre className="text-sm whitespace-pre-wrap">{logs.join("\n")}</pre>
        </div>
    );
}
