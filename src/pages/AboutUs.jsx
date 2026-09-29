import React from "react";
import { motion } from "framer-motion";
import ShilpaRawelIm from "../assets/ShilpaRawel.webp";
import mandalaTopRight from "../assets/mandalaTopRight.webp";
import mandalaBottomRight from "../assets/mandalaBottomRight.webp";
import lotusIcon from "../assets/lotusIcon.webp";
import sec3StoryBlob from "../assets/sec3StoryBlob.webp";
import sec4CirclesGroup from "../assets/sec4CirclesGroup.webp";
import sec5HamperPhoto from "../assets/sec5HamperPhoto.webp";
import sec5LeafCropped from "../assets/sec5LeafCropped.webp";
import sec2LeavesBg from "../assets/sec2LeavesBg.webp";

import clientSvpMining from "../assets/clients/svp_mining.webp";
import clientVolvo from "../assets/clients/volvo_ce.webp";
import clientShriNitin from "../assets/clients/shri_nitin.webp";
import clientShriSudhir from "../assets/clients/shri_sudhir.webp";
import clientVicco from "../assets/clients/vicco.webp";
import clientHaldirams from "../assets/clients/haldirams.webp";
import clientDpJain from "../assets/clients/dp_jain.webp";
import clientPinnacle from "../assets/clients/pinnacle.webp";
import clientBom from "../assets/clients/bank_of_maharashtra.webp";
import clientAcc from "../assets/clients/acc_cement.webp";
import clientReliance from "../assets/clients/reliance_cement.webp";
import clientSattvam from "../assets/clients/sattvam.webp";
import clientTbz from "../assets/clients/tbz.webp";
import clientYpo from "../assets/clients/ypo_nagpur.webp";
import clientDass from "../assets/clients/dass_jeweller.webp";
import clientTanishq from "../assets/clients/tanishq.webp";
import clientEnsaara from "../assets/clients/ensaara.webp";
import clientRaisoni from "../assets/clients/raisoni_group.webp";
import clientSujyoti from "../assets/clients/sujyoti.webp";
import clientBrtc from "../assets/clients/brtc.webp";
import clientPerficient from "../assets/clients/perficient.webp";
import clientCian from "../assets/clients/cian_agro.webp";
import clientMahaMetro from "../assets/clients/maha_metro.webp";
import clientRiseIndia from "../assets/clients/rise_india.webp";
import clientInfinity from "../assets/clients/infinity_jeweller.webp";
import clientGangaIron from "../assets/clients/ganga_iron.webp";
import clientLeMeridien from "../assets/clients/le_meridien.webp";
import clientBhonsala from "../assets/clients/bhonsala.webp";

const clientLogos = [
  { src: clientSvpMining, name: "SVP Mining Group" },
  { src: clientVolvo, name: "Volvo CE" },
  { src: clientShriNitin, name: "Shri Nitin Gadkariji" },
  { src: clientShriSudhir, name: "Shri Sudhir Mungatiwar" },
  { src: clientVicco, name: "Vicco Laboratories" },
  { src: clientHaldirams, name: "Haldiram's" },
  { src: clientDpJain, name: "D.P. Jain & Co." },
  { src: clientPinnacle, name: "Pinnacle Tele Services" },
  { src: clientBom, name: "Bank of Maharashtra" },
  { src: clientAcc, name: "ACC Cement" },
  { src: clientReliance, name: "Reliance Cement" },
  { src: clientSattvam, name: "Sattvam Bangalore" },
  { src: clientTbz, name: "TBZ Jeweller" },
  { src: clientYpo, name: "YPO Nagpur" },
  { src: clientDass, name: "Dass Jeweller" },
  { src: clientTanishq, name: "Tanishq" },
  { src: clientEnsaara, name: "Ensaara Metropark" },
  { src: clientRaisoni, name: "Raisoni Group" },
  { src: clientSujyoti, name: "Sujyoti" },
  { src: clientBrtc, name: "BRTC Chichpalli" },
  { src: clientPerficient, name: "Perficient" },
  { src: clientCian, name: "CIAN Agro" },
  { src: clientMahaMetro, name: "Maha Metro" },
  { src: clientRiseIndia, name: "Rise India" },
  { src: clientInfinity, name: "Infinity Jeweller" },
  { src: clientGangaIron, name: "Ganga Iron & Steel" },
  { src: clientLeMeridien, name: "Le Meridien" },
  { src: clientBhonsala, name: "Bhonsala Military School" },
];

