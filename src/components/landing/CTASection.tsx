import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-primary overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-primary-foreground"
        >
          Ready to take the next step towards your future?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 sm:mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto"
        >
          Join thousands of students who found their perfect college with Future Edge
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base bg-white text-primary hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
          >
            <Link to="/login">
              Login to Student Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base bg-white text-primary hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
          >
            <a href="mailto:vikramdesh55@gmail.com">
              <Mail className="mr-2 h-5 w-5" />
              Contact Future Edge
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
