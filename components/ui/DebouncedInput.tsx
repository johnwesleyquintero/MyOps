import React, { useState, useEffect } from "react";
import { Icon, iconProps } from "../Icons";
import { Button } from "./Button";

interface DebouncedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  icon?: React.ReactNode;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value: initialValue,
  onChange,
  debounce = 300,
  className,
  icon,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange, initialValue]);

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon || (
          <Icon.Search
            {...iconProps(
              14,
              "text-notion-light-muted dark:text-notion-dark-muted",
            )}
          />
        )}
      </div>
      <input
        {...props}
        className="notion-input block w-full pl-9 pr-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <Button
          variant="custom"
          onClick={() => {
            setValue("");
            onChange("");
          }}
          className="absolute inset-y-0 right-0 pr-2 flex items-center text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text bg-transparent"
        >
          <Icon.Close {...iconProps(12)} />
        </Button>
      )}
    </div>
  );
};
