import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartListingForm from "../smart-listing-form";
import { ListingData } from "@/lib/gemini-ocr";

// Mock the props
const mockInitialData: ListingData = {
  address: "123 Test St",
  address_components: {
    unit: "3",
    street_number: "123",
    street_name: "Test St",
    suburb: "Testville",
    state: "NSW",
    postcode: "2000",
  },
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

    // Check for address components
    expect(screen.getByDisplayValue("123")).toBeInTheDocument(); // Street number
    expect(screen.getByDisplayValue("Test St")).toBeInTheDocument(); // Street name
    expect(screen.getByDisplayValue("Testville")).toBeInTheDocument(); // Suburb

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

    const agentInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(agentInput, { target: { value: "Jane Doe" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_agent: "Jane Doe",
      }),
    );
  });

  it("updates address components correctly", () => {
    render(
      <SmartListingForm
        initialData={mockInitialData}
        onChange={mockOnChange}
      />,
    );

    const streetNameInput = screen.getByPlaceholderText("Street Name");
    fireEvent.change(streetNameInput, { target: { value: "New Street" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        address_components: expect.objectContaining({
          street_name: "New Street",
        }),
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

  // ... (keeping other tests unchanged until read-only)

  it("renders in read-only mode", () => {
    render(<SmartListingForm initialData={mockInitialData} readOnly={true} />);

    const streetInput = screen.getByDisplayValue("Test St");
    expect(streetInput).toBeDisabled();

    const agentInput = screen.getByDisplayValue("John Doe");
    expect(agentInput).toBeDisabled();
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
