"use client"

export default function NewsletterSignup() {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thank you for subscribing! (MVP placeholder)");
      }}
    >
      <input
        type="email"
        placeholder="Your email address"
        className="rounded-md px-3 py-2 border border-border bg-background flex-grow"
        required
      />
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 font-medium transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
} 