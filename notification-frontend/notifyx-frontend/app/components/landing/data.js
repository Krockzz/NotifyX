import { Code2, Layers3, Radio, ShieldCheck } from "lucide-react";

export const featureCards = [
  {
    icon: Radio,
    title: "Multi-channel delivery",
    description: "Email, SMS, and push from one event-driven workflow.",
    tag: "CHANNELS",
  },
  {
    icon: ShieldCheck,
    title: "Delivery tracking",
    description: "Follow each notification through attempts and outcomes.",
    tag: "VISIBILITY",
  },
  {
    icon: Layers3,
    title: "Flexible templates",
    description: "Manage clear, consistent messages by event and channel.",
    tag: "CONTENT",
  },
  {
    icon: Code2,
    title: "Developer-first API",
    description: "Keep notification delivery out of your core application.",
    tag: "INTEGRATION",
  },
];

export const steps = [
  ["01", "Send an event", "Your app publishes a meaningful event, such as an order update."],
  ["02", "NotifyX routes it", "Configured event rules choose a template, recipient, and channel."],
  ["03", "Track delivery", "Workers deliver the message and record attempts and outcomes."],
];

