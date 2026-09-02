"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.7, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
  stagger?: boolean;
  delay?: number;
};

export function AnimatedIn({ children, className, as = "div", stagger: useStagger, delay = 0 }: Props) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={useStagger ? stagger : fadeUp}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
