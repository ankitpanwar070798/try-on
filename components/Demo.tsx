export const Demo = () => {
  return (
    <section className="pt-24 bg-gradient-card" id="demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl text-heading font-bold mb-4">
            See Virtual Try-On in Action
          </h2>
          <p className="text-subheading text-gray-600 max-w-2xl mx-auto">
            Watch how our AI shows you exactly how different outfits look on you. Hover to see the try-on result.
          </p>
        </div>

        <div >
          <div className="relative overflow-hidden">
            <video
              className="w-full max-w-2xl h-auto object-cover rounded-2xl mx-auto border border-foreground/10 shadow-lg"
              autoPlay
              loop
              muted
              playsInline
            >
              <source
                src="/assets/tryon.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};
