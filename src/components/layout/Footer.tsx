import { Link } from "react-router-dom";
import { Store, Facebook, Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-sahel-earth text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/20">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold">
                Restez informé des nouveautés
              </h3>
              <p className="text-primary-foreground/80 text-sm">
                Recevez nos offres exclusives et découvrez les nouvelles boutiques
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:border-accent"
              />
              <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sahel-terracotta to-sahel-gold flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Loummel
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm mb-4">
              La première plateforme e-commerce multisite dédiée aux artisans et commerçants du Nord Cameroun.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Commerçants */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Commerçants</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/inscription-vendeur" className="hover:text-accent transition-colors">Créer ma boutique</Link></li>
              <li><Link to="/abonnements" className="hover:text-accent transition-colors">Plans & Tarifs</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">Services supplémentaires</Link></li>
              <li><Link to="/guide-vendeur" className="hover:text-accent transition-colors">Guide du vendeur</Link></li>
            </ul>
          </div>

          {/* Acheteurs */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Acheteurs</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/categories" className="hover:text-accent transition-colors">Toutes les catégories</Link></li>
              <li><Link to="/boutiques" className="hover:text-accent transition-colors">Découvrir les boutiques</Link></li>
              <li><Link to="/nouveautes" className="hover:text-accent transition-colors">Nouveautés</Link></li>
              <li><Link to="/promotions" className="hover:text-accent transition-colors">Promotions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Maroua, Extrême-Nord, Cameroun</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contact@loummel.cm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>© 2024 Loummel. Tous droits réservés.</p>
            <div className="flex gap-4">
              <Link to="/cgu" className="hover:text-accent transition-colors">CGU</Link>
              <Link to="/rgpd" className="hover:text-accent transition-colors">RGPD</Link>
              <Link to="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
