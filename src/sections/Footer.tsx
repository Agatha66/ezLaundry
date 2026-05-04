import { motion } from 'framer-motion';
import { Shirt, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Coverage Areas', href: '#coverage' },
  { label: 'FAQ', href: '#faq' },
];

const serviceLinks = [
  { label: 'Wash & Fold', href: '#services' },
  { label: 'Wash & Iron', href: '#services' },
  { label: 'Dry Cleaning', href: '#services' },
  { label: 'Express Service', href: '#pricing' },
  { label: 'Convenience Passes', href: '#pricing' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#092635] pt-16 lg:pt-20 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12"
        >
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#1188E9] rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white font-['Poppins']">
                ezLaundry
              </span>
            </a>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Laundry made simple for busy urban Malaysians. Door-to-door pickup
              and delivery service.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-[#1188E9] hover:text-white transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-[#1188E9] hover:text-white transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-[#1188E9] hover:text-white transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-['Poppins']">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-[#1188E9] transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-['Poppins']">
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-[#1188E9] transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-['Poppins']">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-white/50 block mb-1">Email</span>
                <a
                  href="mailto:hello@ezlaundry.my"
                  className="text-white/70 hover:text-[#1188E9] transition-colors duration-300"
                >
                  hello@ezlaundry.my
                </a>
              </li>
              <li>
                <span className="text-white/50 block mb-1">Phone</span>
                <a
                  href="tel:+60123456789"
                  className="text-white/70 hover:text-[#1188E9] transition-colors duration-300"
                >
                  +60 12-345-6789
                </a>
              </li>
              <li>
                <span className="text-white/50 block mb-1">Hours</span>
                <span className="text-white/70">Mon-Sat, 8AM - 8PM</span>
              </li>
              <li>
                <span className="text-white/50 block mb-1">Address</span>
                <span className="text-white/70">
                  Damansara Perdana, Petaling Jaya
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        <Separator className="bg-white/10" />

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © 2026 ezLaundry. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-white/50 hover:text-[#1188E9] transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white/50 hover:text-[#1188E9] transition-colors duration-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
