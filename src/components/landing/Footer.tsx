import { motion } from "framer-motion";
import { Swords, Github, Twitter } from "lucide-react";

const Footer = () => {
  const links = {
    product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Problems", href: "#" },
      { name: "Leaderboard", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Tutorials", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Press Kit", href: "#" },
    ],
    legal: [
      { name: "Terms", href: "#" },
      { name: "Privacy", href: "#" },
      { name: "Cookies", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-accent/10 bg-background/50 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-background opacity-20" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white tracking-wider">
                  CODE
                </span>
                <span className="font-display font-bold text-lg text-accent tracking-wider ml-1">
                  ARENA
                </span>
              </div>
            </motion.div>
            <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
              The ultimate competitive coding platform. Battle, improve, and 
              climb the ranks to become a legend.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-sm bg-bg-tertiary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-bg-elevated transition-all duration-300 border border-accent/10 hover:border-accent/30"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-sm bg-bg-tertiary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-bg-elevated transition-all duration-300 border border-accent/10 hover:border-accent/30"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-accent mb-4 uppercase tracking-[0.2em]">
              Product
            </h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-accent mb-4 uppercase tracking-[0.2em]">
              Resources
            </h4>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-accent mb-4 uppercase tracking-[0.2em]">
              Company
            </h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-accent mb-4 uppercase tracking-[0.2em]">
              Legal
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-accent/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm font-mono">
            © {new Date().getFullYear()} Code Battle Arena. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <span className="text-accent">❤</span> for elite coders
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
