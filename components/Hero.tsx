'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, ArrowRight, Star } from 'lucide-react';

const Hero = () => {
    const router = useRouter();

    const handleTryClick = () => {
        router.push('/try-on');
    };
    const handleDemoClick = () => {
        router.push('#demo');
    };

    return (


        <section className="relative min-h-80 flex items-center justify-center bg-gradient-to-br from-pastel-cream via-pastel-lavender to-pastel-blue overflow-hidden pt-4">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <div className=" lg:text-left animate-fade-in flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center lg:justify-start mb-6">
                        <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                            <Star className="w-4 h-4 text-yellow-400 mr-2" />
                            <span className="text-sm text-gray-700 font-medium">Trusted by 5K+ creators</span>
                        </div>
                    </div>

                    <h1 className="text-4xl text-center sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        See How Clothes Look Before You Buy
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Upload your photo and any clothing item to see exactly how it looks on you. Perfect for online shopping with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button className="group bg-gradient-to-r from-accent-purple to-accent-teal text-zinc-600 px-8 py-4 rounded-full cursor-pointer font-semibold shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" onClick={handleTryClick}>
                            Try Free Try-Ons
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full font-semibold cursor-pointer hover:bg-white shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center" onClick={handleDemoClick}>
                            <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                            Watch Demo
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                        <div className="flex items-center text-zinc-700 font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            2 free tokens included
                        </div>
                        <div className="flex items-center text-zinc-700 font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            No credit card required
                        </div>
                    </div>
                </div>
                <div className="mt-10 h-[500px] w-full">
                    <Image
                        src="/assets/bg.png"
                        alt="hero"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-full object-contain"
                    />
                </div>

            </div>
        </section>
    );
};

export default Hero;