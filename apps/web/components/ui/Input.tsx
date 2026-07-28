import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
}

const fieldBase =
  "w-full bg-canvas-soft text-ink placeholder:text-mute rounded-md px-lg py-lg text-body-md outline-none focus:ring-2 focus:ring-ink/20 transition-shadow";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrapProps>(
  function Input({ label, hint, error, className = "", id, ...props }, ref) {
    return (
      <label className="block" htmlFor={id}>
        {label && <span className="block text-body-sm-strong text-ink mb-xs">{label}</span>}
        <input ref={ref} id={id} className={`${fieldBase} ${className}`} {...props} />
        {hint && !error && <span className="block text-caption text-mute mt-xs">{hint}</span>}
        {error && <span className="block text-caption text-danger mt-xs">{error}</span>}
      </label>
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapProps
>(function Textarea({ label, hint, error, className = "", id, ...props }, ref) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="block text-body-sm-strong text-ink mb-xs">{label}</span>}
      <textarea ref={ref} id={id} className={`${fieldBase} min-h-[120px] resize-y ${className}`} {...props} />
      {hint && !error && <span className="block text-caption text-mute mt-xs">{hint}</span>}
      {error && <span className="block text-caption text-danger mt-xs">{error}</span>}
    </label>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldWrapProps
>(function Select({ label, hint, error, className = "", id, children, ...props }, ref) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="block text-body-sm-strong text-ink mb-xs">{label}</span>}
      <select ref={ref} id={id} className={`${fieldBase} ${className}`} {...props}>
        {children}
      </select>
      {hint && !error && <span className="block text-caption text-mute mt-xs">{hint}</span>}
      {error && <span className="block text-caption text-danger mt-xs">{error}</span>}
    </label>
  );
});
