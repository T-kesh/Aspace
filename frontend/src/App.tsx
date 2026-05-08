import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Documentation from './components/Documentation';
import Contact from "./components/Contact";
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Documentation />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
