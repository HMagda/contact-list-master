import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import apiData from "./api";

jest.mock("./api");
const mockApiData = apiData as jest.MockedFunction<typeof apiData>;

const mockContacts = [
  {
    id: "1",
    firstNameLastName: "John Doe",
    jobTitle: "Developer",
    emailAddress: "john@example.com",
  },
  {
    id: "2",
    firstNameLastName: "Jane Smith",
    jobTitle: "Designer",
    emailAddress: "jane@example.com",
  },
  {
    id: "3",
    firstNameLastName: "Bob Wilson",
    jobTitle: "Manager",
    emailAddress: "bob@example.com",
  },
];

// Full batch of 10 contacts to trigger "Load More" button
const mockContactsFullBatch = [
  { id: "1", firstNameLastName: "John Doe", jobTitle: "Developer", emailAddress: "john@example.com" },
  { id: "2", firstNameLastName: "Jane Smith", jobTitle: "Designer", emailAddress: "jane@example.com" },
  { id: "3", firstNameLastName: "Bob Wilson", jobTitle: "Manager", emailAddress: "bob@example.com" },
  { id: "4", firstNameLastName: "Alice Brown", jobTitle: "Engineer", emailAddress: "alice@example.com" },
  { id: "5", firstNameLastName: "Charlie Davis", jobTitle: "Analyst", emailAddress: "charlie@example.com" },
  { id: "6", firstNameLastName: "Diana Evans", jobTitle: "HR", emailAddress: "diana@example.com" },
  { id: "7", firstNameLastName: "Edward Fox", jobTitle: "Sales", emailAddress: "edward@example.com" },
  { id: "8", firstNameLastName: "Fiona Green", jobTitle: "Marketing", emailAddress: "fiona@example.com" },
  { id: "9", firstNameLastName: "George Hill", jobTitle: "Support", emailAddress: "george@example.com" },
  { id: "10", firstNameLastName: "Hannah Ivy", jobTitle: "QA", emailAddress: "hannah@example.com" },
];

