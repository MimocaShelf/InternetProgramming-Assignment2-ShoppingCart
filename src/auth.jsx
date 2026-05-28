const { useState } = React;

function AuthPage({ onLogin, onRegister }) {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    const handleToggleMode = () => {
        setMode((prev) => (prev === 'login' ? 'register' : 'login'));
        resetForm();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Please enter both a username and a password.');
            return;
        }

        if (mode === 'register' && password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        const payload = { username: username.trim(), password };
        const endpoint = mode === 'login' ? '/api/login' : '/api/register';

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (response) => {
                const text = await response.text();
                let data = {};

                try {
                    data = text ? JSON.parse(text) : {};
                } catch (parseError) {
                    throw new Error(response.ok ? 'Unexpected server response.' : 'Unable to authenticate.');
                }

                if (!response.ok) {
                    throw new Error(data?.error || 'Unable to authenticate.');
                }

                return data;
            })
            .then((data) => {
                onLogin(data.username, data.token, data.isAdmin);
            })
            .catch((fetchError) => {
                setError(fetchError.message);
            });
    };

    return (
        <div className="auth-page">
            <header role="banner">
                <div className="header-brand">
                    <h2>
                        <img src="photos/icon.png" alt="Sweet Bakery icon" className="site-icon" /> Sweet Bakery
                    </h2>
                </div>
            </header>

            <div className="auth-panel">
                <div className="auth-heading">
                    <img src="photos/icon.png" alt="Sweet Bakery icon" className="auth-icon" />
                    <div>
                        <h1>Sweet Bakery</h1>
                        <p>{mode === 'login' ? 'Sign in to continue shopping' : 'Register a new account'}</p>
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Username
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </label>

                    {mode === 'register' && (
                        <label>
                            Confirm Password
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                            />
                        </label>
                    )}

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-submit" type="submit">
                        {mode === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>

                <button className="auth-switch" type="button" onClick={handleToggleMode}>
                    {mode === 'login' ? 'Create a new account' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
}
