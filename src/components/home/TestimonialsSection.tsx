import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Amadou Bouba",
    role: "Artisan Potier",
    location: "Rhumsiki",
    content: "Grâce à Loummel, j'ai pu vendre mes poteries traditionnelles au-delà des frontières du Cameroun. Une vraie révolution pour mon commerce !",
    rating: 5,
  },
  {
    id: 2,
    name: "Fanta Moussa",
    role: "Tisserande",
    location: "Maroua",
    content: "La création de ma boutique a été très simple. En quelques jours, j'avais mon propre site et mes premiers clients.",
    rating: 5,
  },
  {
    id: 3,
    name: "Ibrahim Hassan",
    role: "Vendeur Téléphones",
    location: "Garoua",
    content: "L'intégration WhatsApp Business m'a permis de communiquer facilement avec mes clients. Mes ventes ont augmenté de 40% !",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Témoignages
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Ce que disent nos commerçants
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-xl p-6 shadow-sahel hover:shadow-sahel-card transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sahel-ochre flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
