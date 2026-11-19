# Verkoopwebsite

De site waarmee ik kleine zaken laat zien wat ik voor ze kan bouwen. Twee tabbladen:

**Voorpagina (`/`)**, kort gehouden:

- **Begin**: twee voorbeeldsites op de groene tafel (een installateur op de computer, een kapper op de telefoon) en een strook met de elf vakken die naar de voorbeelden leiden.
- **Wat ik voor je maak**: de drie pakketten met prijzen en wat erin zit. Alle mogelijkheden, het onderhoud en de kleine klussen staan in uitklappers.
- **Mijn werk**: Campo International groot, Handelsplan en Koersplan klein (met voorbeelddata).
- **Werkwijze** en **Waar je op kunt rekenen**, **Vragen** en **Contact**: het formulier slaat aanvragen op in Postgres en stuurt een melding.

**Voorbeelden (`/voorbeelden`)**, gemaakt uit `templates/voorbeelden.html` en `public/js/vakken.js`:

- **Voorbeeldsite per vak**: kies een van de elf vakken, typ de naam van je zaak en zie de site op een telefoon of computer, met wat je klanten ermee doen en wat het jou achter de schermen scheelt. Elke voorbeeldsite is opgebouwd als een presentatieblad: bovenaan een gevel-tekening van het pand (schaal 1:100, met stramien, maatvoering en peilmaten) waarin de naam van de zaak staat, daaronder kernfeiten, diensten, prijzen en tijden, stappen, een situatietekening met noordpijl en een titelblok als voet. De tekeningen staan in `public/js/gevels.js`, de inhoud per vak in `public/js/vakken.js` (`site`). *Kopieer link naar dit voorbeeld* maakt een link als `/voorbeelden?vak=kapper&zaak=Barbershop%20Noor#voorbeeld`, handig voor een appje of een QR-code. Oude links (`/?vak=…`) sturen hierheen door.
- **Handige links per vak**: brancheverenigingen, regels en sites om klanten naar te verwijzen, gemarkeerd met *Voor jou* of *Voor je klanten*. Daaronder links voor elke ondernemer. Links gecontroleerd in november 2026; ze staan in `vakken.js` (`links` per vak en `HANDIG`).
- **Dashboard**: een demo die zes mails van het gekozen vak leest: facturen worden gecontroleerd (bedrag, btw, nieuw rekeningnummer, dubbele factuur), een vraag van een klant krijgt een concept-antwoord, een herinnering blijkt al betaald.
- **Websitecheck**: vul een webadres in en de server beoordeelt die pagina op veiligheid, telefoon, vindbaarheid, snelheid, actualiteit (zoals een oud jaartal of nog 19% btw) en contact. Met *Vraag een voorstel* gaat de bezoeker naar het contactformulier, met de check erbij.

**Per soort bedrijf (`/voor/<slug>`)**: de plattegrond met wat AI per plek kan doen, gemaakt uit `templates/branche.html`, `public/js/plannen.js` en `public/js/voorbeelden.js`.

**/beheer**: alle aanvragen (met status en notitie, en als CSV te downloaden) en alle websitechecks.

Eén Node-server (`server.js`) met Postgres, zonder framework. De lettertypen (Cormorant Garamond, Source Sans 3 en IBM Plex Mono, en voor de voorbeeldsites Fraunces en Barlow Condensed; allemaal open source onder de OFL) worden door de site zelf geserveerd; er wordt niets van andere sites geladen.

## Op Railway zetten

1. Zet deze code in een GitHub-repo, zoals `Verkoop`.
2. Ga naar [railway.com](https://railway.com) en kies **New Project → Deploy from GitHub repo** en kies de repo.
3. Voeg in hetzelfde project een database toe: **Create → Database → PostgreSQL**.
4. Open de service en zet bij **Variables**:

   | Variabele | Waarde |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `APP_PASSWORD` | wachtwoord voor `/beheer` |
   | `CONTACT_PHONE` | optioneel: je nummer op de site, bijvoorbeeld `06 12345678` (geeft ook een WhatsApp-link) |
   | `CONTACT_EMAIL` | optioneel: je e-mailadres op de site |
   | `NTFY_TOPIC` | optioneel: pushmelding op je telefoon bij een nieuwe aanvraag (app ntfy, zoals bij Handelsplan) |
   | `RESEND_API_KEY`, `MAIL_TO`, `MAIL_FROM` | optioneel: mail bij een nieuwe aanvraag via Resend (Railway laat geen gewone SMTP toe op het Hobby-abonnement) |
   | `SITE_URL` | het eigen adres, nu `https://verkoop.vsonsbeek.nl`. De server kijkt elke twee minuten of dat adres al bij hem uitkomt; zodra het werkt, wijzen canonical en sitemap ernaar en stuurt het railway.app-adres door. Werkt het niet (meer), dan blijft alles op het adres waarop de bezoeker binnenkwam. |

5. **Settings → Networking**: *Generate Domain*, of een eigen domein. Voor een subdomein van vsonsbeek.nl zet je bij je domeinbeheerder het CNAME-record en het TXT-record (`_railway-verify…`) dat Railway laat zien.
6. **Settings → Deploy**: healthcheck-pad `/healthz`.

De tabellen maakt de site zelf aan bij de eerste start. Zonder `DATABASE_URL` werkt alles ook, maar dan verdwijnen aanvragen bij een herstart.

## Lokaal draaien

```
npm install
APP_PASSWORD=test DATABASE_URL=postgres://... node server.js
```

Open dan http://localhost:3000.

## Veiligheid

- De websitecheck haalt alleen openbare pagina's op: http(s) op poort 80 of 443, nooit interne of privé-adressen (elk opgezocht IP-adres wordt gecontroleerd vlak voor het verbinden, ook na een doorverwijzing), hooguit 5 doorverwijzingen, 1,5 MB en 9 seconden. Per bezoeker 12 checks per 10 minuten.
- Het contactformulier heeft een onzichtbaar veld en een minimale invultijd tegen spam, en hooguit 5 berichten per kwartier per bezoeker.
- `/beheer` gebruikt een wachtwoord met een sessie van 12 uur; na 5 foute pogingen per kwartier gaat inloggen even dicht. Wijzig je `APP_PASSWORD`, dan moet iedereen opnieuw inloggen.
- Strikte Content-Security-Policy: de site laadt alleen bestanden van zichzelf.
