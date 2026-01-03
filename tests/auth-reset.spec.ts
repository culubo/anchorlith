import { test, expect } from '@playwright/test'

test('reset password request includes correct redirect host', async ({ page, context }) => {
  await page.goto('/auth/forgot')

  // Capture the outgoing request to Supabase auth recover endpoint
  let captured: { url: string; postData: string | null } | null = null
  await page.route('**/auth/v1/recover', async (route) => {
    const req = route.request()
    captured = { url: req.url(), postData: await req.postData() }
    // Mock a successful response
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  })

  // Submit the form
  await page.fill('#email', 'test@example.com')
  await page.click('button:has-text("Send reset link")')

  // Wait for the route to be hit
  await page.waitForTimeout(250)

  expect(captured).not.toBeNull()
  const post = captured!.postData || ''

  // Ensure the request body contains the redirect path
  expect(post.includes('/auth/callback')).toBeTruthy()

  // Ensure the redirect host matches the current origin
  const origin = await page.evaluate(() => window.location.origin)
  expect(post.includes(origin)).toBeTruthy()
})