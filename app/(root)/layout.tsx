import { Footer, Navbar } from "@/constants";
import React from "react";

const PagesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};

export default PagesLayout;
