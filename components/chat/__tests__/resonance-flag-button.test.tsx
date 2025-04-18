import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ResonanceFlagButton } from "../resonance-flag-button"
import { vi } from "vitest"

// Mock fetch
global.fetch = vi.fn()

// Mock toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}))

describe("ResonanceFlagButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup fetch mock to return success
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "test-id" }),
    })
  })

  it("renders correctly", () => {
    render(
      <ResonanceFlagButton
        flaggedInteractionId="test-interaction"
        precedingInteractionId="prev-interaction"
        sessionId="test-session"
      />,
    )

    expect(screen.getByText("Flag")).toBeInTheDocument()
  })

  it("opens popover when clicked", async () => {
    render(
      <ResonanceFlagButton
        flaggedInteractionId="test-interaction"
        precedingInteractionId="prev-interaction"
        sessionId="test-session"
      />,
    )

    fireEvent.click(screen.getByText("Flag"))

    await waitFor(() => {
      expect(screen.getByText("What felt off about this response?")).toBeInTheDocument()
    })
  })

  it("submits with selected tags", async () => {
    render(
      <ResonanceFlagButton
        flaggedInteractionId="test-interaction"
        precedingInteractionId="prev-interaction"
        sessionId="test-session"
      />,
    )

    // Open popover
    fireEvent.click(screen.getByText("Flag"))

    // Select a tag
    await waitFor(() => {
      const checkbox = screen.getByLabelText("Tone wrong")
      fireEvent.click(checkbox)
    })

    // Submit
    fireEvent.click(screen.getByText("Submit Feedback"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/feedback/resonance-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "test-session",
          flaggedInteractionId: "test-interaction",
          precedingInteractionId: "prev-interaction",
          selectedTags: ["Tone wrong"],
        }),
      })
    })
  })

  it("submits without details when direct flag is clicked", async () => {
    render(
      <ResonanceFlagButton
        flaggedInteractionId="test-interaction"
        precedingInteractionId="prev-interaction"
        sessionId="test-session"
      />,
    )

    // Open popover
    fireEvent.click(screen.getByText("Flag"))

    // Click "flag without details"
    await waitFor(() => {
      fireEvent.click(screen.getByText("flag without details"))
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/feedback/resonance-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "test-session",
          flaggedInteractionId: "test-interaction",
          precedingInteractionId: "prev-interaction",
        }),
      })
    })
  })

  it("handles API errors gracefully", async () => {
    // Mock fetch to return error
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("API error"))

    render(
      <ResonanceFlagButton
        flaggedInteractionId="test-interaction"
        precedingInteractionId="prev-interaction"
        sessionId="test-session"
      />,
    )

    // Open popover
    fireEvent.click(screen.getByText("Flag"))

    // Submit
    fireEvent.click(screen.getByText("Submit Feedback"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      expect(screen.queryByText("Submitting...")).not.toBeInTheDocument()
    })
  })
})
