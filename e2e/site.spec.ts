import { expect, test } from "@playwright/test";

const ORDER_URL = "https://lakewoodvillagetavern.hrpos.heartland.us/menu";

test.beforeEach(async ({ context }) => {
  // Stand-in for Heartland so tests never touch the real ordering system.
  await context.route("https://lakewoodvillagetavern.hrpos.heartland.us/**", (r) =>
    r.fulfill({ status: 200, contentType: "text/html", body: "<title>Heartland stub</title>" }),
  );
});

test("every Order Online button points at Heartland and opens a new tab", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("[data-order]");
  const where = await links.evaluateAll((els) => els.map((e) => e.getAttribute("data-order")));
  expect(where.sort()).toEqual(["footer", "header", "hero", "menu", "mobile_menu", "pickup_band", "specials", "sticky_mobile"].sort());
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute("href", ORDER_URL);
    await expect(a).toHaveAttribute("target", "_blank");
    await expect(a).toHaveAttribute("rel", "noopener");
  }
});

test("clicking Order Online sends one tracked click and opens Heartland", async ({ page, context, isMobile }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { clicks: unknown[] }).clicks = [];
    window.addEventListener("lvt:order-click", (e) => (window as unknown as { clicks: unknown[] }).clicks.push((e as CustomEvent).detail));
  });
  const btn = page.locator(isMobile ? '[data-order="sticky_mobile"]' : '[data-order="header"]');
  const [tab] = await Promise.all([context.waitForEvent("page"), btn.click()]);
  await tab.waitForLoadState();
  expect(tab.url()).toBe(ORDER_URL);
  const clicks = await page.evaluate(() => (window as unknown as { clicks: unknown[] }).clicks);
  expect(clicks).toEqual([{ button_location: isMobile ? "sticky_mobile" : "header", link_url: ORDER_URL, outbound: true }]);
});

test("homepage shows today's special and the next events", async ({ page }) => {
  await page.goto("/");
  const board = page.locator(".chalk:has(ul)");
  await expect(board.locator("h2")).toHaveText("Today's Specials");
  await expect(board.locator("li b").first()).not.toBeEmpty();
  await page.getByRole("button", { name: "Today" }).waitFor();
  const before = await board.locator("li b").first().textContent();
  // Retry the tap until the board has hydrated and responds.
  await expect(async () => {
    await page.locator(".week button").nth(1).click();
    await expect(board.locator("h2")).not.toHaveText("Today's Specials", { timeout: 500 });
  }).toPass();
  expect(await board.locator("li b").first().textContent()).not.toBe(before);
  const events = page.locator("#events .ev");
  await expect(events).toHaveCount(3);
  await expect(page.locator("#events")).not.toContainText("Test Ended");
});

test("no sideways scrolling and every image has alt text", async ({ page }) => {
  for (const path of ["/", "/menu", "/events", "/events?view=month", "/events/test-bingo"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
    expect(await page.locator("img:not([alt])").count(), path).toBe(0);
  }
});

test("phone menu opens and holds an Order Online button", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/");
  await expect(page.locator('[data-order="mobile_menu"]')).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator('[data-order="mobile_menu"]')).toBeVisible();
  await expect(page.locator('[data-order="sticky_mobile"]')).toBeVisible();
});

test("events list, filters, month view and event page", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("link", { name: "Test Bingo" }).first()).toBeVisible();
  await expect(page.getByText("Test Ended")).toHaveCount(0);
  await page.getByRole("link", { name: "Live entertainment" }).click();
  await expect(page).toHaveURL(/type=music/);
  await expect(page.getByRole("link", { name: "Test Bingo" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Test Band" })).toBeVisible();
  await page.goto("/events?view=month");
  await expect(page.locator(".month .today")).toHaveCount(1);
  await page.goto("/events/test-music");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test Band");
  await expect(page.getByRole("link", { name: "Sign up / Tickets" })).toHaveAttribute("href", "https://example.com/tickets");
  await expect(page.getByText(/AM$/)).toBeVisible(); // ends 1 AM, past midnight
  await expect(page.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", /facebook\.com\/sharer/);
  await page.goto("/events/test-bingo");
  await expect(page.getByText("Every Sun")).toBeVisible();
  await page.goto("/events/test-past");
  await expect(page.getByText("This event has ended.")).toBeVisible();
  // The page shell streams first, so a missing event shows the not-found page with noindex rather than a 404 status.
  await page.goto("/events/nope");
  await expect(page.getByText("This page could not be found")).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", "noindex");
});

test("menu page lists the menu with prices", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByRole("heading", { name: "Village Idiot" })).toBeVisible();
  await expect(page.locator(".menu-item", { hasText: "Village Idiot" })).toContainText("$13");
  await expect(page.locator('[data-order="menu_page"]')).toHaveAttribute("href", ORDER_URL);
});
