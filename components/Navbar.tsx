'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Menu, X } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Demo', href: '#demo' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  ${isScrolled ? 'bg-white/10 backdrop-blur-lg shadow-lg' : 'bg-white/5 backdrop-blur-lg'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/"  >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TryOn AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Virtual Try-On Studio</p>
            </div>
          </div>
          </Link>
        </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-accent-purple transition-colors duration-200 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.querySelector(link.href);
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                  setIsMenuOpen(false);
                }}
              >
                {link.name}
              </a>
            ))}


          </div>

          {/* Get Started Button */}
          <div className="hidden md:block ">
            <button className="bg-gradient-to-r from-accent-purple to-accent-teal px-6 py-2.5 rounded-full font-semibold shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => router.push('/try-on')}>
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-pastel-lavender transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidde mx-4 mb-4 overflow-hidden">
            <div className=" px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-accent-purple transition-colors duration-200 font-medium flex flex-col items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.querySelector(link.href);
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  {link.name}
                </a>
              ))}

              <button className="w-full bg-gradient-to-r from-accent-purple to-accent-teal py-3 rounded-full font-semibold mt-4" onClick={() => {
                router.push('/try-on');
                setIsMenuOpen(false);
              }}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;