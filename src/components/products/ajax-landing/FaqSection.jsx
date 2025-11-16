import { Card } from "@/components/ui/card";
import { useState } from "react";

const faqs = [
  {
    question: "Do I have to sign a monitoring contract?",
    answer:
      "No. Ajax Hub 2 works perfectly on its own—you get alerts on your phone, control everything from the app, and the system still scares the wolf away with sirens. Monitoring is optional if you want professional 24/7 watch.",
  },
  {
    question: "Will my pets set it off?",
    answer:
      "Most motion sensors have pet-friendly modes that ignore animals under 20kg. Your cat or small dog can wander around freely without triggering alarms. The sensors are smart enough to tell the difference between a pet and a human intruder.",
  },
  {
    question: "Can I start small and add more later?",
    answer:
      "Absolutely. Start with a basic kit (Hub, a few sensors, one siren) and add devices whenever you want. The Hub can handle up to 100 devices, so you have plenty of room to grow. No need to replace anything—just add more sensors, cameras, or sirens as you need them.",
  },
  {
    question: "Does it still work during a power cut?",
    answer:
      "Yes. The Hub has a built-in battery backup that lasts about 16 hours. Your sensors run on batteries too (they last years), so even if the power goes out, the system keeps watching. The 4G connection also works independently of your home power.",
  },
  {
    question: "What if my Wi-Fi or NBN goes down?",
    answer:
      "That&apos;s why the Hub has 4G. If your internet dies, it automatically switches to the mobile SIM card and keeps sending you alerts. The wolf can&apos;t cut your connection—the Hub always finds a way to reach you.",
  },
  {
    question: "Can I move it if I shift house?",
    answer:
      "Yes. Unlike wired systems, Ajax is completely wireless. When you move, just unplug the Hub, take all your sensors with you, and set everything up in your new place. No rewiring, no professional installation needed—it&apos;s designed to be portable.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Questions</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
            FAQs written like normal human questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer transition-all duration-300 hover:shadow-md"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg text-slate-900 flex-1">{faq.question}</h3>
                <span className="text-2xl text-[#0AA9AB] flex-shrink-0">
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

