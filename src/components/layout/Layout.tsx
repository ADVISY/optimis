import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Header is fixed; add top padding so content isn't hidden underneath */}
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
