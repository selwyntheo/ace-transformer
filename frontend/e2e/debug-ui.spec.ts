import { test, expect } from '@playwright/test'

test.describe('Debug UI - Find Available Elements', () => {
  test('Find all buttons on page', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Print page title
    const title = await page.title()
    console.log('Page title:', title)
    
    // Print page URL
    console.log('Page URL:', page.url())
    
    // Find all buttons
    const buttons = await page.locator('button').all()
    console.log(`Found ${buttons.length} buttons`)
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      const isVisible = await buttons[i].isVisible()
      console.log(`Button ${i}: "${text}" - Visible: ${isVisible}`)
    }
    
    // Try clicking "Quick Transform" if it exists
    const quickTransform = page.getByRole('button', { name: /quick transform/i })
    if (await quickTransform.isVisible()) {
      console.log('Found Quick Transform button, clicking...')
      await quickTransform.click()
      await page.waitForTimeout(1000)
      
      // Check buttons again after navigation
      const buttonsAfter = await page.locator('button').all()
      console.log(`\nAfter navigation, found ${buttonsAfter.length} buttons`)
      
      for (let i = 0; i < buttonsAfter.length; i++) {
        const text = await buttonsAfter[i].textContent()
        const isVisible = await buttonsAfter[i].isVisible()
        console.log(`Button ${i}: "${text}" - Visible: ${isVisible}`)
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-page.png', fullPage: true })
    console.log('\nScreenshot saved as debug-page.png')
  })
})
