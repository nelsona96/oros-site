import { Ridgeline } from "./ridgeline";
import { RidgelineMark } from "./ridgeline-mark";

export function Footer() {
  return (
    <footer className="bg-app-bg-subtle">
      <Ridgeline />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-12 text-center md:px-8">
        <RidgelineMark className="h-5 w-auto text-text-secondary" />
        <p className="font-mono text-xs text-text-secondary">
          © {new Date().getFullYear()} Oros Productions
        </p>
      </div>
    </footer>
  );
}
