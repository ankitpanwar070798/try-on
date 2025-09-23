import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fashion Enthusiast",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "This app has changed how I shop online! I can finally see how clothes will actually look on me before buying. No more returns!",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Style Blogger",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "I review fashion for my blog and this tool is incredible. The virtual try-on results are so realistic, my followers love seeing the comparisons!",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Busy Mom",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "With three kids, I rarely have time to try things on in stores. This app lets me see how outfits look from home. It's a lifesaver!",
    rating: 5
  },
  {
    name: "David Park",
    role: "College Student",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "On a student budget, I can't afford to buy clothes that don't fit right. This app helps me make smart choices and avoid expensive mistakes.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Professional",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face",
    content: "I need to look professional for work but hate shopping. Being able to try on business attire virtually saves me so much time and stress.",
    rating: 5
  },
  {
    name: "James Mitchell",
    role: "Fitness Coach",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    content: "As my body changes through different fitness phases, this app helps me find clothes that fit my current shape perfectly. Love it!",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="pt-24 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl text-heading font-bold mb-4">
            Loved by Shoppers Worldwide
          </h2>
          <p className="text-subheading text-gray-600 max-w-2xl mx-auto">
            Join hundreds of fashion-conscious shoppers who trust our virtual try-on technology for smarter online shopping.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-soft-white rounded-2xl p-6 border-1 border-soft-white shadow-card hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating Stars */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-blush" />
                ))}
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-foreground/80 mb-6 leading-relaxed">
                {testimonial.content}
              </blockquote>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={12}
                  height={12}
                  className="w-12 h-12 rounded-full object-cover shadow-soft"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-foreground/60">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">5M+</div>
            <div className="text-foreground/70">Virtual Try-Ons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">100K+</div>
            <div className="text-foreground/70">Happy Shoppers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">4.9★</div>
            <div className="text-foreground/70">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">50K+</div>
            <div className="text-foreground/70">Brands Supported</div>
          </div>
        </div>
      </div>
    </section>
  );
};