# Security policy

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/rahuldr07/xray-extension/security/advisories/new).
Please do not open a public issue for a security bug.

Include what you need to reproduce it: the affected version, the site or traffic
shape that triggers it, and what an attacker gains. A proof of concept helps but
is not required.

Expect an initial response within seven days.

## Supported versions

XRAY is pre-1.0. Only the latest release on `main` receives fixes.

## What XRAY is, and what that means for you

XRAY is a traffic-inspection tool. To do its job it injects content scripts into
**every frame of every URL**, captures request and response bodies, retains
authorization headers so requests can be replayed, and decodes JWTs.

That concentrates secrets from every site you visit into one place. Two
consequences worth understanding before you install it:

- **Captured traffic persists across origins.** By default the session is restored
  on every site, so traffic captured on one origin is resident in the panel while
  you are on another.
- **The AI Explain feature sends captured traffic to a third party.** It is BYOK
  and off unless you configure a key, but when used it transmits the request URL,
  headers, and body to your chosen provider.

Do not use XRAY on untrusted sites while holding credentials you care about.

## Known open issues

This project has a written [threat model](docs/threat-model.md) with a set of
**open, unfixed findings** — including one rated critical. They are documented
rather than hidden.

The most important, if you are evaluating XRAY for use:

- **The MAIN world is not a security boundary.** Several controls (the bridge
  token, the console session nonce, the decrypt hook) are stored on the page's own
  `window`, so a hostile page can read or replace them. It can disable capture
  silently, inject fabricated entries, or — when you run a console command — read
  the captured context.
- **The `debugger` permission is currently the primary console execution path**,
  not a fallback. It should be optional and on demand.
- **Header redaction is a denylist**, so it cannot cover every auth scheme, and it
  does not touch URLs or bodies.

Read [docs/threat-model.md](docs/threat-model.md) before deploying this in an
environment where the captured traffic matters.

## Scope

In scope: anything that lets a web page read captured traffic, extract stored
credentials or the BYOK key, disable or corrupt capture, escalate out of the page
into extension privileges, or reach another tab.

Out of scope: findings that require the user to install a malicious extension or
paste attacker-supplied code into the console, and the documented behaviour that
XRAY intentionally captures and displays sensitive data on the sites you point it at.
