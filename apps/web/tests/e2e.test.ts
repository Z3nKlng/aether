import { test, expect } from '@playwright/test';

test.describe('Aether Frontend E2E', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aether/);
    await expect(page.locator('text=Autonomous AI Agent')).toBeVisible();
  });

  test('should allow user to login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new project', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=New Project');
    await page.fill('input[name="name"]', 'E2E Test Project');
    await page.click('button:has-text("Create")');
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('should trigger a deployment and view logs', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=E2E Test Project');
    await page.click('button:has-text("Deploy")');
    await expect(page.locator('text=QUEUED')).toBeVisible();
    
    // Wait for building status (simulated in UI)
    await expect(page.locator('text=BUILDING')).toBeVisible({ timeout: 10000 });
    
    // View logs
    await page.click('button:has-text("View Logs")');
    await expect(page.locator('text=Starting build process')).toBeVisible();
  });
});
