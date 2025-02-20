import { test, expect } from "@playwright/test";

test("Check page title from API", async ({ request }) => {
  const response = await request.get(
    "http://localhost:3000/scrape?url=https://example.com"
  );
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.title).toContain("Example Domain");
});
