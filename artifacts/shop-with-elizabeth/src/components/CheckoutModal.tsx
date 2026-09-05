import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Package, CreditCard, MessageCircle, PartyPopper, Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, type CartItem } from "@/hooks/useCart";
import {
  getGetMpesaPaymentStatusQueryKey,
  useGetMpesaPaymentStatus,
  useInitiateMpesaStkPush,
} from "@workspace/api-client-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickBuyItem?: CartItem | null;
}

const KENYAN_COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Nyeri",
  "Machakos",
  "Meru",
  "Kakamega",
  "Kericho",
  "Embu",
  "Nanyuki",
  "Voi",
  "Homa Bay",
  "Bungoma",
  "Naivasha",
];

export function CheckoutModal({ isOpen, onClose, quickBuyItem = null }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const activeItems = quickBuyItem ? [quickBuyItem] : cartItems;
  const activeTotal = quickBuyItem ? quickBuyItem.price : cartTotal;
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [notes, setNotes] = useState("");
  const [orderRef] = useState(() => `SWE-${Date.now().toString(36).toUpperCase()}`);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [stkStatus, setStkStatus] = useState<"pending" | "completed" | "failed" | null>(null);
  const [stkError, setStkError] = useState("");

  const initiateStkPush = useInitiateMpesaStkPush();
  const paymentStatus = useGetMpesaPaymentStatus(checkoutRequestId ?? "", {
    query: {
      queryKey: getGetMpesaPaymentStatusQueryKey(checkoutRequestId ?? ""),
      enabled: Boolean(checkoutRequestId) && step === 4 && stkStatus === "pending",
      refetchInterval: 2000,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setCheckoutRequestId(null);
    setStkStatus(null);
    setStkError("");
  }, [isOpen, quickBuyItem?.id]);

  useEffect(() => {
    const status = paymentStatus.data?.status;
    if (status === "completed" || status === "failed") {
      setStkStatus(status);
    }
  }, [paymentStatus.data?.status]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2 && name.trim() && phone.trim() && address.trim()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleWhatsApp = () => {
    const itemsList = activeItems
      .map((item) => `• ${item.name} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");
    const message = `Hi! I'd like to place an order:\n\nOrder Reference: ${orderRef}\n\nItems:\n${itemsList}\n\nTotal: KES ${activeTotal.toLocaleString()}\n\nDelivery Details:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nCounty: ${county}${notes ? `\nNotes: ${notes}` : ""}\n\nI've sent the M-Pesa payment. Please confirm!`;
    window.open(`https://wa.me/254743035900?text=${encodeURIComponent(message)}`, "_blank");
    setStep(4);
  };

  const handleStkPush = async () => {
    setStkError("");
    try {
      const response = await initiateStkPush.mutateAsync({
        data: {
          amount: activeTotal,
          phone,
          orderRef,
          customerName: name,
          deliveryAddress: address,
          county,
          items: activeItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      });
      setCheckoutRequestId(response.checkoutRequestId);
      setStkStatus("pending");
      setStep(4);
    } catch (error) {
      setStkError(error instanceof Error ? error.message : "M-Pesa could not start the payment prompt.");
    }
  };

  const handleDone = () => {
    if (!quickBuyItem) clearCart();
    onClose();
    setStep(1);
    setName("");
    setPhone("");
    setAddress("");
    setCounty("Nairobi");
    setNotes("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            data-testid="checkout-backdrop"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              data-testid="checkout-modal"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-xl font-black text-foreground">Checkout</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-muted hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                  data-testid="button-close-checkout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground">Order Summary</h3>
                          <p className="text-sm text-muted-foreground">Review your items</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                         {activeItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 bg-muted/30 rounded-xl p-3"
                            data-testid={`checkout-item-${item.id}`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg bg-muted shrink-0"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-sm text-foreground line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × KES {item.price.toLocaleString()}
                              </p>
                              <p className="text-sm font-black text-secondary mt-1">
                                KES {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-black text-foreground">Total</span>
                           <span className="font-black text-secondary" data-testid="text-checkout-total">
                             KES {activeTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground">Delivery Details</h3>
                          <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-bold mb-2 block">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Kamau"
                            className="h-11 rounded-xl"
                            required
                            data-testid="input-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-sm font-bold mb-2 block">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254 712 345 678"
                            className="h-11 rounded-xl"
                            required
                            data-testid="input-phone"
                          />
                        </div>

                        <div>
                          <Label htmlFor="address" className="text-sm font-bold mb-2 block">
                            Delivery Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Building, Street, Estate"
                            className="h-11 rounded-xl"
                            required
                            data-testid="input-address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="county" className="text-sm font-bold mb-2 block">
                            County/Area
                          </Label>
                          <select
                            id="county"
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            className="w-full h-11 rounded-xl bg-background border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            data-testid="select-county"
                          >
                            {KENYAN_COUNTIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-sm font-bold mb-2 block">
                            Additional Notes (Optional)
                          </Label>
                          <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special delivery instructions..."
                            className="w-full h-20 rounded-xl bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            data-testid="input-notes"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground">M-Pesa Payment</h3>
                          <p className="text-sm text-muted-foreground">Send payment to complete your order</p>
                        </div>
                      </div>

                      <div className="bg-green-600 text-white rounded-2xl p-6 text-center mb-4">
                        <p className="text-green-100 text-sm font-semibold mb-2">Send payment to:</p>
                         <p className="text-3xl font-black mb-1">+254 743 035 900</p>
                         <p className="text-green-200 text-sm">Manual M-Pesa / Lipa na M-Pesa</p>
                      </div>

                      <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order Reference</span>
                          <span className="font-bold text-foreground" data-testid="text-order-ref">{orderRef}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount to Send</span>
                           <span className="font-black text-secondary text-lg">KES {activeTotal.toLocaleString()}</span>
                        </div>
                      </div>

                       <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
                         <div className="flex items-start gap-3">
                           <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                           <div className="flex-1">
                             <p className="font-black text-foreground">Pay directly with M-Pesa</p>
                             <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                               We’ll send an STK Push to <strong>{phone || "your phone"}</strong>. Enter your M-Pesa PIN on your phone to pay KES {activeTotal.toLocaleString()}.
                             </p>
                             <Button
                               onClick={handleStkPush}
                               disabled={initiateStkPush.isPending || !phone.trim()}
                               className="mt-4 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                               data-testid="button-mpesa-stk"
                             >
                               {initiateStkPush.isPending ? (
                                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending prompt…</>
                               ) : (
                                 <><Smartphone className="mr-2 h-4 w-4" /> Request STK Push</>
                               )}
                             </Button>
                           </div>
                         </div>
                       </div>
                       {stkError && (
                         <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
                           <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                           <span>{stkError}</span>
                         </div>
                       )}

                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                         <p className="font-bold text-foreground mb-3 text-sm">Or keep the current manual option:</p>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="font-bold text-primary shrink-0">1.</span>
                            <span>Go to M-Pesa on your phone</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-primary shrink-0">2.</span>
                             <span>Select Lipa na M-Pesa and send <strong>KES {activeTotal.toLocaleString()}</strong> to <strong>+254 743 035 900</strong></span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-bold text-primary shrink-0">3.</span>
                            <span>Click the button below to send us your order details on WhatsApp</span>
                          </li>
                        </ol>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <PartyPopper className="w-10 h-10 text-green-500" />
                      </motion.div>
                       {stkStatus === "pending" ? (
                         <>
                           <Smartphone className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
                           <h3 className="text-2xl font-black text-foreground mb-2">Check your phone</h3>
                           <p className="text-muted-foreground mb-1">An M-Pesa payment prompt is waiting on {phone}.</p>
                           <p className="text-sm text-muted-foreground mb-6">Enter your PIN on the M-Pesa prompt. This page will update automatically.</p>
                         </>
                       ) : stkStatus === "completed" ? (
                         <>
                           <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                           <h3 className="text-2xl font-black text-foreground mb-2">Payment received!</h3>
                           <p className="text-muted-foreground mb-1">Your M-Pesa payment was confirmed securely.</p>
                           {paymentStatus.data?.receipt && <p className="text-sm text-muted-foreground mb-6">Receipt: <span className="font-bold text-foreground">{paymentStatus.data.receipt}</span></p>}
                         </>
                       ) : stkStatus === "failed" ? (
                         <>
                           <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
                           <h3 className="text-2xl font-black text-foreground mb-2">Payment not completed</h3>
                           <p className="text-muted-foreground mb-6">You can try again or use the manual M-Pesa + WhatsApp option.</p>
                         </>
                       ) : (
                         <>
                           <h3 className="text-2xl font-black text-foreground mb-2">Order placed!</h3>
                           <p className="text-muted-foreground mb-1">
                             We'll confirm your order on WhatsApp within 30 minutes.
                           </p>
                         </>
                       )}
                       {stkStatus === null && (
                      <p className="text-sm text-muted-foreground mb-6">
                        Order Reference: <span className="font-bold text-foreground">{orderRef}</span>
                      </p>
                       )}
                      <div className="bg-muted/30 rounded-2xl p-5 text-left space-y-2 text-sm">
                        <p className="font-bold text-foreground">What happens next?</p>
                        <ul className="space-y-1 text-muted-foreground">
                           <li>✓ {stkStatus === "completed" ? "Payment confirmed" : "We verify your M-Pesa payment"}</li>
                          <li>✓ Pack your order with care</li>
                           <li>✓ Delivery is faster at a lower cost to {county}</li>
                           <li>✓ Keep you updated on WhatsApp</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-border p-5 flex gap-3">
                {step > 1 && step < 4 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 rounded-xl font-bold"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                    data-testid="button-confirm-order"
                  >
                    Confirm Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    onClick={handleNext}
                    disabled={!name.trim() || !phone.trim() || !address.trim()}
                    className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                    data-testid="button-continue"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    onClick={handleWhatsApp}
                    className="flex-1 h-12 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-whatsapp"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send WhatsApp
                  </Button>
                )}

                {step === 4 && (
                  <Button
                    onClick={handleDone}
                    className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                    data-testid="button-done"
                  >
                    Done
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
