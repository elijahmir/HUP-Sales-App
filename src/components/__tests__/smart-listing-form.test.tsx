import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartListingForm from "../smart-listing-form";
import { ListingData } from "@/lib/gemini-ocr";

// Mock the props
const mockInitialData: ListingData = {
  address: "123 Test St",
  listing_agent: "John Doe",
  price: {
    display_text: "Offers Over $500k",
    method: "Offers To",
    amount: "500000",
  },
  bed_1: { exists: true, measurements: "4x4", wardrobe_type: "WI" },
  bathroom: { exists: true, measurements: "3x3", type: "SOB" },
  kitchen: { exists: true, connected_to: "Dining" },
  agency_type: "Sole",
};

const mockOnChange = vi.fn();

describe("SmartListingForm", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders correctly with initial data", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Offers Over $500k")).toBeInTheDocument();
  });

  it("renders Harcourts branding header", () => {
    render(<SmartListingForm initialData={mockInitialData} />);

    // Check for Harcourts text in header
    expect(screen.getByText("Harcourts")).toBeInTheDocument();
  });

  it("renders blue section headers", () => {
    render(<SmartListingForm initialData={mockInitialData} />);

    // Check for blue header sections
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Postal Address")).toBeInTheDocument();
  });

  it("updates simple fields correctly", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    const addressInput = screen.getByDisplayValue("123 Test St");
    fireEvent.change(addressInput, { target: { value: "456 New Ave" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "456 New Ave",
      }),
    );
  });

  it("updates nested fields correctly", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    const priceInput = screen.getByDisplayValue("Offers Over $500k");
    fireEvent.change(priceInput, { target: { value: "Fixed Price $600k" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        price: expect.objectContaining({
          display_text: "Fixed Price $600k",
        }),
      }),
    );
  });

  it("handles checkbox interactions", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    // Find Bed 1 checkbox (the new format uses "Bed 1:")
    const bed1Label = screen.getByText("Bed 1:");
    fireEvent.click(bed1Label);

    // Should toggle false
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bed_1: expect.objectContaining({ exists: false }),
      }),
    );
  });

  it("handles agency type radio buttons", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    // Find the Open radio button and click it
    const openRadio = screen.getByLabelText("Open");
    fireEvent.click(openRadio);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        agency_type: "Open",
      }),
    );
  });

  it("renders in read-only mode", () => {
    render(<SmartListingForm initialData={mockInitialData} readOnly={true} />);

    const input = screen.getByDisplayValue("123 Test St");
    expect(input).toBeDisabled();
  });

  it("calls onViewImage when See Image button is clicked", () => {
    const mockOnViewImage = vi.fn();
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onViewImage={mockOnViewImage}
      />,
    );

    const seeImageButton = screen.getByText("See Image");
    fireEvent.click(seeImageButton);

    expect(mockOnViewImage).toHaveBeenCalled();
  });

  it("does not render See Image button when onViewImage is not provided", () => {
    render(<SmartListingForm initialData={mockInitialData} />);

    expect(screen.queryByText("See Image")).not.toBeInTheDocument();
  });
});
