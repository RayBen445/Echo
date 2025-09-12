from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/")

    # Click the "Continue with Phone" button
    page.get_by_role("button", name="Continue with Phone").click()

    # Enter the phone number
    page.get_by_placeholder("+1234567890").fill("+2348075614248")

    # Click the button to send the OTP
    page.get_by_role("button", name="Send OTP").click()

    # Wait for the OTP screen to appear
    page.wait_for_timeout(5000)

    page.screenshot(path="jules-scratch/verification/10-otp-screen-no-recaptcha.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
