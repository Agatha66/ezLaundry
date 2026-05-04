import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Shirt, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useScrollPosition } from '@/hooks/useScrollAnimation';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Coverage', href: '#coverage' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const { isScrolled } = useScrollPosition();
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-[#092635] hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-[#1188E9] rounded-full flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold font-['Poppins']">ezLaundry</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-[#4A6375] hover:text-[#1188E9] transition-colors duration-300 text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-[#4A6375] hover:text-[#1188E9] hover:bg-[#E6F4FF]"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#1188E9] hover:bg-[#092635] text-white rounded-full px-6 py-2 transition-all duration-400">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left text-[#4A6375] hover:text-[#1188E9] transition-colors duration-300 text-lg font-medium"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-[#D8E5EF]">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full mb-3 border-[#1188E9] text-[#1188E9]"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-[#1188E9] hover:bg-[#092635] text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}