const personalizedData = [
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 sm:w-7 sm:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 4.5C11.6 4.5 8 8.1 8 12.5C8 15.4 9.5 17.9 11.8 19.3C12.4 19.7 12.7 20.3 12.7 21V22C12.7 22.6 13.1 23 13.7 23H18.3C18.9 23 19.3 22.6 19.3 22V21C19.3 20.3 19.6 19.7 20.2 19.3C22.5 17.9 24 15.4 24 12.5C24 8.1 20.4 4.5 16 4.5Z" />
        <path d="M13.5 25.5H18.5" />
        <path d="M14.5 27.5H17.5" />
        <path d="M14 13C14 11 15 10 16 10C17 10 18 11 18 13" />
        <path d="M16 10V14.5" />
      </svg>
    ),
    title: "Creativity Driven",
    des: "Turning ideas into meaningful creations.”",
  },
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 sm:w-7 sm:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 26.5C16 26.5 6 19.8 6 12.5C6 8.5 9 5.5 13 5.5C14.8 5.5 16 6.8 16 6.8C16 6.8 17.2 5.5 19 5.5C23 5.5 26 8.5 26 12.5C26 19.8 16 26.5 16 26.5Z" />
      </svg>
    ),
    title: "Thoughtful Design",
    des: "Every product crafted with care and detail.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 sm:w-7 sm:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="12" width="20" height="15" rx="1.5" />
        <path d="M16 12V27" />
        <path d="M6 18H26" />
        <path d="M16 12C14 8.5 10 8 9.5 10.5C9 13 13.5 12 16 12Z" />
        <path d="M16 12C18 8.5 22 8 22.5 10.5C23 13 18.5 12 16 12Z" />
      </svg>
    ),
    title: "Personalized Gifting",
    des: "Unique gifts for every special moment.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 sm:w-7 sm:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="16" cy="10" r="3.5" />
        <path d="M10 24C10 20.7 12.7 18 16 18C19.3 18 22 20.7 22 24" />
        <circle cx="8" cy="13" r="2.5" />
        <path d="M4 23.5C4 21.2 5.8 19.5 8 19.5C8.8 19.5 9.6 19.8 10.2 20.2" />
        <circle cx="24" cy="13" r="2.5" />
        <path d="M28 23.5C28 21.2 26.2 19.5 24 19.5C23.2 19.5 22.4 19.8 21.8 20.2" />
      </svg>
    ),
    title: "Meaningful Experiences",
    des: "Creating memories that last a lifetime.",
  },
];

