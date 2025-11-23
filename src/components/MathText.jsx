import React, { useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathText({ text }) {
    const ref = useRef(null);

    useEffect(() => {
        // Try to render LaTeX using KaTeX
        try {
            katex.render(text, ref.current, {
                throwOnError: false,
            });
        } catch (err) {
            // Fallback: if text is not math, show it normally
            ref.current.textContent = text;
        }
    }, [text]);

    return <span ref={ref} className="break-words"></span>;
}
