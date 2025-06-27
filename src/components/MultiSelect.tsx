import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MultiSelectProps {
  label: string;
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="w-full">
      <Label>{label}</Label>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between mt-1"
        onClick={() => setOpen((o) => !o)}
      >
        {value.length > 0
          ? options
              .filter((o) => value.includes(o.value))
              .map((o) => o.label)
              .join(", ")
          : `Select ${label}`}
        <span className="ml-2">▼</span>
      </Button>
      {open && (
        <Card className="absolute z-10 mt-1 w-full max-h-60 overflow-auto">
          <CardContent className="flex flex-col gap-2 p-2">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
