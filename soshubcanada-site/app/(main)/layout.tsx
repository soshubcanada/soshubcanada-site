import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { SocialProofToast } from '@/components/SocialProofToast';
import { ExitIntentPopup } from '@/components/ExitIntentPopup';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
      <SocialProofToast />
      <ExitIntentPopup />
    </>
  );
}
