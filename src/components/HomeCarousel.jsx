import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HrDayIamge from "../assets/homePage/HRDay.png";
import MothersDayImage from "../assets/homePage/MothersDay.png";
import ThoughtFullGift from "../assets/homePage/ThoughtfullGift.png";
import CorporateGift from "../assets/homePage/CorporateGift.png";
  
const CARDS = [
  {
    id: 1,
    image: MothersDayImage,
    link: "/category/wedding",
    tagline: "Eternal Bonds",
    title: "The Wedding Atelier",
  },
  {
    id: 2,
    image: HrDayIamge,
    link: "/category/hampers",
    tagline: "Curated Joy",
    title: "Luxury Hampers",
  },
  {
    id: 3,
    image: CorporateGift,
    link: "/category/corporate-gifts",
    tagline: "Professional Poise",
    title: "Corporate Gifting",
  },
  {
    id: 4,
    image: ThoughtFullGift,
    link: "/category/thoughtful-gifts",
    tagline: "Meaningful Gestures",
    title: "Thoughtful Selection",
  },
];

const TOTAL = CARDS.length;

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

function CarouselCard({ card }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-primary">
      <motion.img
        src={card.image}
        alt={card.title}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-midnight/20 to-transparent" />

      <div className="absolute inset-0 p-6 md:p-16 flex flex-col justify-end items-center mb-16 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Link
            to={card.link}
            className="inline-block bg-accent text-primary px-10 md:px-16 py-4 md:py-5 text-[10px] md:text-[11px] uppercase tracking-ultra font-bold hover:bg-white transition-all duration-700 shadow-luxe cursor-pointer"
          >
            Explore Collection
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export function HomeCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const go = useCallback((dir) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + TOTAL) % TOTAL);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go, isAutoPlaying]);

  const handleManualNav = (dir) => {
    setIsAutoPlaying(false);
    go(dir);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="w-full">
      <div className="relative h-[450px] sm:h-[600px] lg:h-[700px] 2xl:h-[1080px] w-full overflow-hidden bg-midnight">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold || offset.x < -100) {
                handleManualNav(1);
              } else if (swipe > swipeConfidenceThreshold || offset.x > 100) {
                handleManualNav(-1);
              }
            }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.6 },
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <CarouselCard card={CARDS[index]} />
          </motion.div>
        </AnimatePresence>

        {/* NAVIGATION - Hidden on very small screens, refined on tablet */}
        <div className="absolute bottom-16 right-4 md:right-12 flex gap-2 md:gap-4 z-20">
          <button
            onClick={() => handleManualNav(-1)}
            aria-label="Previous slide"
            className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center border border-white/20 text-white hover:border-accent hover:text-accent transition-all duration-700 cursor-pointer backdrop-blur-md bg-midnight/10"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
          </button>

          <button
            onClick={() => handleManualNav(1)}
            aria-label="Next slide"
            className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center border border-white/20 text-white hover:border-accent hover:text-accent transition-all duration-700 cursor-pointer backdrop-blur-md bg-midnight/10"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
          </button>
        </div>

        {/* INDICATORS - More compact on mobile */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 md:gap-4 z-20">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`h-[2px] transition-all duration-700 cursor-pointer ${
                i === index ? "w-8 md:w-16 bg-accent" : "w-4 md:w-8 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
