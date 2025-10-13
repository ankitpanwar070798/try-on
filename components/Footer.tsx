import { Sparkles, Twitter, Instagram, Facebook, Linkedin, DoorOpen } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Demo", href: "#demo" },
    // { name: "Integrations", href: "/integrations" }
  ],
  // company: [
  //   { name: "About Us", href: "/about" },
  //   { name: "Blog", href: "/blog" },
  //   { name: "Careers", href: "/careers" },
  //   { name: "Press", href: "/press" },
  //   { name: "Contact", href: "#contact" }
  // ],
  support: [
    // { name: "Help Center", href: "/#" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
    // { name: "Status", href: "/status" },
    // { name: "Community", href: "/community" },
    // { name: "Tutorials", href: "/tutorials" }
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ]
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://x.com/ankitpanwar0707" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/ankitpanwar07/" },
  // { name: "Facebook", icon: Facebook, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/ankit-panwar-5841181a4/" }
];

export const Footer = () => {
  return (
    <footer className="bg-foreground/5 border-t border-blush/20" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-hero rounded-xl shadow-soft">
                <DoorOpen className="h-8 w-8 text-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">TryOn</span>
            </div>
            <p className="text-foreground/70 max-w-sm leading-relaxed">
              Transform your photos with AI-powered enhancement technology.
              Professional results in seconds, trusted by creators worldwide.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 bg-soft-white rounded-xl shadow-soft hover:shadow-card hover-lift transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 text-foreground hover:text-lavender" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-lavender transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          {/* <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-lavender transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-lavender transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-lavender transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-blush/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-foreground/60 text-sm">
            © 2025 TryOn. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-foreground/60">
            <span>Made with ❤️ By Ankit Panwar</span>

          </div>
        </div>
      </div>
    </footer>
  );
};