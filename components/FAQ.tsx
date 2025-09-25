import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does virtual try-on technology work?",
    answer: "Our AI uses advanced computer vision and machine learning to analyze your photo and the clothing item, then generates a realistic visualization of how the outfit would look on your body shape and size."
  },
  {
    question: "What types of clothing can I try on?",
    answer: "You can try on dresses, t-shirts, shirts, jackets, pants, and most types of clothing. Our AI works best with clear product images and front-facing photos of yourself."
  },
  {
    question: "Is my photo data secure and private?",
    answer: "Absolutely. We use enterprise-grade encryption for all uploads and processing. Your photos are processed securely and automatically deleted from our servers after 24 hours. We never store or share your personal images."
  },
  {
    question: "How many free try-ons do I get?",
    answer: "Every new user gets 3 free try-on tokens. Each try-on uses 1 token. Once you use all 10, you can purchase more tokens or upgrade to unlimited monthly plans."
  },
  {
    question: "Can I save and share my try-on results?",
    answer: "Yes! You can download your virtual try-on images in high quality and share them on social media, send to friends, or save for your shopping decisions."
  },
  {
    question: "How accurate are the try-on results?",
    answer: "Our AI provides realistic visualizations that help you make better shopping decisions. While results may vary based on photo quality and clothing type, most users find them very helpful for online shopping."
  },
  // {
  //   question: "Do you offer refunds?",
  //   answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not completely satisfied with our virtual try-on service, contact our support team within 30 days for a full refund."
  // },
  // {
  //   question: "Can retailers integrate this technology?",
  //   answer: "Yes! Our Business plan includes API access and white-label options. Fashion brands and retailers can integrate our virtual try-on technology directly into their websites and apps."
  // }
];

export const FAQ = () => {
  return (
    <section className="py-24 bg-soft-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl text-heading font-bold mb-4">
            Frequently Asked Questions
          </h2>
           <p className="text-subheading text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our virtual try-on service.
          </p>
        </div>

        <div className="animate-fade-up">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gradient-card rounded-2xl px-6 shadow-soft hover:shadow-card transition-all border-0"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-lavender py-6 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12 animate-fade-up">
          <p className="text-foreground/70 mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@tryonai.com"
              className="inline-flex items-center space-x-2 text-lavender hover:text-blush transition-colors"
            >
              <span>Email us at support@tryonai.com</span>
            </a>
            <span className="hidden sm:block text-foreground/40">|</span>
            <a
              href="#contact"
              className="inline-flex items-center space-x-2 text-lavender hover:text-blush transition-colors"
            >
              <span>Contact our support team</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};