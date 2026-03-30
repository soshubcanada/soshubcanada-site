import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prendre rendez-vous | SOS Hub Canada",
  description:
    "Planifiez votre consultation avec un expert SOS Hub Canada en immigration, relocalisation et services administratifs.",
};

export default function RdvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
