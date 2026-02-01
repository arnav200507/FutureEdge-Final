import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-students.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-[calc(100vh-4rem)] pt-16 bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          {/* Text + Image Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground leading-tight"
            >
              Guiding Students to the Right{" "}
              <span className="text-primary">College & Career</span>
            </motion.h1>

            {/* Hero Image - Mobile/Tablet (between heading and paragraph) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="lg:hidden mt-6 sm:mt-8 w-full max-w-sm sm:max-w-lg mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
                <img
                  src={heroImage}
                  alt="Students on campus"
                  className="relative rounded-3xl shadow-card w-full aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>

            {/* Paragraph and Buttons */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            >
              Future Edge provides personalised admission counselling, college
              guidance, and complete admission support.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" asChild className="text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <a href="#colleges">
                  Explore Colleges
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/login">Student Login</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="mt-6"
            >
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Talk to a Counsellor
              </Button>
            </motion.div>
          </div>

          {/* Hero Image - Desktop (side by side) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block flex-1 w-full"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
              <img
                src={heroImage}
                alt="Students on campus"
                className="relative rounded-3xl shadow-card w-full aspect-[4/3] object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
