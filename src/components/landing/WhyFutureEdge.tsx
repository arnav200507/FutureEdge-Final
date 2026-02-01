import { GraduationCap, FileText, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    icon: GraduationCap,
    title: "End-to-end admission guidance",
    description: "From college selection to final admission",
  },
  {
    icon: FileText,
    title: "Document & form support",
    description: "We handle the paperwork for you",
  },
  {
    icon: Users,
    title: "Personalised counselling",
    description: "One-on-one guidance tailored to your goals",
  },
  {
    icon: Shield,
    title: "Transparent & student-first",
    description: "No hidden costs, no pressure",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const WhyFutureEdge = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground">
            Why Students <span className="text-primary">Trust Future Edge</span>
          </h2>
        </motion.div>

        {/* Card Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto"
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyFutureEdge;
