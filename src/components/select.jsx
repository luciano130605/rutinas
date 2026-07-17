import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Select({ label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const wrapRef = useRef(null);
    const listRef = useRef(null);

    const allOptions = ["", ...options];

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, allOptions.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && highlight >= 0) {
                e.preventDefault();
                onChange(allOptions[highlight]);
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey, true);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey, true);
        };
    }, [open, highlight, allOptions, onChange]);

    const openDropdown = () => {
        setHighlight(Math.max(allOptions.indexOf(value), 0));
        setOpen((prev) => !prev);
    };

    return (
        <div className="select-cont" ref={wrapRef}>
            <label>{label}</label>
            <button
                type="button"
                className={`select-trigger${open ? " open" : ""}`}
                onClick={openDropdown}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={value ? "" : "placeholder"}>{value || "Todos"}</span>
                <ChevronDown size={14} className="select-chevron" />
            </button>

            {open && (
                <ul className="select-menu" role="listbox" ref={listRef}>
                    {allOptions.map((opt, i) => (
                        <li
                            key={opt || "__all__"}
                            role="option"
                            aria-selected={value === opt}
                            className={`select-option${value === opt ? " selected" : ""}${highlight === i ? " highlighted" : ""}`}
                            onMouseEnter={() => setHighlight(i)}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            <span>{opt || "Todos"}</span>
                            {value === opt && <Check size={12} strokeWidth={3} />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}