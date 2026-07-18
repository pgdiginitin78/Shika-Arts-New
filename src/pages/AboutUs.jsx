import { motion } from "framer-motion";
import aboutUsBanner from "../assets/aboutUsBanner.webp";

export default function AboutUs() {
  return (
    <div className="min-h-screen  w-full font-sans text-[#0f1716]">
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <img
          src={aboutUsBanner}
          alt="About Shika Arts"
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8 text-lg md:text-xl text-center leading-relaxed text-gray-700 font-light"
        >
          <p className="text-2xl md:text-3xl font-serif text-[#0f1716] italic mb-12">
            "At Shika Arts, we believe every gift should tell a story, create an emotion, and leave
            a lasting impression."
          </p>

          <p>
            For over 15 years, we have been crafting bespoke corporate gifts, luxury hampers,
            festive collections, and personalized gifting experiences that reflect the identity of
            every client we serve. What began as a passion for handcrafted creations has grown into
            a trusted gifting studio, serving leading businesses, brands, and discerning clients
            across India.
          </p>

          <p>
            Every gift is thoughtfully curated, from concept and product selection to premium
            packaging and seamless delivery. Our attention to detail, commitment to quality, and
            focus on personalization ensure that every creation feels meaningful and memorable.
          </p>

          <p>
            Whether you are celebrating employees, appreciating clients, launching a new brand, or
            creating unforgettable event experiences, we transform your vision into gifts that
            strengthen relationships and create lasting memories.
          </p>

          <div className="pt-8">
            <p className="text-xl md:text-2xl font-serif text-[#0f1716] font-medium">
              At Shika Arts, we don't just create gifts. We create experiences that people remember.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
