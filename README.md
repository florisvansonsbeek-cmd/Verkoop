# Verkoopwebsite

De site waarmee ik kleine zaken laat zien wat ik voor ze kan bouwen:

- **Jouw site**: een bezoeker typt de naam van zijn zaak, kiest zijn vak en ziet meteen een voorbeeldsite op een telefoon of computer, met prijzen, openingstijden, een belknop en een kaartje. Met *Kopieer link naar dit voorbeeld* maak je een link die meteen het voorbeeld van één zaak opent, bijvoorbeeld `/?zaak=Bakkerij%20De%20Korenaar&vak=bakkerij`. Handig voor een appje of een QR-code op een kaartje.
- **Dashboard**: een demo van een dashboard dat mail leest. Zes voorbeeldmails worden gelezen: facturen worden gecontroleerd (bedrag, btw, nieuw rekeningnummer, dubbele factuur), een vraag van een klant krijgt een concept-antwoord, een herinnering blijkt al betaald. Rechts komt te staan wat er vandaag moet gebeuren.
- **Websitecheck**: vul een webadres in en de server beoordeelt die pagina op veiligheid, telefoon, vindbaarheid, snelheid, actualiteit (zoals een oud jaartal of nog 19% btw) en contact. Met *Vraag een voorstel* gaat de bezoeker naar het contactformulier, met de check erbij.
- **Mijn werk**: schermafbeeldingen van Campo International, Handelsplan en Koersplan (met voorbeelddata).
- **Contact**: het formulier slaat aanvragen op in Postgres en stuurt een melding.
- **/beheer**: alle aanvragen (met status en notitie, en als CSV te downloaden) en alle websitechecks.

Eén Node-server (`server.js`) met Postgres, zonder framework. De lettertypen (Bricolage Grotesque en IBM Plex, open source onder de OFL) worden door de site zelf geserveerd; er wordt niets van andere sites geladen.

## Op Railway zetten

1. Zet deze code in een GitHub-repo, bijvoorbeeld `Verkoopwebsite`.
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
   | `SITE_URL` | optioneel: het adres van de site, bijvoorbeeld `https://vsonsbeek.nl` |

5. **Settings → Networking**: *Generate Domain*, of een eigen domein. Voor een subdomein van vsonsbeek.nl zet je bij je domeinbeheerder het CNAME-record dat Railway laat zien.
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
