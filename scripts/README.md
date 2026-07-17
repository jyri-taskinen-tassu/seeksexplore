## create-demo-users.ts

Mitä skripti tekee
- Luo kolme demokäyttäjää Supabase Authiin (`demo.customer@seeksandexplore.com`, `demo.provider@seeksandexplore.com`, `demo.admin@seeksandexplore.com`) käyttäen Supabase Admin API:n `createUser`-metodia.
- Asettaa `email_confirm: true` niin, että käyttäjät voivat kirjautua suoraan demo-skenaariossa.
- Varautuu olemassa oleviin riveihin (idempotentti): se ei luo duplikaatteja, vaan varmistaa profiilit, provider-linkityksen ja customers-rivin tarvittaessa.
- Käyttää tietokantatasolla olemassa olevia RPC-funktioita (`create_admin`, `create_provider_profile`) ja tauluja (`profiles`, `providers`, `provider_users`, `customers`).

Vaaditut ympäristömuuttujat (ilman arvoja)
- `NEXT_PUBLIC_SUPABASE_URL` (esim. https://<project>.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` (service role -avain, saa olla vain paikallisessa `.env.local`)
- `NEXT_PUBLIC_APP_SCHEMA` (esim. `public` tai projektin skeema)
- `DEMO_CUSTOMER_PASSWORD`
- `DEMO_PROVIDER_PASSWORD`
- `DEMO_ADMIN_PASSWORD`

Dry-run (EI muuta mitään)
```
npm run demo:users -- --dry-run
```

Oikea ajokomento (muuttaa Supabase-tietokantaa)
```
# Varmista että .env.local sisältää yllä listatut avaimet (erityisesti SUPABASE_SERVICE_ROLE_KEY ja DEMO_*_PASSWORD)
npm run demo:users
```

Varoitukset
- Skripti muuttaa määriteltyä Supabase-tietokantaa (Auth + sovelluksen skeeman taulut). Älä suorita tuotantotietokannassa vahingossa.
- Älä committaa `.env.local`-tiedostoa tai mitään muita salaisuuksia.
- Tämä skripti käyttää `SUPABASE_SERVICE_ROLE_KEY` -avainta — pidä se turvallisena ja rajoita sen käsittely paikallisesti.

Demo-käyttäjät (sähköpostit)
- demo.customer@seeksandexplore.com
- demo.provider@seeksandexplore.com
- demo.admin@seeksandexplore.com
