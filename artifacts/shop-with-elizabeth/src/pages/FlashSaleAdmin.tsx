import { useMemo, useState } from "react";
import { CalendarClock, Check, Clock3, Edit3, Eye, EyeOff, Flame, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProducts } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/ProductImage";
import { useUser } from "@/hooks/useUser";
import {
  createFlashSale,
  deleteFlashSale,
  updateFlashSale,
  useAdminFlashSales,
  type FlashSale,
  type FlashSaleInput,
} from "@/lib/flashSales";

function toDateTimeInput(value: Date) {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toLocalInput(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : toDateTimeInput(date);
}

function newFormState(): Omit<FlashSaleInput, "createdBy"> {
  const start = new Date(Date.now() + 5 * 60_000);
  const end = new Date(start.getTime() + 8 * 60 * 60_000);
  return {
    productId: "",
    salePrice: 0,
    startsAt: toDateTimeInput(start),
    endsAt: toDateTimeInput(end),
    isPublished: false,
  };
}

function statusForSale(sale: FlashSale) {
  const now = Date.now();
  const start = new Date(sale.startsAt).getTime();
  const end = new Date(sale.endsAt).getTime();
  if (!sale.isPublished) return { label: "Draft", tone: "bg-muted text-muted-foreground" };
  if (now < start) return { label: "Scheduled", tone: "bg-accent text-accent-foreground" };
  if (now < end) return { label: "Live now", tone: "bg-secondary text-secondary-foreground" };
  return { label: "Ended", tone: "bg-destructive/10 text-destructive" };
}

export default function FlashSaleAdmin() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: sales = [], isLoading: salesLoading, isError: salesError } = useAdminFlashSales();
  const [form, setForm] = useState(newFormState);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.productId),
    [form.productId, products],
  );

  const resetForm = () => {
    setForm(newFormState());
    setEditingSaleId(null);
    setFormError("");
  };

  const startEdit = (sale: FlashSale) => {
    setEditingSaleId(sale.id);
    setForm({
      productId: sale.productId,
      salePrice: sale.salePrice,
      startsAt: toLocalInput(sale.startsAt),
      endsAt: toLocalInput(sale.endsAt),
      isPublished: sale.isPublished,
    });
    setFormError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!user.id) {
      setFormError("Your browser user is still loading. Please try again.");
      return;
    }
    if (!form.productId || !form.salePrice || !form.startsAt || !form.endsAt) {
      setFormError("Choose a product, sale price, start time, and end time.");
      return;
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setFormError("End time must be after the start time.");
      return;
    }

    const payload: FlashSaleInput = {
      ...form,
      salePrice: Number(form.salePrice),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      createdBy: user.id,
    };

    setIsSaving(true);
    try {
      if (editingSaleId) {
        await updateFlashSale(editingSaleId, payload);
        setSuccessMessage("Flash sale updated.");
      } else {
        await createFlashSale(payload);
        setSuccessMessage("Flash sale created.");
      }
      await queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save the flash sale.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (sale: FlashSale) => {
    setFormError("");
    setSuccessMessage("");
    try {
      await updateFlashSale(sale.id, {
        productId: sale.productId,
        salePrice: sale.salePrice,
        startsAt: sale.startsAt,
        endsAt: sale.endsAt,
        isPublished: !sale.isPublished,
        createdBy: user.id,
      });
      await queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      setSuccessMessage(sale.isPublished ? "Flash sale unpublished." : "Flash sale published.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not update the flash sale.");
    }
  };

  const handleDelete = async (sale: FlashSale) => {
    if (!window.confirm(`Remove the flash sale for ${sale.product.name}?`)) return;
    setFormError("");
    try {
      await deleteFlashSale(sale.id);
      await queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      if (editingSaleId === sale.id) resetForm();
      setSuccessMessage("Flash sale removed.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not remove the flash sale.");
    }
  };

  return (
    <Layout>
      <main className="market-grid mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Flame className="h-4 w-4" /> Store control room
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-[-0.06em] text-foreground sm:text-6xl">Flash sale manager</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose exactly which products appear in Flash Finds, set their reduced price, and decide when the deal goes live.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-accent/50 bg-accent/15 px-4 py-3 text-xs font-bold text-accent-foreground">
            <CalendarClock className="h-4 w-4" />
            Login protection coming next
          </div>
        </div>

        <div className="mb-8 border-l-4 border-accent bg-accent/15 px-4 py-3 text-sm text-foreground">
          This page is ready for your admin workflow. Until admin login is added, access is not restricted to an authenticated owner, so do not publish it as a secure control panel yet.
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <section className="paper-panel h-fit rounded-[1.5rem] border border-border/75 p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {editingSaleId ? "Edit promotion" : "New promotion"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">{editingSaleId ? "Update flash sale" : "Add flash sale"}</h2>
              </div>
              {editingSaleId && (
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>

            {(formError || successMessage) && (
              <div className={`mb-5 border px-4 py-3 text-sm ${formError ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-secondary/30 bg-secondary/10 text-foreground"}`}>
                {formError || successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="flash-product" className="mb-2 block text-sm font-bold">Product</label>
                <select
                  id="flash-product"
                  value={form.productId}
                  onChange={(event) => {
                    const product = products.find((item) => item.id === event.target.value);
                    setForm((current) => ({ ...current, productId: event.target.value, salePrice: product && !current.salePrice ? Math.max(1, Math.floor(product.price * 0.9)) : current.salePrice }));
                  }}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  disabled={productsLoading || isSaving}
                  required
                >
                  <option value="">{productsLoading ? "Loading products…" : "Choose a product"}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · KES {product.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                {!productsLoading && products.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">Add a real seller product before creating a flash sale. Preview seed products are not editable here.</p>
                )}
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-card">
                    <ProductImage src={selectedProduct.imageUrl} alt={selectedProduct.name} category={selectedProduct.category} fit="contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{selectedProduct.name}</p>
                    <p className="mt-1 font-mono-ui text-xs text-muted-foreground">Regular price · KES {selectedProduct.price.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="flash-price" className="mb-2 block text-sm font-bold">Flash price (KES)</label>
                <Input
                  id="flash-price"
                  type="number"
                  min="1"
                  step="1"
                  value={form.salePrice || ""}
                  onChange={(event) => setForm((current) => ({ ...current, salePrice: Number(event.target.value) }))}
                  placeholder="Enter the reduced price"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="flash-start" className="mb-2 block text-sm font-bold">Starts</label>
                  <Input id="flash-start" type="datetime-local" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} required />
                </div>
                <div>
                  <label htmlFor="flash-end" className="mb-2 block text-sm font-bold">Ends</label>
                  <Input id="flash-end" type="datetime-local" value={form.endsAt} onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))} required />
                </div>
              </div>

                <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/25 p-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                Publish this deal on the storefront when the schedule is active
              </label>

              <Button type="submit" disabled={isSaving || productsLoading || products.length === 0} className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                {isSaving ? "Saving…" : editingSaleId ? <><Check className="mr-2 h-4 w-4" /> Save changes</> : <><Plus className="mr-2 h-4 w-4" /> Add flash sale</>}
              </Button>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Your promotions</p>
                <h2 className="mt-1 font-display text-3xl font-bold">Scheduled deals</h2>
              </div>
              <span className="font-mono-ui text-xs font-bold text-muted-foreground">{sales.length} total</span>
            </div>

            {salesLoading ? (
              <div className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading flash sales…</div>
            ) : salesError ? (
              <div className="border border-destructive/30 bg-destructive/5 p-10 text-center text-sm text-destructive">Could not load the flash-sale list.</div>
            ) : sales.length === 0 ? (
              <div className="border border-dashed border-border bg-card px-6 py-16 text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-4 font-display text-2xl font-bold">No deals yet</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Choose a product on the left to create the first scheduled promotion.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => {
                  const status = statusForSale(sale);
                  return (
                    <article key={sale.id} className="flex flex-col gap-4 rounded-2xl border border-border/75 bg-card p-4 shadow-sm transition-shadow hover:shadow-float sm:flex-row sm:items-center">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/45">
                        <ProductImage src={sale.product.imageUrl} alt={sale.product.name} category={sale.product.category} fit="contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 font-mono-ui text-[10px] font-bold uppercase tracking-[0.12em] ${status.tone}`}>{status.label}</span>
                          <span className="text-xs text-muted-foreground">{sale.product.category}</span>
                        </div>
                        <h3 className="mt-2 truncate font-bold">{sale.product.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono-ui font-bold text-primary">KES {sale.salePrice.toLocaleString()}</span>
                          <span className="font-mono-ui line-through">KES {sale.product.price.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {new Date(sale.startsAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2 sm:flex-col">
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(sale)} aria-label={`Edit ${sale.product.name}`}>
                          <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleTogglePublished(sale)} aria-label={`${sale.isPublished ? "Unpublish" : "Publish"} ${sale.product.name}`}>
                          {sale.isPublished ? <><EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hide</> : <><Eye className="mr-1.5 h-3.5 w-3.5" /> Publish</>}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(sale)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${sale.product.name}`}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}