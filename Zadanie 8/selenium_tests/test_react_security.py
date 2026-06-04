import os
import time
from urllib.request import urlopen

import pytest
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


APP_URL = os.environ.get("APP_URL", "http://127.0.0.1:8080")
CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
]


def server_is_available(url, timeout=3):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urlopen(url, timeout=2) as response:
                if response.status < 500:
                    return True
        except Exception:
            time.sleep(0.5)
    return False


@pytest.fixture(scope="session", autouse=True)
def react_server():
    if not server_is_available(APP_URL):
        pytest.fail(
            f"Aplikacja nie odpowiada pod adresem {APP_URL}. "
            "Uruchom najpierw aplikacje poleceniem 'npm run dev'.",
            pytrace=False,
        )


@pytest.fixture
def driver():
    browser = create_driver()
    browser.set_window_size(1366, 900)
    browser.get(APP_URL)
    browser.execute_script("localStorage.clear(); sessionStorage.clear();")
    browser.get(APP_URL)
    yield browser
    browser.quit()


def create_driver():
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1366,900")

    chrome_binary = next((path for path in CHROME_PATHS if os.path.exists(path)), None)
    if chrome_binary:
        chrome_options.binary_location = chrome_binary

    try:
        return webdriver.Chrome(options=chrome_options)
    except WebDriverException:
        edge_options = EdgeOptions()
        edge_options.add_argument("--headless=new")
        edge_options.add_argument("--disable-gpu")
        edge_options.add_argument("--window-size=1366,900")
        return webdriver.Edge(options=edge_options)


def by_test_id(test_id):
    return (By.CSS_SELECTOR, f'[data-testid="{test_id}"]')


def wait_element(driver, test_id):
    return WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(by_test_id(test_id))
    )


def click_nav(driver, label):
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, f"//button[contains(., '{label}')]"))
    ).click()


def click(driver, test_id):
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(by_test_id(test_id))
    ).click()


def fill(driver, test_id, value):
    element = wait_element(driver, test_id)
    element.clear()
    element.send_keys(value)


def wait_text(driver, test_id, text):
    return WebDriverWait(driver, 10).until(
        EC.text_to_be_present_in_element(by_test_id(test_id), text)
    )


def register_user(driver, name="Jan Testowy", email="jan@example.com", password="secret1"):
    fill(driver, "register-name", name)
    fill(driver, "register-email", email)
    fill(driver, "register-password", password)
    click(driver, "register-submit")
    wait_text(driver, "registration-result", "Zarejestrowano")


def login_user(driver, email="jan@example.com", password="secret1"):
    click_nav(driver, "Logowanie")
    fill(driver, "login-email", email)
    fill(driver, "login-password", password)
    click(driver, "login-submit")
    wait_text(driver, "session-status", email)


def test_registration_validates_required_fields_and_invalid_email(driver):
    click(driver, "register-submit")

    assert wait_text(driver, "error-name", "Imie jest wymagane.")
    assert wait_text(driver, "error-email", "Email jest wymagany.")
    assert wait_text(driver, "error-password", "Haslo jest wymagane.")

    fill(driver, "register-name", "Anna")
    fill(driver, "register-email", "niepoprawny-email")
    fill(driver, "register-password", "secret1")
    click(driver, "register-submit")

    assert wait_text(driver, "error-email", "Niepoprawny format adresu e-mail.")


def test_react_escapes_xss_payload_during_registration(driver):
    payload = "<script>window.__xssExecuted = true</script>"

    fill(driver, "register-name", payload)
    fill(driver, "register-email", "xss@example.com")
    fill(driver, "register-password", "secret1")
    click(driver, "register-submit")

    result = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(by_test_id("registered-name"))
    )
    assert result.text == payload
    assert driver.execute_script("return window.__xssExecuted === true") is False


def test_cart_state_is_consistent_between_two_tabs(driver):
    click_nav(driver, "Koszyk")
    click(driver, "cart-clear")
    click(driver, "add-book")
    wait_text(driver, "cart-summary-count", "1")
    wait_text(driver, "cart-item-name-book", "Podrecznik React")
    wait_text(driver, "cart-item-quantity-book", "1")
    wait_text(driver, "cart-item-total-book", "89 zl")

    driver.execute_script(f"window.open('{APP_URL}', '_blank')")
    driver.switch_to.window(driver.window_handles[1])
    click_nav(driver, "Koszyk")
    wait_text(driver, "cart-summary-count", "1")
    wait_text(driver, "cart-item-name-book", "Podrecznik React")

    click(driver, "add-course")
    wait_text(driver, "cart-summary-count", "2")
    wait_text(driver, "cart-item-name-course", "Kurs Selenium")
    wait_text(driver, "cart-item-total-course", "129 zl")

    driver.switch_to.window(driver.window_handles[0])
    wait_text(driver, "cart-summary-count", "2")
    assert driver.find_element(*by_test_id("cart-total")).text == "218"


def test_logout_in_second_tab_synchronizes_session_and_cart_context(driver):
    register_user(driver)
    login_user(driver)

    click_nav(driver, "Koszyk")
    click(driver, "cart-clear")
    click(driver, "add-book")
    wait_text(driver, "cart-summary-count", "1")

    driver.execute_script(f"window.open('{APP_URL}', '_blank')")
    driver.switch_to.window(driver.window_handles[1])
    wait_text(driver, "session-status", "jan@example.com")
    click_nav(driver, "Ustawienia")
    click(driver, "logout-button")
    wait_text(driver, "session-status", "brak")

    driver.switch_to.window(driver.window_handles[0])
    wait_text(driver, "session-status", "brak")
    click_nav(driver, "Koszyk")
    wait_text(driver, "cart-summary-count", "0")

    click(driver, "add-course")
    wait_text(driver, "cart-summary-count", "1")

    driver.switch_to.window(driver.window_handles[1])
    click_nav(driver, "Koszyk")
    wait_text(driver, "session-status", "brak")
    wait_text(driver, "cart-summary-count", "1")


def test_csrf_attack_link_cannot_change_account_settings_in_second_tab(driver):
    register_user(driver)
    login_user(driver)

    fill(driver, "settings-display-name", "Bezpieczny Jan")
    Select(driver.find_element(*by_test_id("settings-theme"))).select_by_value("contrast")
    click(driver, "settings-save")

    attack_url = (
        f"{APP_URL}?forceDisplayName=PrzejeteKonto"
        "&forceTheme=dark&forceNewsletter=true&csrf=spreparowany-link"
    )
    driver.execute_script(f"window.open('{attack_url}', '_blank')")
    driver.switch_to.window(driver.window_handles[1])

    wait_element(driver, "settings-display-name")

    driver.switch_to.window(driver.window_handles[0])
    driver.refresh()
    wait_text(driver, "session-status", "jan@example.com")
    click_nav(driver, "Ustawienia")

    display_name = driver.find_element(*by_test_id("settings-display-name")).get_attribute("value")
    selected_theme = Select(driver.find_element(*by_test_id("settings-theme"))).first_selected_option.get_attribute("value")

    assert display_name == "Bezpieczny Jan"
    assert selected_theme == "contrast"
