import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, className = "" }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useMotionValueEvent(count, "change", (latest) => {
    setDisplay(Number(latest).toFixed(decimals));
  });

  useEffect(() => {
    const controls = animate(count, Number(value || 0), {
      duration: 1.2,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [count, value]);

  return <motion.span className={className}>{`${prefix}${display}${suffix}`}</motion.span>;
}
