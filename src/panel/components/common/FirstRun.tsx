import React from 'react';
import { IconArrowsExchange, IconRoute, IconWaveSine, IconX } from '@tabler/icons-react';
import { usePanelStore } from '../../store';

// Shown once, in place of the API tab's empty state, until dismissed.
//
// PRODUCT.md records that XRAY has no first-run path and is headed for a public
// Chrome Web Store listing. Those two facts do not sit together: the product is
// tuned for a developer who already knows it, and the store hands it to people who
// do not. This is the smallest thing that closes that gap without getting in the
// way of the people who already know it.
//
// Deliberately NOT a modal. A takeover on first open would block the tool at the
// exact moment the user is trying to watch traffic arrive, and traffic is the thing
// that dismisses it anyway. It occupies space that is empty by definition, and the
// first captured request replaces it.
//
// The register matches the rest of the product: state the mechanism, name the thing
// it beats, do not sell. Three capabilities, because those are the three DevTools
// genuinely lacks, not because three is a nice number for a grid.
const CAPABILITIES = [
  {
    icon: <IconRoute size={15} stroke={1.7} />,
    title: 'Mock',
    body: 'Match by URL or method and return your own body, status, or failure. Applied in the page, before the real call.',
  },
  {
    icon: <IconArrowsExchange size={15} stroke={1.7} />,
    title: 'Replay',
    body: 'Re-fire any captured request, editing it first if you like. Auth survives, and the result is diffed against the original.',
  },
  {
    icon: <IconWaveSine size={15} stroke={1.7} />,
    title: 'Drift',
    body: 'Every endpoint keeps a schema baseline. When a response changes shape, the row is flagged with a one-click diff.',
  },
];

export function FirstRun(): React.ReactElement {
  const updateSettings = usePanelStore((state) => state.updateSettings);

  return (
    <section className="xray-firstrun" role="status" aria-labelledby="xray-firstrun-title">
      <div className="xray-firstrun-head">
        <div>
          <h3 className="xray-firstrun-title" id="xray-firstrun-title">Listening for traffic</h3>
          <p className="xray-firstrun-lede">
            Browse the page or trigger a call. Every fetch, XHR, WebSocket, SSE and GraphQL
            request lands in this list, with real timings and the response body intact.
          </p>
        </div>
        <button
          type="button"
          className="xray-firstrun-dismiss"
          onClick={() => updateSettings({ firstRunDismissed: true })}
          aria-label="Dismiss the introduction"
          title="Dismiss"
        >
          <IconX size={14} stroke={2} />
        </button>
      </div>

      <ul className="xray-firstrun-grid">
        {CAPABILITIES.map((item) => (
          <li className="xray-firstrun-cell" key={item.title}>
            <span className="xray-firstrun-cell-head">
              <span className="xray-firstrun-cell-icon" aria-hidden="true">{item.icon}</span>
              <span className="xray-firstrun-cell-title">{item.title}</span>
            </span>
            <p className="xray-firstrun-cell-body">{item.body}</p>
          </li>
        ))}
      </ul>

      <p className="xray-firstrun-foot">
        Nothing leaves this machine. Press <kbd className="xray-kbd">Ctrl</kbd>
        <span className="xray-firstrun-plus">+</span>
        <kbd className="xray-kbd">K</kbd> to jump anywhere.
      </p>
    </section>
  );
}
