import { Logo } from "@/components/Logo";

export default function AccountAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col items-center justify-center px-4 py-16">
      <Logo markClassName="h-9 w-9" wordmarkClassName="text-lg" className="mb-10" />
      <div className="w-full">{children}</div>
    </div>
  );
}
