import { Cpu, Database, Brain, Cog, Building, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const branches = [
  {
    icon: Cpu,
    name: "Computer Engineering",
    description: "Build the digital future",
  },
  {
    icon: Database,
    name: "Information Technology",
    description: "Connect the world through technology",
  },
  {
    icon: Brain,
    name: "AI & Data Science",
    description: "Unlock insights from data",
  },
  {
    icon: Cog,
    name: "Mechanical Engineering",
    description: "Design machines that move the world",
  },
  {
    icon: Building,
    name: "Civil Engineering",
    description: "Shape the infrastructure of tomorrow",
  },
  {
    icon: Zap,
    name: "Electronics & Telecommunication",
    description: "Power the connected world",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const BranchesSection = () => {
  return (
    <section id="branches" className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground">
            Explore Engineering <span className="text-primary">Branches</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the right specialization that aligns with your passion and career goals
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Image - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full md:w-1/2 lg:w-2/5 order-first md:order-last"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80"
                alt="Engineering students"
                className="relative rounded-3xl shadow-lg w-full aspect-video md:aspect-[4/5] object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </motion.div>

          {/* Branch List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="w-full md:w-1/2 lg:w-3/5 space-y-2 sm:space-y-3"
          >
            {branches.map((branch, index) => {
              const Icon = branch.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-background transition-all duration-300 group cursor-pointer hover:shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">{branch.name}</h3>
                    <p className="text-sm text-muted-foreground">{branch.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex text-muted-foreground group-hover:text-primary transition-colors duration-200"
                  >
                    View Colleges
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BranchesSection;
