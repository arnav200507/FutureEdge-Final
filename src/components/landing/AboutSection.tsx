import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full md:w-1/2 lg:w-[55%]"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground">
              About <span className="text-primary">Future Edge</span>
            </h2>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Future Edge was created to simplify the complex admission process and
                help students make confident decisions about their future.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                We understand the stress and confusion that comes with choosing the
                right college and career path. That's why our team of experienced
                counsellors is dedicated to guiding students every step of the way —
                from exploring options to securing admission.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Whether you're navigating entrance exams, comparing colleges, or
                completing admission forms, Future Edge is here to support you and
                your family through this important milestone.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border"
            >
              <p className="text-foreground font-medium text-sm sm:text-base italic">
                "Empowering students to make informed decisions about their future."
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                — The Future Edge Team
              </p>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="w-full md:w-1/2 lg:w-[45%]"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl transition-all duration-500 group-hover:bg-primary/10" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                alt="Team discussion"
                className="relative rounded-3xl shadow-lg w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
