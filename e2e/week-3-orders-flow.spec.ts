import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const screenshotDir = path.resolve(
  process.cwd(),
  "output/playwright/session-17-r1"
);

test.describe("Week 3 Orders Flow E2E", () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotDir, { recursive: true });
  });

  test("full orders flow: login, filter, view detail, update status, and verify in list", async ({
    page,
  }) => {
    // 1. Navigate to /login
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "01-login-page.png"),
    });

    // 2. Fill login credentials (staff role)
    await page.getByLabel(/Email/i).fill("staff@orderhub.test");
    await page.getByLabel(/Password/i).fill("password123");

    // 3. Submit and wait for redirect to /orders
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.waitForURL("**/orders");
    await expect(
      page.getByRole("heading", { name: /Orders/i, level: 1 })
    ).toBeVisible();

    // 4. On /orders, filter by Status = Pending
    const statusSelect = page.getByLabel(/Status/i);
    await statusSelect.selectOption("pending");

    // Wait for the URL or table to reflect the filter
    await page.waitForURL(/status=pending/);
    const orderLink = page.getByRole("link", { name: "ORD-2026-002" });
    await expect(orderLink).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "02-filtered-orders.png"),
    });

    // 5. Click into order detail ORD-2026-002
    await orderLink.click();
    await page.waitForURL("**/orders/ord_002");
    await expect(
      page.getByRole("heading", { name: "ORD-2026-002", level: 1 })
    ).toBeVisible();

    // 6. Verify current status is Pending
    await expect(page.getByText(/Current:/i)).toBeVisible();
    await expect(page.getByText(/Pending/i).first()).toBeVisible();
    await page.screenshot({
      path: path.join(screenshotDir, "03-order-detail-before.png"),
    });

    // 7. Change status to Processing
    const nextStatusSelect = page.getByLabel(/Next Status/i);
    await nextStatusSelect.selectOption("processing");

    const updateButton = page.getByRole("button", { name: /Update status/i });
    await expect(updateButton).toBeEnabled();
    await updateButton.click();

    // 8. Verify success toast appears and status updates to Processing
    const successToast = page.getByText(/Order status updated to processing/i);
    await expect(successToast).toBeVisible();

    // Verify timeline entry shows status change
    await expect(
      page.getByText("Status changed from Pending to Processing")
    ).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, "04-order-detail-after.png"),
    });

    // 9. Navigate back to /orders
    const backLink = page.getByRole("link", { name: /Back to orders/i });
    await backLink.click();
    await page.waitForURL("**/orders");

    // 10. Verify that the table now reflects the updated status for ORD-2026-002
    const row = page.getByRole("row", { name: /ORD-2026-002/i });
    await expect(row).toBeVisible();
    await expect(row).toContainText(/Processing/i);
    await page.screenshot({
      path: path.join(screenshotDir, "05-orders-list-updated.png"),
    });
  });
});
