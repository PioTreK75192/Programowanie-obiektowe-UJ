import { useEffect, useMemo, useRef, useState } from 'react';

const USERS_KEY = 'zad8_users';
const AUTH_KEY = 'zad8_active_user';
const CART_KEY_PREFIX = 'zad8_cart';
const SETTINGS_KEY = 'zad8_account_settings';
const CSRF_KEY = 'zad8_csrf_token';

const products = [
  { id: 'book', name: 'Podrecznik React', price: 89 },
  { id: 'course', name: 'Kurs Selenium', price: 129 },
  { id: 'audit', name: 'Audyt bezpieczenstwa', price: 199 },
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createToken() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cartKeyFor(user) {
  return `${CART_KEY_PREFIX}:${user?.email || 'guest'}`;
}

function getCart(user) {
  return readJson(cartKeyFor(user), []);
}

function saveCart(user, nextCart) {
  writeJson(cartKeyFor(user), nextCart);
  window.dispatchEvent(new Event('zad8-cart-updated'));
}

function getSettings() {
  return readJson(SETTINGS_KEY, {});
}

function getForcedSettingsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('forceDisplayName') && !params.has('forceTheme')) {
    return null;
  }

  return {
    displayName: params.get('forceDisplayName'),
    newsletter: params.get('forceNewsletter') === 'true',
    theme: params.get('forceTheme'),
    token: params.get('csrf') || '',
  };
}

