import { motion } from "framer-motion";
import {
  Phone,
  CreditCard,
  Truck,
  MessageCircle,
  CheckCircle,
  MapPin,
  ShoppingBag,
  Info,
} from "lucide-react";
import { Layout } from "@/components/Layout";

const CONTACT = "+254743035900";
const CONTACT_DISPLAY = "+254 743 035 900";
const WA_LINK = "https://wa.me/254743035900";

const steps = [
  { icon: ShoppingBag, title: "1. Pick your item", desc: "Browse and choose what you love from the collection." },
  { icon: CreditCard, title: "2. Send M-Pesa", desc: `Send payment to ${CONTACT_DISPLAY}. Screenshot your confirmation.` },
  { icon: MessageCircle, title: "3. WhatsApp us", desc: "Send us the screenshot + your delivery address on WhatsApp." },
  { icon: Truck, title: "4. We deliver", desc: "Your order is packed and dispatched with faster delivery at a lower cost." },
];

const faqs = [
  { q: "Do you deliver outside Nairobi?", a: "Yes! We deliver countrywide across Kenya — from Mombasa to Kisumu, Nakuru to Eldoret and everywhere in between, with faster delivery at a lower cost." },
  { q: "How long does delivery take?", a: "Nairobi: 1–2 days. Other counties: 2–4 business days depending on your location." },
  { q: "Can I return an item?", a: "Yes. Contact us within 24 hours of receiving your order if there's an issue. We'll sort it out." },
  { q: "Do you accept other payment methods?", a: "Currently we accept M-Pesa only. More options coming soon." },
  { q: "Is there a minimum order?", a: "No minimum order. Order one item or many — we keep delivery faster and lower cost." },
];

export default function Payment() {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-[1.8rem] bg-secondary px-5 py-10 text-center text-secondary-foreground shadow-editorial sm:mb-12 sm:px-10 sm:py-14"
        >
          <span className="relative inline-block rounded-full border border-secondary-foreground/20 bg-secondary-foreground/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-accent mb-4">
            Payment & Delivery
          </span>
          <h1 className="relative font-display text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">How to order & pay</h1>
          <p className="relative mx-auto mt-3 max-w-xl text-base leading-relaxed text-secondary-foreground/75 sm:text-lg">Simple, fast and secure. Pay via M-Pesa and we handle the rest.</p>
        </motion.div>

        {/* M-Pesa number — big & prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="relative mb-6 overflow-hidden rounded-[1.6rem] bg-primary p-7 text-center text-primary-foreground shadow-editorial sm:p-9"
        >
          <CreditCard className="relative mx-auto mb-3 h-10 w-10 opacity-90" />
          <p className="relative mb-2 font-mono-ui text-sm font-semibold uppercase tracking-widest text-primary-foreground/75">M-Pesa Payment Number</p>
          <a
            href={`tel:${CONTACT}`}
            className="relative mb-2 block text-3xl font-extrabold tracking-tight transition-colors hover:text-accent sm:text-5xl"
          >
            {CONTACT_DISPLAY}
          </a>
          <p className="relative text-sm text-primary-foreground/75">Tap to call · Send Lipa na M-Pesa</p>
        </motion.div>

        {/* Faster, lower-cost delivery banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="mb-10 flex items-center gap-4 rounded-2xl border border-secondary/20 bg-secondary/10 px-5 py-5 sm:px-6"
        >
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="font-black text-foreground text-lg">Faster delivery, lower cost</p>
            <p className="text-muted-foreground text-sm">We deliver across Kenya with practical delivery rates and faster dispatch. Nairobi same-day available.</p>
          </div>
        </motion.div>

        {/* How to order steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-12"
        >
          <h2 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-foreground">A clear four-step flow</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="group flex items-start gap-4 rounded-2xl border border-border/75 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-float sm:p-6"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/35 transition-transform group-hover:rotate-[-5deg]">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-black text-foreground mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact options */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-12"
        >
          <h2 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-foreground">Real people, right here</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href={`tel:${CONTACT}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border/75 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-float"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <p className="font-black text-foreground text-sm">Call Us</p>
              <p className="text-xs text-muted-foreground">{CONTACT_DISPLAY}</p>
            </a>

            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border/75 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-float"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-secondary">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <p className="font-black text-foreground text-sm">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Chat with us</p>
            </a>

            <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-5 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-black text-foreground text-sm">Delivery</p>
               <p className="text-xs text-muted-foreground">All 47 Counties · Lower cost</p>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-foreground">The useful details</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 + i * 0.06 }}
                className="rounded-2xl border border-border/75 bg-card p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground mb-1">{q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex items-start gap-3 rounded-2xl border border-accent/50 bg-accent/20 p-5 text-sm text-foreground/75"
        >
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>For bulk orders, business inquiries, or if you'd like to list your products on Mkenya Shop, reach us on WhatsApp or call the number above.</p>
        </motion.div>

      </div>
    </Layout>
  );
}
