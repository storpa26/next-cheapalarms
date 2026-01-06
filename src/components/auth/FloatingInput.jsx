/**
 * FloatingInput Component
 * Reusable input field with floating label and icon
 */

import { forwardRef } from "react";

export const FloatingInput = forwardRef(function FloatingInput(
  {
    type = "text",
    name,
    label,
    icon: Icon,
    value,
    onChange,
    onFocus,
    onBlur,
    autoComplete,
    required = false,
    error = false,
    className = "",
    ...props
  },
  ref
) {
  const isFocused = props["data-focused"] === "true";
  const hasValue = !!value;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative pt-2">
      {/* Floating Label - positioned above input with proper spacing (Material Design pattern) */}
      <label
        className={`absolute left-0 text-muted-foreground pointer-events-none transition-all duration-300 z-20 ${
          isFloating
            ? "top-0 left-3 text-xs text-primary font-medium px-1.5 py-0 bg-white/95 backdrop-blur-sm"
            : `top-[26px] sm:top-[28px] text-sm sm:text-base ${
                Icon ? "left-11 sm:left-12" : "left-4"
              }`
        }`}
      >
        {label}
      </label>

      <div className="relative transition-all duration-300">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 z-10">
            <Icon
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                isFocused ? "text-primary" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-xl border-2 ${
            error ? "border-error" : "border-input"
          } bg-white/50 backdrop-blur-sm ${
            Icon ? "pl-11 sm:pl-12" : "pl-4"
          } pr-4 py-3.5 sm:py-4 text-sm sm:text-base text-foreground placeholder-transparent outline-none transition-all duration-300 focus:border-primary focus:bg-white/80 focus:ring-4 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/20 ${className}`}
          placeholder={label}
          {...props}
        />
      </div>
    </div>
  );
});