function AboutUs() {
  const marqueeRef = React.useRef(null);

  return (
    <div className="w-full bg-[#faf5ed] text-[#4a1525]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-150px)] items-stretch"
      >
        <div className="relative w-full lg:h-screen overflow-hidden bg-[#faf5ed]">
          <img
            className="w-full h-full object-cover block"
            src={ShilpaRawelIm}
            alt="Shilpa Rawell - Founder"
            loading="lazy"
          />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 hidden lg:block bg-gradient-to-r from-transparent to-[#faf5ed] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 lg:hidden bg-gradient-to-t from-[#faf5ed] to-transparent pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative w-full flex flex-col justify-center px-8 py-12 sm:px-12 sm:py-10 lg:px-14 xl:px-20 bg-[#faf5ed] overflow-hidden"
        >
          <img
            src={mandalaTopRight}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute top-0 right-0 w-72 sm:w-96 lg:w-[480px] pointer-events-none select-none"
          />

          <img
            src={mandalaBottomRight}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute bottom-0 right-0 w-64 sm:w-80 lg:w-[340px] pointer-events-none select-none"
          />

          <div className="relative z-10 max-w-lg">
            <span className="text-[11px] sm:text-2xl font-semibold tracking-[0.28em] uppercase text-[#a08264] block mb-2 sm:mb-3">
              Founder
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-[#4a1525] font-normal leading-[1.08] tracking-tight">
              Meet
              <br />
              Shilpa Rawell
            </h1>

            <div className="w-10 sm:w-12 h-[2px] bg-[#c5a059] mt-2.5 mb-5 sm:mb-3" />

            <div className="space-y-3.5 sm:space-y-4 text-[#554e48] text-xs sm:text-[13.5px] lg:text-base leading-relaxed font-normal">
              <p>
                Shilpa Rawell is the founder of Shika Arts, a creative brand based in Nagpur. With a
                passion for creativity, thoughtful design, and personalized gifting, she has built a
                brand that brings together artistic expression and meaningful experiences.
              </p>
              <p>
                Her vision is to create unique, thoughtfully curated products that make every
                occasion memorable.
              </p>
            </div>

            <div className="mt-6 sm:mt-7">
              <img
                src={lotusIcon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="w-12 h-8 sm:w-14 sm:h-9 object-contain"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full bg-[#4a0f1d] bg-gradient-to-r from-[#3c0b15] via-[#521322] to-[#3c0b15] text-white py-12 sm:py-14 lg:py-16 px-6 sm:px-10 lg:px-12 overflow-hidden"
      >
        <img
          src={sec2LeavesBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-20"
        />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-start">
          {personalizedData.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="group relative flex flex-col items-center text-center px-4 sm:px-6"
            >
              {idx < personalizedData.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-20 w-[1px] bg-white/20 pointer-events-none" />
              )}
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border border-[#d4af6e]/85 bg-[#541221]/30 shadow-[0_0_15px_rgba(212,175,110,0.22)] flex items-center justify-center text-[#e5caa1] mb-3.5 sm:mb-4 transition-all duration-300 group-hover:scale-105 group-hover:border-[#f5dfa8] group-hover:shadow-[0_0_22px_rgba(212,175,110,0.38)]">
                <div className="flex items-center justify-center filter drop-shadow-[0_0_5px_rgba(212,175,110,0.35)]">
                  {item.icon}
                </div>
              </div>
              <h3 className="font-serif text-lg sm:text-[19px] text-white font-normal tracking-wide mb-1.5 sm:mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/70 font-light leading-relaxed max-w-[210px] mx-auto">
                {item.des}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full bg-[#faf5ed] overflow-hidden"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center min-h-[440px] lg:min-h-[480px]">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 lg:pl-16 xl:pl-24 2xl:pl-32 lg:pr-6 py-12 lg:py-16"
          >
            <div className="flex items-center gap-3.5 mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 h-[2px] bg-[#c5a059]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#a08264]">
                The Story Behind
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#4a1525] font-normal leading-[1.08] tracking-tight mb-5 sm:mb-6">
              Shika Arts
            </h2>

            <div className="space-y-4 sm:space-y-5 text-[#554e48] text-xs sm:text-[13.5px] lg:text-[15px] xl:text-[15.5px] leading-relaxed font-normal max-w-xl">
              <p className="font-serif italic text-base sm:text-lg lg:text-xl text-[#4a1525] leading-snug">
                “At Shika Arts, we believe every gift should tell a story, create an emotion, and leave a lasting impression.”
              </p>
              <p>
                For over 15 years, we have been crafting bespoke corporate gifts, luxury hampers, festive collections, and personalized gifting experiences that reflect the identity of every client we serve. What began as a passion for handcrafted creations has grown into a trusted gifting studio, serving leading businesses, brands, and discerning clients across India.
              </p>
              <p>
                Every gift is thoughtfully curated, from concept and product selection to premium packaging and seamless delivery. Our attention to detail, commitment to quality, and focus on personalization ensure that every creation feels meaningful and memorable.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7 xl:col-span-6 flex justify-end items-center h-full w-full"
          >
            <img
              src={sec3StoryBlob}
              alt="Shika Arts story gifts and hampers"
              loading="lazy"
              className="w-full max-w-[380px] lg:max-w-none lg:w-full h-auto object-cover block select-none pointer-events-none"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full bg-[#f2e8dc] overflow-hidden"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center px-6 sm:px-12 lg:pl-16 xl:pl-24 2xl:pl-32 lg:pr-6 py-8 lg:py-10"
          >
            <span className="font-serif text-5xl sm:text-6xl text-[#dec08e] leading-none block mb-2 select-none">
              “
            </span>

            <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-[27px] xl:text-[30px] text-[#4a1525] font-normal leading-[1.3] tracking-tight mb-4 sm:mb-5 max-w-lg">
              My vision is to create unique, thoughtfully curated products that make every occasion
              memorable.”
            </blockquote>

            <div className="flex items-center gap-3">
              <div className="w-8 sm:w-10 h-[1.5px] bg-[#b3793e]" />
              <span className="font-serif text-base sm:text-lg text-[#b3793e] tracking-wide">
                Shilpa Rawell
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-6 flex justify-end items-center h-full w-full overflow-hidden pr-0"
          >
            <img
              src={sec4CirclesGroup}
              alt="Curated gifts collection"
              loading="lazy"
              className="w-full max-w-[500px] lg:max-w-none lg:w-full h-auto object-cover object-right block select-none pointer-events-none"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="relative w-full bg-[#420c17] text-white overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] h-full pointer-events-none">
          <img
            src={sec5HamperPhoto}
            alt="Shika Arts personalized hampers"
            loading="lazy"
            className="w-full h-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#420c17] via-[#420c17]/60 to-transparent lg:hidden" />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-[#420c17]/60 to-[#420c17]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-48">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="hidden lg:block lg:col-span-6" />
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="lg:col-span-6 flex flex-col justify-center lg:pl-6 xl:pl-10"
            >
              <div className="mb-4 sm:mb-5">
                <span className="block text-[11px] sm:text-xs tracking-[0.25em] text-[#d4af6e] uppercase font-semibold">
                  A VISION
                </span>
                <span className="block text-[11px] sm:text-xs tracking-[0.25em] text-[#d4af6e] uppercase font-semibold mt-1">
                  FOR MEMORABLE OCCASIONS
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] text-white font-normal leading-[1.14] tracking-tight mb-5 sm:mb-6">
                More Than Gifts,
                <br className="hidden sm:inline" /> We Create Experiences
              </h2>

              <div className="w-12 sm:w-14 h-[2px] bg-[#c5a059] mb-5 sm:mb-6" />

              <div className="space-y-4 text-[#f3e8df] text-xs sm:text-sm lg:text-[14.5px] leading-relaxed font-light max-w-lg">
                <p>
                  Whether you are celebrating employees, appreciating clients, launching a new
                  brand, or creating unforgettable event experiences, we transform your
                  vision into gifts that strengthen relationships and create lasting memories.
                </p>
                <p className="font-serif italic text-sm sm:text-base lg:text-[17px] text-[#dec08e] pt-1">
                  At Shika Arts, we don't just create gifts. We create experiences that people remember.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
          src={sec5LeafCropped}
          alt=""
          loading="lazy"
          className="absolute bottom-0 right-0 w-32 sm:w-44 lg:w-56 xl:w-64 pointer-events-none select-none z-10"
        />

        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 h-[1px] bg-[#c5a059]/35 z-10 pointer-events-none" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full bg-[#faf5ed] py-14 sm:py-16 lg:py-20 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-3.5 mb-3">
            <div className="w-10 sm:w-12 h-[2px] bg-[#c5a059]" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#a08264]">
              Trusted By
            </span>
            <div className="w-10 sm:w-12 h-[2px] bg-[#c5a059]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#4a1525] font-normal leading-[1.14] tracking-tight">
            Our Clients
          </h2>
        </div>

        <div className="w-full space-y-4 sm:space-y-6">
          <marquee
            ref={marqueeRef}
            behavior="scroll"
            direction="left"
            scrollamount="7"
            className="w-full py-1"
          >
            <div className="inline-flex items-center gap-4 sm:gap-6 px-4">
              {clientLogos.map((client, idx) => (
                <div
                  key={`${client.name}-${idx}`}
                  onMouseEnter={() => marqueeRef.current?.stop()}
                  onMouseLeave={() => marqueeRef.current?.start()}
                  className="w-44 sm:w-52 lg:w-60 h-24 sm:h-28 lg:h-32 bg-white rounded-xl border border-[#e8ddd0]/80 p-3 sm:p-5 flex items-center justify-center shadow-[0_2px_10px_rgba(74,21,37,0.04)] hover:shadow-[0_4px_20px_rgba(74,21,37,0.12)] hover:border-[#c5a059] transition-all duration-300 shrink-0 group cursor-pointer"
                >
                  <img
                    src={client.src}
                    alt={client.name}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </marquee>
        </div>
      </motion.div>
    </div>
  );
}

export default AboutUs;
