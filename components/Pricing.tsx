import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₹199",
    period: "20 images",
    description: "Perfect for trying out virtual try-on",
    features: [
      "Premium quality output",
      "Email support",
      "Access to basic features",
      "Advanced styling features",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "₹499",
    period: "50 images",
    description: "Best for fashion enthusiasts",
    features: [
      "Unlimited try-ons",
      "Premium quality visualization",
      "4K output resolution",
      "Save & organize looks",
      "Advanced styling features",
      "Early access to new features"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "outline" as const,
    popular: true
  },
];

export const Pricing = () => {
  return (
    <section className="pt-24 bg-gradient-pricing" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-subheading text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your virtual try-on needs. Start with 3 free tokens or go according to your budget.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-soft-white rounded-3xl p-8 shadow-card hover-lift animate-fade-up ${
                plan.popular ? 'ring-2 ring-lavender scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-2" />
                     <span className="text-sm text-gray-700 font-medium">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground/60 ml-2">/{plan.period}</span>
                </div>
                <p className="text-foreground/70">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-cta rounded-full flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-foreground" />
                    </div>
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className="w-full cursor-pointer"
                size="lg"
                variant={plan.buttonVariant}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};