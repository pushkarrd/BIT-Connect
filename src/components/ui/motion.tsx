"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedTextProps {
    text: string;
    className?: string;
    el?: React.ElementType;
    once?: boolean;
    delay?: number;
}

const letterAnimations = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.1,
        },
    },
};

export const AnimatedLetters = ({
    text,
    className,
    el: Wrapper = "span",
    once = true,
    delay = 0,
}: AnimatedTextProps) => {
    return (
        <Wrapper className={className}>
            <motion.span
                initial="hidden"
                whileInView="visible"
                viewport={{ once, amount: 0.5 }}
                transition={{ staggerChildren: 0.05, delayChildren: delay }}
                aria-hidden
                className="inline-block"
            >
                {text.split("").map((char, index) => (
                    <motion.span key={index} variants={letterAnimations} className="inline-block">
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                ))}
            </motion.span>
            <span className="sr-only">{text}</span>
        </Wrapper>
    );
};

interface FadeInProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    once?: boolean;
}

export const FadeIn = ({
    children,
    delay = 0,
    duration = 0.5,
    direction = "up",
    once = true,
    className,
    ...props
}: FadeInProps) => {
    const directions = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
        none: { x: 0, y: 0 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, margin: "-50px" }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({
    children,
    className,
    delayChildren = 0.1,
    staggerChildren = 0.1
}: { children: React.ReactNode, className?: string, delayChildren?: number, staggerChildren?: number }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren, delayChildren }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
    };
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}
