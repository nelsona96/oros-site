import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: (...args: unknown[]) => toastError(...args) },
}));

import { ContactForm } from "./contact-form";

function fillRequiredTextFields() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jamie" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jamie@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "We're planning a fall wedding and would love to talk about coverage." },
  });
}

async function selectInquiryType(label: string) {
  fireEvent.click(screen.getByRole("combobox", { name: /type of shoot/i }));
  fireEvent.click(await screen.findByRole("option", { name: label }));
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a validation error and never calls fetch when required fields are empty", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits, toasts success, and resets the form on a 200 response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    render(<ContactForm />);

    fillRequiredTextFields();
    await selectInquiryType("Weddings");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  });

  it("toasts the server's error message on a failed response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Contact form isn't configured yet." }),
    });
    render(<ContactForm />);

    fillRequiredTextFields();
    await selectInquiryType("Weddings");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Contact form isn't configured yet."));
  });
});
