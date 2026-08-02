"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { CATEGORIES } from "@/lib/sanity/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

const FIELD_CLASSES = "space-y-2";
const ERROR_CLASSES = "text-sm text-destructive";

/**
 * Base UI's Select only resolves a value to its display label via this map
 * (or a registered `<Select.Item>`, which is unmounted once the popup
 * closes) — without it, the trigger falls back to the raw stored value
 * ("commercial") instead of the label ("Commercial") once a choice is made.
 */
const INQUIRY_TYPE_ITEMS = Object.fromEntries(CATEGORIES.map((category) => [category.value, category.label]));

export function ContactForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", eventDate: "", message: "", company: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      toast.success("Message sent — expect a reply at the email you gave us.");
      reset();
      return;
    }

    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    toast.error(body?.message ?? "That didn't send. Check your connection and try again.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/*
       * Honeypot — a real, focusable input so a bot's form-filler still
       * finds it, but positioned off-screen and pulled out of the tab
       * order/AT tree so no human, sighted or not, ever encounters it.
       */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        {...register("company")}
      />

      <div className={FIELD_CLASSES}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name ? <p className={ERROR_CLASSES}>{errors.name.message}</p> : null}
      </div>

      <div className={FIELD_CLASSES}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email ? <p className={ERROR_CLASSES}>{errors.email.message}</p> : null}
      </div>

      <div className={FIELD_CLASSES}>
        <Label htmlFor="inquiryType">What&rsquo;s this about?</Label>
        <Controller
          control={control}
          name="inquiryType"
          render={({ field }) => (
            // Base UI decides controlled-vs-uncontrolled from whether the
            // first render's value is `undefined` — RHF's own default for an
            // unset field. Falling back to "" keeps it controlled from the
            // start and still resolves to the placeholder (SelectValue
            // treats "" as "nothing selected", same as null/undefined).
            <Select items={INQUIRY_TYPE_ITEMS} value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="inquiryType" className="w-full" aria-invalid={!!errors.inquiryType}>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.inquiryType ? <p className={ERROR_CLASSES}>{errors.inquiryType.message}</p> : null}
      </div>

      <div className={FIELD_CLASSES}>
        <Label htmlFor="eventDate">Event date (optional)</Label>
        <Input id="eventDate" type="date" {...register("eventDate")} />
      </div>

      <div className={FIELD_CLASSES}>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register("message")} />
        {errors.message ? <p className={ERROR_CLASSES}>{errors.message.message}</p> : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="h-11 w-full gap-2 px-8 font-mono text-sm tracking-widest uppercase sm:w-auto"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
