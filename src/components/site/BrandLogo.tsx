import logoAsset from "@/assets/brand/dispatch-logo.png.asset.json";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="The Dispatch — News. Truth. Impact."
      className={`block h-auto object-contain ${className}`}
    />
  );
}