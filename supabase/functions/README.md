# Edge Functions

No functions implemented yet — this is Phase 7 (AI) and later work. Documented
here now so the seam is designed before it's built (see
`../../docs/architecture.md#10-ai-recommendation-layer`).

Planned:

- **`ai-recommend-route`** — `POST` body: `{ destination_id, user_location,
  activity, duration, difficulty, group_type, preferences, weather }`.
  Filters real `routes` rows first, then asks an LLM (via an `AIProvider`
  abstraction — `OpenAIProvider` / `AnthropicProvider`) to rank/explain from
  that candidate set. The LLM must only ever reference existing `route_id`s.
  API keys stay in the function's environment, never sent to the client.

Nothing here is called from the mobile app until Phase 7. The consumer app
must work fully with zero Edge Function / AI calls (see architecture.md §10).
