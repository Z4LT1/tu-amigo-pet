import { Bath, Cpu, Heart, House, Scissors, Stethoscope, Syringe } from "lucide-react";

const icons = { stethoscope: Stethoscope, scissors: Scissors, syringe: Syringe, heart: Heart, bath: Bath, chip: Cpu, home: House };

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Stethoscope;
  return <Icon className={className} aria-hidden />;
}
