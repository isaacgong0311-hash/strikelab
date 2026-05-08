"""
StrikeLab Pricing Engine
========================
Black-Scholes options pricing, the Greeks, and binomial tree model.

Parameters used throughout:
  S     = current stock price
  K     = strike price
  T     = time to expiry in years (e.g. 0.25 = 3 months)
  r     = risk-free rate (e.g. 0.05 = 5%)
  sigma = volatility (e.g. 0.20 = 20%)
"""

import math


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))


def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma * math.sqrt(T)


def _norm_cdf(x):
    """Standard normal CDF via math.erfc for pure-Python compatibility."""
    return 0.5 * math.erfc(-x / math.sqrt(2))


def _norm_pdf(x):
    return math.exp(-0.5 * x ** 2) / math.sqrt(2 * math.pi)


# ---------------------------------------------------------------------------
# Black-Scholes prices
# ---------------------------------------------------------------------------

def black_scholes_call(S, K, T, r, sigma):
    """
    Price a European call option using Black-Scholes.

    Returns the fair value of the call.
    """
    if T <= 0:
        return max(S - K, 0.0)
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)


def black_scholes_put(S, K, T, r, sigma):
    """
    Price a European put option using Black-Scholes.

    Returns the fair value of the put.
    """
    if T <= 0:
        return max(K - S, 0.0)
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return K * math.exp(-r * T) * _norm_cdf(-d2) - S * _norm_cdf(-d1)


# ---------------------------------------------------------------------------
# The Greeks
# ---------------------------------------------------------------------------

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """
    Delta: rate of change of option price with respect to S.

    Call delta is between 0 and 1.
    Put delta is between -1 and 0.

    EXERCISE: implement this function.
    Hint: call delta = N(d1), put delta = N(d1) - 1
    """
    # --- YOUR CODE HERE ---
    raise NotImplementedError("compute_delta is not implemented yet")
    # ----------------------


def compute_gamma(S, K, T, r, sigma):
    """
    Gamma: rate of change of delta with respect to S (same for calls and puts).

    Gamma = n(d1) / (S * sigma * sqrt(T))
    where n() is the standard normal PDF.
    """
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    return _norm_pdf(d1) / (S * sigma * math.sqrt(T))


def compute_theta(S, K, T, r, sigma, option_type="call"):
    """
    Theta: rate of change of option price with respect to time (time decay).

    Theta is almost always negative — the option loses value as time passes.
    Returned as change per calendar day (divide annualised value by 365).

    EXERCISE: implement this function.
    Hint:
      theta_call = (-S*n(d1)*sigma/(2*sqrt(T))) - r*K*exp(-rT)*N(d2)
      theta_put  = (-S*n(d1)*sigma/(2*sqrt(T))) + r*K*exp(-rT)*N(-d2)
    """
    # --- YOUR CODE HERE ---
    raise NotImplementedError("compute_theta is not implemented yet")
    # ----------------------


def compute_vega(S, K, T, r, sigma):
    """
    Vega: sensitivity of option price to a 1-point change in implied volatility.

    Vega = S * n(d1) * sqrt(T)
    Same for calls and puts.
    Returned as change per 1% move in vol (divide by 100).
    """
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    return S * _norm_pdf(d1) * math.sqrt(T) / 100.0


def compute_rho(S, K, T, r, sigma, option_type="call"):
    """
    Rho: sensitivity of option price to a change in the risk-free rate.

    call rho = K * T * exp(-rT) * N(d2)
    put  rho = -K * T * exp(-rT) * N(-d2)
    """
    if T <= 0:
        return 0.0
    d2 = _d2(S, K, T, r, sigma)
    if option_type == "call":
        return K * T * math.exp(-r * T) * _norm_cdf(d2) / 100.0
    else:
        return -K * T * math.exp(-r * T) * _norm_cdf(-d2) / 100.0


def all_greeks(S, K, T, r, sigma, option_type="call"):
    """Return all Greeks as a dict."""
    return {
        "delta": compute_delta(S, K, T, r, sigma, option_type),
        "gamma": compute_gamma(S, K, T, r, sigma),
        "theta": compute_theta(S, K, T, r, sigma, option_type),
        "vega":  compute_vega(S, K, T, r, sigma),
        "rho":   compute_rho(S, K, T, r, sigma, option_type),
    }


# ---------------------------------------------------------------------------
# Binomial tree model
# ---------------------------------------------------------------------------

def binomial_price(S, K, T, r, sigma, N=100, option_type="call"):
    """
    Price a European option using a binomial tree with N steps.

    As N → ∞ this converges to Black-Scholes.
    """
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt))
    d = 1 / u
    p = (math.exp(r * dt) - d) / (u - d)
    discount = math.exp(-r * dt)

    # Terminal stock prices
    prices = [S * (u ** (N - 2 * j)) for j in range(N + 1)]

    # Terminal payoffs
    if option_type == "call":
        values = [max(price - K, 0) for price in prices]
    else:
        values = [max(K - price, 0) for price in prices]

    # Backward induction
    for _ in range(N):
        values = [
            discount * (p * values[j] + (1 - p) * values[j + 1])
            for j in range(len(values) - 1)
        ]

    return values[0]


# ---------------------------------------------------------------------------
# Implied volatility (Newton-Raphson)
# ---------------------------------------------------------------------------

def implied_vol_newton(market_price, S, K, T, r, option_type="call", tol=1e-6, max_iter=100):
    """
    Back out implied volatility from a market option price using Newton-Raphson.

    Returns the implied vol, or raises ValueError if it fails to converge.
    """
    sigma = 0.2  # initial guess
    for _ in range(max_iter):
        if option_type == "call":
            price = black_scholes_call(S, K, T, r, sigma)
        else:
            price = black_scholes_put(S, K, T, r, sigma)
        vega_val = compute_vega(S, K, T, r, sigma) * 100  # un-scale vega
        if abs(vega_val) < 1e-10:
            break
        diff = price - market_price
        if abs(diff) < tol:
            return sigma
        sigma -= diff / vega_val
        sigma = max(sigma, 1e-6)  # keep sigma positive
    raise ValueError(f"Implied vol did not converge (last sigma={sigma:.4f})")


# ---------------------------------------------------------------------------
# Unit tests (run when this file is executed directly)
# ---------------------------------------------------------------------------

def _run_tests():
    S, K, T, r, sigma = 100, 100, 1.0, 0.05, 0.20

    call = black_scholes_call(S, K, T, r, sigma)
    put  = black_scholes_put(S, K, T, r, sigma)

    assert abs(call - 10.4506) < 0.01, f"call price off: {call:.4f}"
    assert abs(put - 5.5735) < 0.01,  f"put price off: {put:.4f}"

    # Put-call parity: C - P = S - K*e^{-rT}
    parity = call - put - (S - K * math.exp(-r * T))
    assert abs(parity) < 1e-8, f"put-call parity violated: {parity}"

    g = compute_gamma(S, K, T, r, sigma)
    assert 0 < g < 1, f"gamma out of range: {g}"

    v = compute_vega(S, K, T, r, sigma)
    assert v > 0, f"vega should be positive: {v}"

    iv = implied_vol_newton(call, S, K, T, r, "call")
    assert abs(iv - sigma) < 1e-4, f"IV did not recover sigma: {iv:.4f}"

    print("All tests passed!")


if __name__ == "__main__":
    _run_tests()
