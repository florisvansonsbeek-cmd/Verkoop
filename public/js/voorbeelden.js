/* Voorbeeldschermen bij de punten op de plattegronden: zo ziet het er voor een klant of voor jou uit.
   Per punt: wie (k = ziet je klant, j = voor jou achter de schermen), pk (1 website, 2 met aanvragen, 3 met dashboard)
   en vb: het voorbeeldscherm. De schermen zijn van een Nederlandse zaak en blijven daarom in het Nederlands,
   net als de voorbeeldsite en de demo-mails. Namen, bedragen en kentekens zijn verzonnen. */
window.VOORBEELDEN = {
  boerderij: { zaak: "De Hoeve", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Vers van eigen land", regels: ["Deze week: pompoen, prei en appels", "Open di t/m za, 9.00 tot 17.00 uur"], knop: "Bestel je pakket" } },
    { wie: "k", pk: 2, vb: { type: "lijst", titel: "Paklijst zaterdag", items: [["Groentepakket groot", "Fam. de Wit", "ok"], ["Kaas en eieren", "M. Bos", "open"], ["Groentepakket klein", "J. Kok", "open"]], notitie: "Nieuwe bestellingen komen er vanzelf bij." } },
    { wie: "j", pk: 3, vb: { type: "overzicht", titel: "Voorraad vandaag", tegels: [["Boerenkaas", "4 stuks"], ["Melk", "12 liter"], ["Eieren", "30 stuks"]], melding: "Boerenkaas raakt op. Voorstel: bestel 10 stuks bij de kaasmakerij." } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Kaasmakerij Het Veld", bedrag: "€ 412,50", checks: [["ok", "Aantallen kloppen met je bestelling"], ["let", "Prijs per kilo is € 0,40 hoger dan vorige keer"]] } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Hoi Marieke, je groentepakket staat klaar! Ophalen kan vandaag tot 17.00 uur.", knop: "Route" } },
    { wie: "j", pk: 2, vb: { type: "lijst", titel: "Oogst van vandaag", items: [["Pompoen", "40 stuks", "ok"], ["Prei", "25 bossen", "ok"], ["Spruitjes", "nog niet", "open"]], notitie: "Het weekaanbod op de site is bijgewerkt." } },
    { wie: "j", pk: 3, vb: { type: "review", naam: "Sanne", tekst: "Heerlijke appels en altijd vriendelijk geholpen!", concept: "Dank je wel, Sanne! Volgende week hebben we ook weer Elstar." } }
  ] },
  installateur: { zaak: "Installatiebedrijf Smit", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Lekkage of storing? Wij komen langs.", regels: ["Werkgebied: Utrecht en omgeving", "Spoed: ook in het weekend"], knop: "Spoed melden" } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Lekkage melden", foto: true, velden: [["Adres", "Lindelaan 14, Utrecht"], ["Wat is er aan de hand?", "Lekkage onder het aanrecht"], ["Spoed?", "Ja, vandaag"]], knop: "Verstuur" } },
    { wie: "j", pk: 3, vb: { type: "planning", titel: "Planning dinsdag", rijen: [["8.00", "Bus 1", "Lekkage Lindelaan"], ["9.00", "Bus 2", "Badkamer Oudwijk"], ["10.30", "Bus 1", "Onderhoud cv-ketel"]], voorstel: "Voorstel: de spoedklus aan de Lindelaan in bus 1, om 8.00 uur." } },
    { wie: "k", pk: 3, vb: { type: "offerte", titel: "Offerte nieuwe badkamer", regels: [["Tegelwerk", "€ 2.400"], ["Sanitair", "€ 1.850"], ["Arbeid", "€ 3.200"]], totaal: "€ 7.450", knop: "Akkoord geven" } },
    { wie: "j", pk: 3, vb: { type: "overzicht", titel: "Magazijn", tegels: [["Knelkoppelingen", "18"], ["Sifons", "3"], ["Cv-pompen", "2"]], melding: "Sifons raken op. Op de bestellijst zetten?" } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Groothandel Delta", bedrag: "€ 1.284,00", checks: [["ok", "Alles besteld en geleverd"], ["stop", "Lijkt dubbel: dezelfde factuur kwam vorige week ook"]] } }
  ] },
  schilder: { zaak: "Schildersbedrijf Bakker", punten: [
    { wie: "k", pk: 1, vb: { type: "voorna", titel: "Woning Van Dijk, Zeist", tekst: "Kozijnen en deuren buiten geschilderd", review: "Netjes gewerkt en op tijd klaar." } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Offerte aanvragen", foto: true, velden: [["Ruimte", "Woonkamer"], ["Afmetingen", "5 bij 4 meter, 2,6 m hoog"], ["Wat moet er gebeuren?", "Muren en plafond sauzen"]], knop: "Verstuur" } },
    { wie: "j", pk: 3, vb: { type: "offerte", titel: "Eerste berekening woonkamer", regels: [["Muurverf, 2 lagen", "12 liter"], ["Plafondverf", "5 liter"], ["Uren", "9 uur"]], notitie: "Klaar om na te kijken en aan te passen." } },
    { wie: "j", pk: 3, vb: { type: "planning", titel: "Deze week", rijen: [["Ma", "Buiten", "Kozijnen Van Dijk"], ["Di", "Binnen", "Woonkamer De Vries"], ["Wo", "Buiten", "Regen verwacht"]], voorstel: "Voorstel: woonkamer De Vries naar woensdag, kozijnen naar dinsdag." } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Verfgroothandel Kleur & Co", bedrag: "€ 386,20", checks: [["ok", "Geboekt op klus Woning Van Dijk"], ["ok", "Prijzen kloppen met je afspraak"]] } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Hoi Peter, je woonkamer is klaar. Ben je tevreden? Een review helpt ons enorm.", knop: "Review schrijven" } }
  ] },
  aannemer: { zaak: "Bouwbedrijf Van Rijn", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Nieuwbouw en verbouw in de regio Utrecht", regels: ["Lindehof: 12 woningen, oplevering 2027", "Gecertificeerd en verzekerd"], knop: "Bekijk projecten" } },
    { wie: "j", pk: 3, vb: { type: "offerte", titel: "Posten uit het bestek", regels: [["Fundering, 42 m³ beton", "te prijzen"], ["Metselwerk, 180 m²", "te prijzen"], ["Kozijnen, 14 stuks", "te prijzen"]], notitie: "Klaar om te controleren en aan te vullen." } },
    { wie: "j", pk: 3, vb: { type: "planning", titel: "Week 47, Lindehof", rijen: [["Ma", "Timmerploeg", "Kozijnen blok A"], ["Di", "Levering", "Dakpannen, 8.00 uur"], ["Do", "Elektricien", "Leidingen blok B"]] } },
    { wie: "k", pk: 3, vb: { type: "bericht", fotos: 3, tekst: "Update week 47: de kozijnen van blok A zitten erin. Volgende week begint het dakwerk.", knop: "Alle foto's" } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Grondwerk Kok", bedrag: "€ 6.120,00", checks: [["let", "62 uur gefactureerd, 54 uur afgesproken"], ["ok", "Uurtarief klopt met het contract"]] } },
    { wie: "k", pk: 2, vb: { type: "offerte", titel: "Meerwerk: extra stopcontacten", regels: [["4 stopcontacten in de keuken", "€ 340"]], totaal: "€ 340", knop: "Goedkeuren", notitie: "Pas na jouw akkoord wordt het uitgevoerd." } }
  ] },
  "dak-tuin": { zaak: "Dak & Tuin Verhoef", punten: [
    { wie: "k", pk: 1, vb: { type: "zoek", zoek: "hovenier houten", titel: "Hovenier in Houten | Dak & Tuin Verhoef", adres: "dakentuinverhoef.nl › hovenier-houten", tekst: "Tuinonderhoud, bestrating en aanleg in Houten en omgeving. Vraag een offerte aan met een foto van je tuin." } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Aanvraag dak of tuin", foto: true, velden: [["Wat zie je?", "Losse dakpannen na de storm"], ["Adres", "Kerkweg 3, Houten"]], knop: "Verstuur" } },
    { wie: "j", pk: 3, vb: { type: "planning", titel: "Planning deze week", rijen: [["Di", "Dak", "Fam. Jansen, regen verwacht"], ["Wo", "Tuin", "Snoeiwerk Kerkweg"]], voorstel: "Voorstel: Jansen naar donderdag. Het bericht aan de familie staat klaar." } },
    { wie: "j", pk: 3, vb: { type: "lijst", titel: "Onderhoud ingepland", items: [["Dakinspectie", "Fam. Jansen, maart", "ok"], ["Heg snoeien", "Kerkweg 3, juni", "ok"], ["Goten reinigen", "De Linde, oktober", "open"]] } },
    { wie: "k", pk: 3, vb: { type: "offerte", titel: "Offerte tuinontwerp", regels: [["Ontwerp en tekening", "€ 450"], ["Bestrating, 30 m²", "€ 2.100"], ["Beplanting", "€ 780"]], totaal: "€ 3.330", knop: "Akkoord geven" } }
  ] },
  kapper: { zaak: "Barbershop Noor", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Knippen, baard en scheren", regels: ["Knippen € 32, baard € 18", "Open di t/m za"], knop: "Afspraak maken" } },
    { wie: "k", pk: 2, vb: { type: "boeken", diensten: ["Knippen", "Baard", "Knippen en baard"], dag: "Dinsdag 18 november", tijden: ["10.00", "10.30", "11.15"], gekozen: 1, knop: "Bevestig afspraak" } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Hoi Daan, morgen om 10.30 uur zien we je bij Barbershop Noor. Lukt het niet? Verzet je afspraak met één tik.", knop: "Verzetten" } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Bedankt voor je bezoek, Daan! Tevreden over je knipbeurt? Een review helpt ons enorm.", knop: "Review schrijven" } },
    { wie: "j", pk: 3, vb: { type: "overzicht", titel: "Producten", tegels: [["Haarwax", "6"], ["Baardolie", "2"], ["Shampoo", "11"]], melding: "Baardolie raakt op. Op de bestellijst zetten?" } },
    { wie: "j", pk: 3, vb: { type: "overzicht", titel: "Deze week", tegels: [["Omzet", "€ 3.840"], ["Afspraken", "112"], ["Lege plekken", "6"]], melding: "Knippen en baard samen levert het meest op." } }
  ] },
  garage: { zaak: "Garage De Kruising", punten: [
    { wie: "k", pk: 2, vb: { type: "boeken", diensten: ["APK", "Onderhoud", "Bandenwissel"], dag: "Donderdag 20 november", tijden: ["8.00", "9.30", "13.00"], gekozen: 0, knop: "Bevestig afspraak" } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Goed nieuws: je Golf staat klaar! Ophalen kan tot 18.00 uur. De factuur zit erbij.", knop: "Factuur bekijken" } },
    { wie: "k", pk: 2, vb: { type: "offerte", titel: "Reparatie: remblokken voor", foto: true, regels: [["Remblokken voor", "€ 128"], ["Arbeid", "€ 85"]], totaal: "€ 213", knop: "Goedkeuren" } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Onderdelencentrale Midden", bedrag: "€ 642,10", checks: [["ok", "Remblokken en filters besteld en geleverd"], ["let", "Eén accu gefactureerd die niet besteld is"]] } },
    { wie: "j", pk: 3, vb: { type: "lijst", titel: "Bandenhotel", items: [["Golf, 12-ABC-3", "Winterset, rek 4", "let"], ["Polo, 34-DEF-5", "Zomerset, rek 9", "ok"], ["Fiesta, 56-GHJ-7", "Winterset, rek 2", "let"]], notitie: "Tijd om te wisselen: 18 klanten krijgen een uitnodiging." } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Bedankt dat je bij ons was! Tevreden over de APK? Laat een review achter, dan vinden anderen ons ook.", knop: "Review schrijven" } }
  ] },
  fysio: { zaak: "Fysio Oost", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Fysiotherapie in Utrecht-Oost", regels: ["Sportblessures, rug en nek", "Wachttijd nu: 3 dagen"], knop: "Afspraak maken" } },
    { wie: "k", pk: 2, vb: { type: "boeken", diensten: ["Intake", "Behandeling"], dag: "Maandag 24 november", tijden: ["8.30", "12.00", "16.45"], gekozen: 2, knop: "Bevestig afspraak" } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Intake", velden: [["Klacht", "Pijn in de onderrug"], ["Sinds wanneer?", "Ongeveer drie weken"], ["Verwijzing?", "Nee"]], knop: "Verstuur intake" } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Hoi Mark, morgen om 8.30 uur je afspraak. Je oefeningen voor thuis staan klaar: drie oefeningen, tien minuten.", knop: "Oefeningen bekijken" } },
    { wie: "j", pk: 3, vb: { type: "mail", titel: "Klaargezet", items: [["Huisartsenpraktijk De Linde", "Verwijzing J. de Boer", "Verwijzing"], ["Zorgverzekeraar", "Vraag over een machtiging", "Vraag"], ["Mark Peters", "Afspraak verzetten", "Afspraak"]] } }
  ] },
  schoonmaak: { zaak: "Schoonmaakbedrijf Helder", punten: [
    { wie: "k", pk: 1, vb: { type: "aanvraag", titel: "Wat kost het ongeveer?", velden: [["Soort", "Kantoor"], ["Oppervlakte", "250 m²"], ["Hoe vaak?", "Twee keer per week"]], uitkomst: "Indicatie: € 640 per maand" } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Offerte aanvragen", velden: [["Ruimtes", "Kantoor, keuken, twee toiletten"], ["Hoe vaak?", "Twee keer per week"], ["Start", "1 december"]], knop: "Verstuur" } },
    { wie: "j", pk: 3, vb: { type: "planning", titel: "Rooster dinsdag", rijen: [["7.00", "Ayla", "Kantoor Westpoort"], ["9.30", "Ayla", "Praktijk Oost"], ["7.00", "Tom", "School De Brug"]], voorstel: "Voorstel: Tom neemt Praktijk Oost, dat scheelt 25 minuten rijden." } },
    { wie: "k", pk: 3, vb: { type: "lijst", titel: "Kantoor Westpoort, dinsdag", items: [["Bureaus afgenomen", "7.40", "ok"], ["Keuken en koffieautomaat", "8.05", "ok"], ["Toiletten", "bezig", "open"]], notitie: "De klant ziet dit lijstje ook." } },
    { wie: "j", pk: 3, vb: { type: "offerte", titel: "Factuur november, Kantoor Westpoort", regels: [["Schoonmaak, 34 uur", "€ 1.190"], ["Extra: ramen", "€ 145"]], totaal: "€ 1.335", knop: "Versturen" } }
  ] },
  tandarts: { zaak: "Tandartspraktijk Brink", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Uitleg over behandelingen en tarieven", regels: ["Controle, vullingen en kronen", "Nieuwe patiënten welkom"], knop: "Inschrijven" } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Inschrijven als patiënt", velden: [["Naam", "Lisa de Graaf"], ["Gezinsleden", "Twee kinderen"], ["Wachttijd", "Ongeveer vier weken"]], knop: "Inschrijven" } },
    { wie: "k", pk: 2, vb: { type: "bericht", tekst: "Hoi Lisa, het is weer tijd voor je halfjaarlijkse controle. Kies hier een moment dat jou uitkomt.", knop: "Moment kiezen" } },
    { wie: "j", pk: 3, vb: { type: "mail", titel: "Klaargezet voor de assistente", items: [["Lisa de Graaf", "Afspraak verzetten", "Afspraak"], ["Tandtechnisch lab", "Kroon klaar voor dinsdag", "Lab"], ["Zorgverzekeraar", "Vraag over een declaratie", "Declaratie"]] } },
    { wie: "j", pk: 3, vb: { type: "factuur", van: "Dentaal Groothandel Noord", bedrag: "€ 918,40", checks: [["ok", "Handschoenen en vulmateriaal zoals besteld"], ["let", "Rekeningnummer is anders dan bij eerdere facturen"]] } }
  ] },
  accountant: { zaak: "Administratiekantoor Vos", punten: [
    { wie: "k", pk: 1, vb: { type: "site", kop: "Boekhouding voor zzp'ers en het mkb", regels: ["Vaste prijs per kwartaal", "Ook voor starters"], knop: "Kennismaken" } },
    { wie: "k", pk: 2, vb: { type: "aanvraag", titel: "Aanmelden als klant", velden: [["Bedrijf", "Bakkerij De Korenaar"], ["Rechtsvorm", "Eenmanszaak"], ["Waarmee?", "Btw-aangifte en jaarrekening"]], knop: "Aanmelden" } },
    { wie: "j", pk: 3, vb: { type: "mail", titel: "Gesorteerd per klant", items: [["Bakkerij De Korenaar", "Bonnetje tankstation", "Q4 kosten"], ["Kapsalon Mila", "Inkoopfactuur", "Q4 inkoop"], ["Garage De Kruising", "Bankafschrift", "Q4 bank"]] } },
    { wie: "j", pk: 3, vb: { type: "lijst", titel: "Deadlines", items: [["Btw-aangifte Q4", "31 januari", "let"], ["Aangifte inkomstenbelasting", "1 mei", "open"], ["Stukken Bakkerij De Korenaar", "binnen", "ok"]], notitie: "Klanten zonder stukken krijgen een herinnering." } },
    { wie: "k", pk: 3, vb: { type: "lijst", titel: "Mijn administratie", items: [["Btw-aangifte Q3", "ingediend", "ok"], ["Bonnetjes oktober", "ontvangen", "ok"], ["Bankafschrift november", "nog aanleveren", "open"]] } }
  ] }
};
