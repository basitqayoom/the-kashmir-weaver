"use client";

import ErrorView from "@/components/ErrorView";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-ivory antialiased">
        <ErrorView
          status={500}
          message={error.message || undefined}
          reset={reset}
        />
      </body>
    </html>
  );
}
