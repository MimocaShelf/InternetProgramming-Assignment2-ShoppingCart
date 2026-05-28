function matchesSearchTerms(text, terms) {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.every((term) => words.some((word) => word.startsWith(term)));
}

function formatPrice(value) {
    return value.toFixed(2);
}

function fetchFoods(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return fetch('/api/foods', { headers })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Unable to load food data');
            }
            return response.json();
        });
}

function checkoutCart(cart, token) {
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ cart }),
    }).then((response) => {
        if (!response.ok) {
            return response.json().then((data) => {
                throw new Error(data?.error || 'Unable to complete checkout');
            });
        }
        return response.json();
    });
}
