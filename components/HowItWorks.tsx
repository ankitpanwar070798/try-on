import { Upload, Settings, Sparkles, Share } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload/click Your Photo",
    description: "Take a selfie or upload an existing photo of yourself to get started."
  },
  {
    icon: Settings,
    title: "Upload/click the Product",
    description: "Add a picture of the dress, t-shirt, or outfit you want to try on."
  },
  {
    icon: Sparkles,
    title: "AI Generates Realistic Image",
    description: "Our AI shows you what you'd look like wearing the outfit in seconds."
  },
  {
    icon: Share,
    title: "Download & Share",
    description: "Save your virtual try-on and share it with friends or on social media."
  }
];

export const HowItWorks = () => {
  return (
    <section className="pt-24 bg-soft-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl text-heading font-bold mb-4">
            How It Works
          </h2>
          <p className="text-subheading text-gray-600 max-w-2xl mx-auto">
            See how you look in any outfit in just four simple steps with our virtual try-on technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group transform transition-transform duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <div className=" border border-gray-300 shadow-lg rounded-2xl p-4 shadow-card h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 text-lg border-2 border-gray-400 text-gray-500 rounded-full flex items-center justify-center font-semibold text-foreground shadow-soft">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-cta rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-button transition-all duration-300">
                    <step.icon className="h-8 w-8 text-foreground" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connection Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blush to-lavender opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};