function App() {
  const [activeView, setActiveView] = useState('register');
  const [users, setUsers] = useState(() => readJson(USERS_KEY, []));
  const [activeUser, setActiveUser] = useState(() => readJson(AUTH_KEY, null));
  const [csrfToken, setCsrfToken] = useState(() => sessionStorage.getItem(CSRF_KEY) || '');
  const [cart, setCart] = useState(() => getCart(readJson(AUTH_KEY, null)));
  const [registrationErrors, setRegistrationErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [lastRegistered, setLastRegistered] = useState(null);
  const [forcedSettings] = useState(getForcedSettingsFromUrl);
  const forcedSettingsApplied = useRef(false);
  const [settingsForm, setSettingsForm] = useState({
    displayName: '',
    newsletter: false,
    theme: 'light',
  });

  const activeSettings = useMemo(() => {
    if (!activeUser) {
      return null;
    }
    const settings = getSettings();
    return settings[activeUser.email] || {
      displayName: activeUser.name,
      newsletter: false,
      theme: 'light',
    };
  }, [activeUser]);

  useEffect(() => {
    const currentCartKey = cartKeyFor(activeUser);
    const syncCart = (event) => {
      if (event.type === 'storage' && event.key && event.key !== currentCartKey) {
        return;
      }
      setCart(getCart(activeUser));
    };

    setCart(getCart(activeUser));
    window.addEventListener('storage', syncCart);
    window.addEventListener('zad8-cart-updated', syncCart);
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('zad8-cart-updated', syncCart);
    };
  }, [activeUser]);

  useEffect(() => {
    const syncAuth = (event) => {
      if (event.type === 'storage' && event.key !== AUTH_KEY) {
        return;
      }

      const nextUser = readJson(AUTH_KEY, null);
      setActiveUser(nextUser);

      if (!nextUser) {
        sessionStorage.removeItem(CSRF_KEY);
        setCsrfToken('');
        setActiveView((view) => (view === 'settings' ? 'login' : view));
      }
    };

    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
    };
  }, [setActiveUser, setCsrfToken, setActiveView]);

  useEffect(() => {
    if (activeSettings) {
      setSettingsForm(activeSettings);
    }
  }, [activeSettings]);

  useEffect(() => {
    if (!forcedSettings || forcedSettingsApplied.current) {
      return;
    }
    forcedSettingsApplied.current = true;

    const requestedUpdate = {
      displayName: forcedSettings.displayName || settingsForm.displayName,
      newsletter: forcedSettings.newsletter,
      theme: forcedSettings.theme || settingsForm.theme,
    };

    updateSettings(requestedUpdate, forcedSettings.token);
    setActiveView('settings');
  }, [forcedSettings, settingsForm.displayName, settingsForm.theme]);

  function validateRegistration(formData) {
    const errors = {};
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');

    if (!name) {
      errors.name = 'Imie jest wymagane.';
    }
    if (!email) {
      errors.email = 'Email jest wymagany.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Niepoprawny format adresu e-mail.';
    }
    if (!password) {
      errors.password = 'Haslo jest wymagane.';
    } else if (password.length < 6) {
      errors.password = 'Haslo musi miec co najmniej 6 znakow.';
    }

    return { errors, values: { name, email, password } };
  }

  function handleRegister(event) {
    event.preventDefault();
    const { errors, values } = validateRegistration(new FormData(event.currentTarget));
    setRegistrationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const nextUsers = [
      ...users.filter((user) => user.email !== values.email),
      values,
    ];
    setUsers(nextUsers);
    writeJson(USERS_KEY, nextUsers);
    setLastRegistered({ name: values.name, email: values.email });
    event.currentTarget.reset();
  }

  function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('loginEmail').trim();
    const password = formData.get('loginPassword');
    const found = users.find((user) => user.email === email && user.password === password);

    if (!found) {
      setLoginError('Nieprawidlowy email lub haslo.');
      return;
    }

    const token = createToken();
    sessionStorage.setItem(CSRF_KEY, token);
    setCsrfToken(token);
    setActiveUser({ email: found.email, name: found.name });
    writeJson(AUTH_KEY, { email: found.email, name: found.name });
    setLoginError('');
    setActiveView('settings');
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(CSRF_KEY);
    setActiveUser(null);
    setCsrfToken('');
    setCart(getCart(null));
    setActiveView('login');
  }

  function updateSettings(nextSettings, token) {
    const sessionUser = readJson(AUTH_KEY, null);
    const expectedToken = sessionStorage.getItem(CSRF_KEY) || csrfToken;

    if (!sessionUser || token !== expectedToken || !token) {
      return false;
    }

    const allSettings = getSettings();
    allSettings[sessionUser.email] = nextSettings;
    writeJson(SETTINGS_KEY, allSettings);
    setSettingsForm(nextSettings);
    return true;
  }

  function handleSettingsSave(event) {
    event.preventDefault();
    const nextSettings = {
      displayName: settingsForm.displayName.trim(),
      newsletter: settingsForm.newsletter,
      theme: settingsForm.theme,
    };
    updateSettings(nextSettings, csrfToken);
  }

  function addToCart(product) {
    const currentCart = getCart(activeUser);
    const existing = currentCart.find((item) => item.id === product.id);
    const nextCart = existing
      ? currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...currentCart, { ...product, quantity: 1 }];
    saveCart(activeUser, nextCart);
  }

  function clearCart() {
    saveCart(activeUser, []);
  }

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <span className="navbar-brand">Zadanie 8</span>
          <div className="navbar-nav flex-row gap-2">
            <button className="btn btn-sm btn-outline-light" onClick={() => setActiveView('register')}>
              Rejestracja
            </button>
            <button className="btn btn-sm btn-outline-light" onClick={() => setActiveView('login')}>
              Logowanie
            </button>
            <button className="btn btn-sm btn-outline-light" onClick={() => setActiveView('cart')}>
              Koszyk <span data-testid="cart-count">{cartQuantity}</span>
            </button>
            <button className="btn btn-sm btn-outline-light" onClick={() => setActiveView('settings')}>
              Ustawienia
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="row g-4">
          <section className="col-lg-7">
            {activeView === 'register' && (
              <div className="content-panel">
                <h1 className="h3 mb-4">Rejestracja uzytkownika</h1>
                <form onSubmit={handleRegister} noValidate data-testid="registration-form">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="name">
                      Imie
                    </label>
                    <input className="form-control" id="name" name="name" data-testid="register-name" />
                    {registrationErrors.name && (
                      <div className="text-danger mt-1" data-testid="error-name">
                        {registrationErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input className="form-control" id="email" name="email" data-testid="register-email" />
                    {registrationErrors.email && (
                      <div className="text-danger mt-1" data-testid="error-email">
                        {registrationErrors.email}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="password">
                      Haslo
                    </label>
                    <input
                      className="form-control"
                      id="password"
                      name="password"
                      type="password"
                      data-testid="register-password"
                    />
                    {registrationErrors.password && (
                      <div className="text-danger mt-1" data-testid="error-password">
                        {registrationErrors.password}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary" type="submit" data-testid="register-submit">
                    Zarejestruj
                  </button>
                </form>
                {lastRegistered && (
                  <div className="alert alert-success mt-4" data-testid="registration-result">
                    Zarejestrowano uzytkownika:{' '}
                    <strong data-testid="registered-name">{lastRegistered.name}</strong>
                  </div>
                )}
              </div>
            )}

            {activeView === 'login' && (
              <div className="content-panel">
                <h1 className="h3 mb-4">Logowanie</h1>
                <form onSubmit={handleLogin} data-testid="login-form">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="loginEmail">
                      Email
                    </label>
                    <input className="form-control" id="loginEmail" name="loginEmail" data-testid="login-email" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="loginPassword">
                      Haslo
                    </label>
                    <input
                      className="form-control"
                      id="loginPassword"
                      name="loginPassword"
                      type="password"
                      data-testid="login-password"
                    />
                  </div>
                  {loginError && (
                    <div className="alert alert-danger" data-testid="login-error">
                      {loginError}
                    </div>
                  )}
                  <button className="btn btn-primary" type="submit" data-testid="login-submit">
                    Zaloguj
                  </button>
                </form>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="content-panel">
                <h1 className="h3 mb-4">Ustawienia konta</h1>
                {!activeUser ? (
                  <div className="alert alert-warning" data-testid="settings-guest">
                    Zaloguj sie, aby zmienic ustawienia konta.
                  </div>
                ) : (
                  <form onSubmit={handleSettingsSave} data-testid="settings-form">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="displayName">
                        Nazwa wyswietlana
                      </label>
                      <input
                        className="form-control"
                        id="displayName"
                        name="displayName"
                        data-testid="settings-display-name"
                        value={settingsForm.displayName}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, displayName: event.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="theme">
                        Motyw
                      </label>
                      <select
                        className="form-select"
                        id="theme"
                        name="theme"
                        data-testid="settings-theme"
                        value={settingsForm.theme}
                        onChange={(event) => setSettingsForm({ ...settingsForm, theme: event.target.value })}
                      >
                        <option value="light">Jasny</option>
                        <option value="dark">Ciemny</option>
                        <option value="contrast">Kontrastowy</option>
                      </select>
                    </div>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        id="newsletter"
                        name="newsletter"
                        type="checkbox"
                        data-testid="settings-newsletter"
                        checked={settingsForm.newsletter}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, newsletter: event.target.checked })
                        }
                      />
                      <label className="form-check-label" htmlFor="newsletter">
                        Newsletter
                      </label>
                    </div>
                    <input type="hidden" name="csrf" value={csrfToken} data-testid="csrf-token" />
                    <button className="btn btn-success me-2" type="submit" data-testid="settings-save">
                      Zapisz ustawienia
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleLogout}
                      data-testid="logout-button"
                    >
                      Wyloguj
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeView === 'cart' && (
              <div className="content-panel">
                <h1 className="h3 mb-4">Koszyk zakupowy</h1>
                <div className="product-grid mb-4">
                  {products.map((product) => (
                    <article className="product-card" key={product.id}>
                      <h2 className="h5">{product.name}</h2>
                      <p className="mb-3">{product.price} zl</p>
                      <button
                        className="btn btn-primary"
                        data-testid={`add-${product.id}`}
                        onClick={() => addToCart(product)}
                      >
                        Dodaj do koszyka
                      </button>
                    </article>
                  ))}
                </div>
                <div className="cart-summary">
                  {cart.length === 0 ? (
                    <p className="mb-3" data-testid="cart-empty">
                      Koszyk jest pusty.
                    </p>
                  ) : (
                    <div className="table-responsive mb-3">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th scope="col">Produkt</th>
                            <th scope="col" className="text-end">
                              Cena
                            </th>
                            <th scope="col" className="text-end">
                              Ilosc
                            </th>
                            <th scope="col" className="text-end">
                              Suma
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.id} data-testid={`cart-item-${item.id}`}>
                              <td data-testid={`cart-item-name-${item.id}`}>{item.name}</td>
                              <td className="text-end">{item.price} zl</td>
                              <td className="text-end" data-testid={`cart-item-quantity-${item.id}`}>
                                {item.quantity}
                              </td>
                              <td className="text-end" data-testid={`cart-item-total-${item.id}`}>
                                {item.price * item.quantity} zl
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="mb-1">
                    Liczba produktow: <strong data-testid="cart-summary-count">{cartQuantity}</strong>
                  </p>
                  <p className="mb-3">
                    Wartosc zamowienia: <strong data-testid="cart-total">{cartTotal}</strong> zl
                  </p>
                  <button className="btn btn-outline-danger btn-sm" onClick={clearCart} data-testid="cart-clear">
                    Wyczysc koszyk
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="col-lg-5">
            <div className="content-panel">
              <h2 className="h4">Stan aplikacji</h2>
              <p className="mb-1">
                Sesja:{' '}
                <strong data-testid="session-status">
                  {activeUser ? `aktywny uzytkownik ${activeUser.email}` : 'brak'}
                </strong>
              </p>
              <p className="mb-1">
                Elementy koszyka: <strong data-testid="cart-count-side">{cartQuantity}</strong>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
