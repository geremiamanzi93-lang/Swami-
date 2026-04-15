# Cuore Artigiano - PRD

## Problema Originale
Creare un'applicazione web chiamata "Cuore Artigiano", una galleria comunitaria per artigiani ispirata allo stile di Pinterest. Interfaccia esclusivamente in italiano.

## Architettura
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: Google OAuth via Emergent Auth
- **Storage**: Emergent Object Storage per immagini
- **Font**: Playfair Display (heading) + Manrope (body)

## User Personas
1. **Artigiano** - Utente registrato che pubblica le proprie opere
2. **Visitatore** - Utente non registrato che esplora la galleria

## Core Requirements (Static)
- Griglia Pinterest per visualizzazione opere
- 7 Categorie: Orecchini, Collane, Ciondoli, Borse, Ciondoli per capelli, Scacciapensieri, Uncinetto
- Profilo artigiano con foto, nome brand, bio
- Contatto via WhatsApp
- Condivisione su social
- Solo esposizione (no pagamenti/carrello)
- Design: crema #F9F6F0, verde salvia #749274, verde foresta #2E5339, marrone #4A3018

## Implementato (14-15 Aprile 2026)

### Fase 1 - MVP
- Home page con griglia masonry
- Filtri categorie funzionanti
- Google Auth via Emergent
- Upload immagini con Object Storage
- CRUD opere artigianali
- Profilo artigiano con bio, foto, WhatsApp
- Pagina dettaglio opera
- Pulsante Contatta (WhatsApp)
- Pulsante Condividi (Web Share API / WhatsApp fallback)
- Demo works per galleria iniziale

### Fase 2 - Iterazione
- Fix bug logout automatico (localStorage backup + Authorization header)
- Pulsante "Unisciti alla Community" nell'header
- Barra di ricerca artigiani (posizionata tra descrizione e filtri)
- Icona cuore (Like) su ogni opera nella griglia
- Endpoint API likes con toggle e conteggio
- Endpoint API ricerca artigiani per nome

## Backlog Prioritizzato
- **P0**: -
- **P1**: 
  - Pagina "I miei preferiti" (opere salvate con like)
  - Notifiche per nuovi contatti WhatsApp
- **P2**: 
  - Filtro per artigiano nella home
  - Infinite scroll per la griglia
  - Immagini multiple per opera
  - Statistiche visualizzazioni profilo

## Next Tasks
1. Deploy finale
2. Aggiungere pagina preferiti per utenti autenticati
3. SEO meta tags per ogni opera e profilo