const mockContactsBatch2 = [
  {
    id: "11",
    firstNameLastName: "Ivan Jackson",
    jobTitle: "Engineer",
    emailAddress: "ivan@example.com",
  },
  {
    id: "12",
    firstNameLastName: "Julia King",
    jobTitle: "Analyst",
    emailAddress: "julia@example.com",
  },
];

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Load", () => {
    it("renders loading spinner initially", () => {
      mockApiData.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      expect(document.querySelector(".spinner")).toBeInTheDocument();
    });

    it("displays contacts after successful fetch", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    it("shows error state on failed fetch", async () => {
      mockApiData.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe("Load More", () => {
    it("shows Load More button after initial load with full batch", async () => {
      mockApiData.mockResolvedValueOnce(mockContactsFullBatch);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
    });

    it("loads additional contacts when clicking Load More", async () => {
      mockApiData
        .mockResolvedValueOnce(mockContactsFullBatch)
        .mockResolvedValueOnce(mockContactsBatch2);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole("button", { name: /load more/i });
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText("Ivan Jackson")).toBeInTheDocument();
      });

      expect(screen.getByText("Julia King")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("hides Load More button during loading", async () => {
      mockApiData.mockResolvedValueOnce(mockContactsFullBatch);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      mockApiData.mockImplementation(() => new Promise(() => {}));

      const loadMoreButton = screen.getByRole("button", { name: /load more/i });
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
      });
    });

    it("hides Load More button when less than 10 contacts returned", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts); // Only 3 contacts

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("selects contact on click and shows outline", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest(".person-info");
      expect(johnCard).not.toHaveClass("selected");

      fireEvent.click(johnCard!);

      expect(johnCard).toHaveClass("selected");
    });

    it("deselects contact on second click", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest(".person-info");

      fireEvent.click(johnCard!);
      expect(johnCard).toHaveClass("selected");

      fireEvent.click(johnCard!);
      expect(johnCard).not.toHaveClass("selected");
    });

    it("updates selected count correctly", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByText("Selected contacts: 0")).toBeInTheDocument();

      const johnCard = screen.getByText("John Doe").closest(".person-info");
      fireEvent.click(johnCard!);

      expect(screen.getByText("Selected contacts: 1")).toBeInTheDocument();

      const janeCard = screen.getByText("Jane Smith").closest(".person-info");
      fireEvent.click(janeCard!);

      expect(screen.getByText("Selected contacts: 2")).toBeInTheDocument();

      fireEvent.click(johnCard!);
      expect(screen.getByText("Selected contacts: 1")).toBeInTheDocument();
    });

    it("displays selected contacts at top of list", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const bobCard = screen.getByText("Bob Wilson").closest(".person-info");
      fireEvent.click(bobCard!);

      const personInfoCards = document.querySelectorAll(".person-info");
      const firstCardName = personInfoCards[0].querySelector(".firstNameLastName");

      expect(firstCardName?.textContent).toBe("Bob Wilson");
    });

    it("orders selected contacts by selection time (newest first)", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Select Bob first, then Jane
      const bobCard = screen.getByText("Bob Wilson").closest(".person-info");
      const janeCard = screen.getByText("Jane Smith").closest(".person-info");

      fireEvent.click(bobCard!);
      fireEvent.click(janeCard!);

      const personInfoCards = document.querySelectorAll(".person-info");
      const firstCardName = personInfoCards[0].querySelector(".firstNameLastName");
      const secondCardName = personInfoCards[1].querySelector(".firstNameLastName");

      // Jane was selected last, so she should be first
      expect(firstCardName?.textContent).toBe("Jane Smith");
      expect(secondCardName?.textContent).toBe("Bob Wilson");
    });
  });

  describe("Error Handling", () => {
    it("displays error message on fetch failure", async () => {
      mockApiData.mockRejectedValueOnce(new Error("Something went wrong"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockApiData.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });

    it("retry button triggers new fetch", async () => {
      mockApiData
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
    });

    it("clears error state on successful retry", async () => {
      mockApiData
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText("Network error")).not.toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe("Avatar", () => {
    it("displays correct initials in avatar", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByText("JD")).toBeInTheDocument();
      expect(screen.getByText("JS")).toBeInTheDocument();
      expect(screen.getByText("BW")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Main page heading
      expect(screen.getByRole("heading", { level: 1, name: /contact list/i })).toBeInTheDocument();
    });

    it("has accessible loading state", () => {
      mockApiData.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      const loader = screen.getByRole("status");
      expect(loader).toHaveAttribute("aria-label", "Loading contacts");
    });

    it("has accessible error state with alert role", async () => {
      mockApiData.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("contact cards have aria-selected attribute", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest('[role="option"]');
      expect(johnCard).toHaveAttribute("aria-selected", "false");

      fireEvent.click(johnCard!);
      expect(johnCard).toHaveAttribute("aria-selected", "true");
    });

    it("contact cards are keyboard navigable", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest('[role="option"]');
      expect(johnCard).toHaveAttribute("tabIndex", "0");
    });

    it("can select contact with Enter key", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest('[role="option"]') as HTMLElement;
      expect(johnCard).not.toHaveClass("selected");

      johnCard?.focus();
      fireEvent.keyDown(johnCard!, { key: "Enter" });

      expect(johnCard).toHaveClass("selected");
    });

    it("can select contact with Space key", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest('[role="option"]') as HTMLElement;
      expect(johnCard).not.toHaveClass("selected");

      johnCard?.focus();
      fireEvent.keyDown(johnCard!, { key: " " });

      expect(johnCard).toHaveClass("selected");
    });

    it("selected count has live region for screen readers", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const selectedCount = screen.getByText(/selected contacts/i);
      expect(selectedCount).toHaveAttribute("aria-live", "polite");
      expect(selectedCount).toHaveAttribute("aria-atomic", "true");
    });

    it("name element is tabbable with aria-label", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const nameElement = screen.getByText("John Doe");
      expect(nameElement).toHaveAttribute("tabIndex", "0");
      expect(nameElement).toHaveAttribute("aria-label", "Name: John Doe");
    });

    it("job title element is tabbable with aria-label", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const jobElement = screen.getByText("Developer");
      expect(jobElement).toHaveAttribute("tabIndex", "0");
      expect(jobElement).toHaveAttribute("aria-label", "Job title: Developer");
    });

    it("email link is tabbable with aria-label", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const emailLink = screen.getByText("john@example.com");
      expect(emailLink).toHaveAttribute("href", "mailto:john@example.com");
      expect(emailLink).toHaveAttribute("aria-label", "Email: john@example.com");
    });

    it("announces selection via aria-live region", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCard = screen.getByText("John Doe").closest('[role="option"]');
      fireEvent.click(johnCard!);

      // Check that the live region announces the selection
      await waitFor(() => {
        const liveRegions = document.querySelectorAll('[aria-live="polite"]');
        const announcements = Array.from(liveRegions).map(el => el.textContent);
        expect(announcements.some(text => text?.includes("John Doe selected"))).toBe(true);
      });
    });

    it("has main landmark", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("has skip link for keyboard navigation", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const skipLink = screen.getByRole("link", { name: /skip to contact list/i });
      expect(skipLink).toHaveAttribute("href", "#contact-list");
    });

    it("contact list has listbox role with multiselectable", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      expect(listbox).toHaveAttribute("aria-label", "Contact list, 3 contacts");
    });

    it("contact cards have role option", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("truncated text has title attribute for tooltip", async () => {
      mockApiData.mockResolvedValueOnce(mockContacts);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const nameElement = screen.getByText("John Doe");
      expect(nameElement).toHaveAttribute("title", "John Doe");

      const jobElement = screen.getByText("Developer");
      expect(jobElement).toHaveAttribute("title", "Developer");

      const emailElement = screen.getByText("john@example.com");
      expect(emailElement).toHaveAttribute("title", "john@example.com");
    });
  });
});
