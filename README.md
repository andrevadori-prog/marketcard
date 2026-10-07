# PokéCards

PokéCards è un marketplace leggero per la collezione e la vendita manuale di carte Pokémon. Gli utenti possono consultare il catalogo e inviare richieste senza creare un account; il venditore gestisce carte e richieste dall’area admin. La V1 non include pagamenti online.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Zod e Vercel.

## Requisiti

- Node.js 20.9 o successivo e npm.
- Un progetto Supabase per attivare le richieste e l’area admin.

## Installazione e avvio

```bash
npm install
cp .env.example .env.local
npm run dev
```

Su Windows, copia `.env.example` in `.env.local` con Esplora file o PowerShell. Senza credenziali Supabase, homepage e catalogo funzionano in modalità demo con carte e illustrazioni segnaposto originali. Il form richiesta mostra un errore chiaro e non simula un salvataggio; l’area admin chiede la configurazione.

## Configurazione Supabase

1. Crea un progetto Supabase.
2. In Project Settings → API, copia Project URL e anon/public key in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<chiave-pubblica>
   ```

3. In SQL Editor esegui in ordine tutti i file in `supabase/migrations/`: `202610060001_initial_schema.sql`, `202610070001_inventory_and_timestamps.sql` e `202610070002_least_privilege.sql`.
4. Solo per sviluppo o test, esegui `supabase/seed.sql` per inserire tre set e dieci carte demo. Non eseguire il seed sul database di produzione. Le immagini segnaposto sono incluse in `public/demo-card.svg`.
5. Le migration creano il bucket pubblico `card-images`, con limite di 4 MB e MIME consentiti JPG, PNG e WEBP. Le policy Storage consentono lettura pubblica e modifiche solo agli admin. L’upload controlla anche firma del file e dimensione lato server.
6. In Authentication → Settings disabilita le nuove registrazioni pubbliche. In Authentication → Users crea o invita il tuo utente admin. Il trigger crea il profilo con ruolo `customer`; dal SQL Editor promuovi solo il tuo UUID:

   ```sql
   update public.profiles set role = 'admin' where id = '<UUID-utente>';
   ```

La chiave service role non è necessaria e non deve essere inserita nel frontend. Le API usano la sessione Supabase e RLS. La funzione SQL blocca la riga della carta durante la richiesta, salva il prezzo corrente e decrementa la quantità nella stessa transazione. Se l’admin annulla una richiesta, la quantità torna disponibile; richieste completate o annullate sono stati terminali. L’invio non incassa pagamenti e il venditore concorda pagamento e spedizione manualmente.

## Verifica MVP

Dopo aver configurato `.env.local`, applicato tutte le migration e caricato il seed, riavvia il server (`npm run dev`). Questa checklist indica i controlli eseguiti nell’ambiente di sviluppo attuale:

- [x] Homepage, catalogo, contatti, dettaglio carta e login admin si caricano; ID carta non valido o inesistente restituisce 404.
- [x] Catalogo legge le carte reali; ricerca per nome, numero e set; filtri set, rarità, lingua, condizione e fascia prezzo; combinazioni, reset, empty state e ordinamenti prezzo/recenti.
- [x] Nessuna carta venduta è esposta al pubblico dalle policy RLS; immagini e set delle carte visibili si caricano.
- [x] Nessun overflow orizzontale sui percorsi pubblici a 360, 390, 768, 1024 e 1440 px; menu e filtri mobili sono utilizzabili.
- [x] API rifiuta quantità zero/negativa, email e nome non validi, quantità superiore allo stock e carta inesistente; non sono state create richieste di prova.
- [x] Accesso anonimo alle pagine admin viene reindirizzato al login; le API CRUD admin rispondono 401 senza sessione.
- [x] Query anonime non leggono richieste; schema SQL limita le scritture e le funzioni privilegiate verificano il ruolo admin.
- [ ] Login valido/errato, logout e accesso autenticato con ruolo non-admin: richiedono credenziali Auth e non sono stati provati in questa sessione.
- [ ] Richiesta valida, concorrenza live, CRUD di una carta di test, upload valido/non valido e modifica stato richiesta: da verificare con sessione admin e carta di test isolata.
- [ ] Suite automatizzata RLS con ruoli anon/authenticated: eseguire con Supabase CLI/pgTAP in un progetto di test.

La modalità demo è usata soltanto in sviluppo quando le variabili Supabase non sono configurate. In produzione non vengono mai mostrate carte demo: se la configurazione Supabase manca, le pagine mostrano l’errore generico dell’app. Se le variabili sono presenti ma il database non è raggiungibile, le letture restituiscono un errore invece di mostrare dati demo; gli invii non dichiarano mai un salvataggio riuscito senza database.

## Controlli locali

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy

Il progetto è compatibile con Vercel e usa i comandi standard Next.js (`npm install`, `npm run build`, `npm run start`). Non serve un file `vercel.json`.

1. **Crea/configura Supabase.** Usa il progetto Supabase destinato alla produzione. In Authentication → Settings disabilita le registrazioni pubbliche.
2. **Configura le variabili.** In Vercel → Project → Settings → Environment Variables inserisci `NEXT_PUBLIC_SUPABASE_URL` (Project URL), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chiave publishable/anon pubblica), `NEXT_PUBLIC_SITE_URL` (URL pubblico HTTPS del sito, senza slash finale) e `NEXT_PUBLIC_CONTACT_EMAIL` (indirizzo che il venditore vuole rendere pubblico). Le prime due sono necessarie al database e all’admin; le altre abilitano URL Open Graph/sitemap e la pagina contatti. Non inserire mai password o service role/secret key.
3. **Applica le migration** in ordine dal SQL Editor Supabase: `202610060001_initial_schema.sql`, `202610070001_inventory_and_timestamps.sql`, `202610070002_least_privilege.sql`.
4. **Configura Storage.** Le migration creano il bucket pubblico `card-images` con limite 4 MB e MIME JPG/PNG/WEBP; verifica che esista nel dashboard Supabase e che le policy siano state create.
5. **Crea l’admin.** Crea/invita l’utente in Authentication → Users, poi imposta `profiles.role = 'admin'` per il suo UUID come descritto sopra. Non abilitare la registrazione pubblica.
6. **Collega il repository a Vercel.** Importa il repository e lascia i comandi standard rilevati da Next.js. Aggiungi le variabili agli ambienti Production e Preview che userai.
7. **Imposta i redirect Auth.** In Supabase Authentication → URL Configuration imposta Site URL sul dominio di produzione e aggiungi il dominio e i redirect URL richiesti per il login.
8. **Esegui il deploy** da Vercel dopo aver applicato le migration al progetto Supabase di produzione. Il seed demo è facoltativo e va usato solo in sviluppo/test; non caricarlo sul database di produzione.
9. **Fai il test finale:** apri homepage/catalogo/dettaglio, invia una richiesta controllata, accedi all’admin, aggiorna una carta di test e verifica le richieste. Controlla anche il dominio, favicon, immagini e sitemap.

Per inizializzare un catalogo demo, esegui `supabase/seed.sql` solo sul database scelto. Il seed crea righe demo con immagini segnaposto e non è necessario per il deploy. La modalità dati demo in memoria è limitata allo sviluppo e non viene mostrata in produzione.

## Struttura principale

- `app/`: rotte pubbliche, area admin e API server-side.
- `components/`: componenti condivisi e interattivi.
- `lib/`: accesso Supabase, query, tipi e validazione.
- `supabase/`: schema, policy RLS, funzione transazionale e seed.
