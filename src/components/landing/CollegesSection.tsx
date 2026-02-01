import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const colleges = [
  {
    name: "IIT Bombay",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80",
  },
  {
    name: "COEP Technological University",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
  },
  {
    name: "VJTI Mumbai",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&q=80",
  },
  {
    name: "MIT-WPU",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80",
  },
  {
    name: "VIT Pune",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&q=80",
  },
  {
    name: "Symbiosis Institute",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const CollegesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="colleges" className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground">
            Explore Colleges Across{" "}
            <span className="text-primary">Maharashtra & India</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover top engineering colleges and find the perfect fit for your academic journey
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-3 sm:gap-4" style={{ width: "max-content" }}>
            {colleges.map((college, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative w-64 sm:w-72 aspect-[4/3] rounded-2xl overflow-hidden group"
              >
                <img
                  src={college.image}
                  alt={college.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{college.name}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    {college.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {colleges.map((college, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={college.image}
                alt={college.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-xl">{college.name}</h3>
                <div className="flex items-center gap-1 text-white/80 text-sm mt-2">
                  <MapPin className="h-4 w-4" />
                  {college.location}
                </div>
                <div
                  className={`mt-4 transition-all duration-300 ${
                    hoveredIndex === index
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <Button size="sm" variant="secondary" className="transition-transform duration-200 hover:scale-105">
                    View College
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CollegesSection;
