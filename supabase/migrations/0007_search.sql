-- Phase 1: full-text search (MVP — Meilisearch/Typesense is a later swap, not a dependency)

alter table routes add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored;
create index routes_search_idx on routes using gin (search_vector);

alter table points_of_interest add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored;
create index poi_search_idx on points_of_interest using gin (search_vector);

alter table businesses add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored;
create index businesses_search_idx on businesses using gin (search_vector);
