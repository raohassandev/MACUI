interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ label, color, onChange }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <label className="min-w-[100px] text-sm">{label}</label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border-0 rounded cursor-pointer"
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 px-2 py-1 text-sm rounded bg-background border border-secondary"
      />
    </div>
  );
};