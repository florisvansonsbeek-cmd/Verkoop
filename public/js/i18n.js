/* Talen: Nederlands (standaard, staat in de pagina zelf), Engels en Duits.
   Elementen met data-i18n krijgen de vertaalde inhoud; data-i18n-aria en data-i18n-ph vertalen aria-label en placeholder.
   UI-teksten voor site.js staan onder ui. De voorbeeldsite en de demo-mails blijven Nederlands: het is een Nederlandse zaak. */
(function () {
  "use strict";
  var TALEN = { nl: "Nederlands", en: "English", de: "Deutsch" };
  var D = {
    en: {
      t001: "Skip to content", t003: "WEBSITES &amp; SMART SYSTEMS", t004: "Possibilities", t005: "Why me", t006: "My work", t007: "Your site", t008: "Dashboard", t009: "Questions", t010: "Get in touch",
      t011: "A beautiful website, and smart help behind the scenes",
      t012: "I build websites and AI-powered systems for businesses with character. They read your mail, check invoices and keep track of orders, so you have time for your customers. Pick a type of business below and see what that means in practice.",
      t013: "Book an introduction", t014: "See all possibilities", t015: "Examples of what's possible, not a fixed package. Together we choose what fits your business and start with one part.",
      t016: "What I can build for a business like this",
      t017: "These are ideas, not a fixed package. Together we first pick the one thing that saves you the most time and test it in your business. Only when that works well do we add more. <em>Built before</em> means I have already made something similar for one of my own systems.",
      t018: "Getting found", t019: "A custom website, on your own domain", t020: "Multilingual site for tourists or customers abroad<span class=\"al\">built before</span>", t021: "Copy that ranks well on Google", t022: "Opening hours and details consistent everywhere, including Google Maps",
      t023: "Selling and ordering", t024: "Online ordering, reservations or bookings", t025: "Boxes and subscriptions, such as a weekly veg box", t026: "Customers track their own order<span class=\"al\">built before</span>", t027: "A message or email as soon as something is ready",
      t028: "Mail and admin", t029: "Reading and sorting mail: invoices, questions, quotes<span class=\"al\">built before</span>", t030: "Checking invoices for amount, VAT, bank details and duplicates<span class=\"al\">built before</span>", t031: "Scanning receipts and packing slips with your phone", t032: "Everything neatly ready for your accountant", t033: "Quotes and invoices in your own house style",
      t034: "Customer contact", t035: "Draft replies to questions and reviews, in your tone", t036: "A newsletter with this week's offer", t037: "Instagram or Facebook posts from a single photo", t038: "Reminders for appointments and unpaid invoices",
      t039: "Insight and control", t040: "Dashboard with revenue, best sellers and busy days", t041: "Stock tracking, with a nudge when something runs low", t042: "A short summary of what's going on, every morning<span class=\"al\">built before</span>", t043: "An alert when something breaks your own rules<span class=\"al\">built before</span>", t044: "Goals and a weekly score for you or your team<span class=\"al\">built before</span>",
      t045: "On the shop floor", t046: "Big screen with what comes in and goes out today<span class=\"al\">built before</span>", t047: "Packing lists and daily planning", t048: "Checklists for opening, closing and hygiene", t049: "Rosters and staff availability",
      t050: "Why work with me", t051: "Getting a website and smart systems built doesn't have to be expensive, slow or complicated. Here's what you get, and how it compares with the other routes.",
      t052: "One point of contact, from idea to launch", t053: "Design, build, integrations, hosting and maintenance: I do it all myself. You get an answer to every question within two working days.",
      t054: "Custom-built, not from a template", t055: "No standard theme with plug-ins that go out of date, but a site that does exactly what your business needs. That keeps it fast and secure.",
      t056: "AI where it really saves time", t057: "I use AI for the boring work: mail, invoices and orders. Not as a gimmick, but so you have more time for your customers.",
      t058: "Lower costs through a modern way of working", t059: "With AI tools I build faster than the traditional way. You see that in the price, which we agree on up front.",
      t060: "Your business, your data", t061: "Your domain and your customer data are yours. If you ever want to move on, you take everything with you.",
      t062: "Proven, not promised", t063: "Three systems are already running, with mail integrations, live figures and logins. You can see them for yourself below.",
      t064: "Secure from day one", t065: "Secure connection and your own passwords. The dashboard makes suggestions, but never pays or sends anything itself. An invoice with a new account number is flagged so you can check it.",
      t066: "Start small, build up steadily", t067: "We start with one part and run it alongside your current way of working for a few weeks. AI sometimes makes mistakes, so at first you check everything. Only when it works well do we build further.",
      t068: "How it compares, usually", t069: "Topic", t070: "Agency", t071: "Template site builder", t072: "With me",
      t073: "Custom-built", t074: "Yes, but expensive", t075: "No, a template", t076: "Yes", t077: "AI that takes over work", t078: "Often as a paid extra", t079: "Hardly", t080: "Built in where it helps",
      t081: "Point of contact", t082: "Account manager", t083: "Helpdesk or figure it out yourself", t084: "Me, directly", t085: "Price", t086: "Usually high", t087: "Low, but every month", t088: "Fixed price up front",
      t089: "Who does the work", t090: "The agency, in weeks", t091: "You", t092: "Me, quickly",
      t093: "Don't take my word for it, look at what I've built", t094: "I built these and they're live. Click through the screens; names and amounts are sample data.",
      t096: "Website", t097: "Invoices", t098: "Today", t099: "Shop floor",
      t101: "Website and workspace for a plant wholesaler in Nootdorp. The workspace is a working prototype with sample data.",
      t102: "Website in seven languages, where customers can track their order", t103: "Reads quotes, invoices and packing slips from the mail and puts them side by side", t104: "Holds back invoices with new bank details, a duplicate invoice number or no matching order", t105: "Big screen for the shop floor: what comes in and goes out today",
      t106: "For your business: help with checking invoices and one overview of what needs doing today.", t107: "See the demo at campo.vsonsbeek.nl", t108: "You can log in to the workspace with the demo account on the login page.",
      t110: "Market", t111: "Today", t113: "My own investment dashboard, which updates itself every day.",
      t114: "Fetches prices every fifteen minutes and economic data twice a day", t115: "Reads new mail every fifteen minutes, including PDF, Word and Excel attachments", t116: "AI pulls out amounts, dates and actions and writes a short briefing every working day", t117: "Sends an alert as soon as one of my own rules is triggered",
      t118: "<strong>For your business:</strong> figures that update themselves, and a nudge when something happens that you want to know about.", t119: "Private. Happy to show it during an introduction.",
      t121: "Weekly score", t122: "Year", t124: "Personal dashboard that tracks whether I'm on course with my goals.",
      t125: "Weekly score from ticked-off actions, with the week's pace", t126: "Year planner with a colour per week: see at a glance how it's going", t127: "Pulls data from Handelsplan by itself: two systems talking to each other", t128: "PIN login with a lock against guessing",
      t129: "<strong>For your business:</strong> goals for you or your team, and every week you can see whether you're on track.", t130: "Private. Shown here with sample goals.",
      t131: "This is how your business looks online", t132: "Type your business name and choose your trade. You'll see straight away what your own website could look like: with your prices, opening hours and a call button, on your own domain.",
      t133: "Your business name", t134: "What kind of business do you have?", t135: "See the example", t136: "Book an introduction", t137: "See what I've built", t138: "Phone", t139: "Computer", t140: "Copy link to this example",
      t141: "An example with sample prices. I'll make your site with your own photos, prices and story. The example site is in Dutch, like your customers.",
      t142: "Behind the counter: a dashboard that reads your mail", t143: "Invoices, customer questions, reminders and adverts all land in the same inbox. The dashboard reads along, pulls out what matters and notes anything odd on each invoice. You check it and decide.",
      t144: "What comes in", t145: "Read my mail", t146: "What the dashboard read", t147: "What you do today", t148: "Example with made-up names and amounts, from a Dutch shop. The dashboard never pays or sends anything by itself: you decide.",
      t149: "Already have a website? See how it's doing", t150: "Enter the address. Within a few seconds you'll see whether your site is secure, works well on a phone, is easy to find and still looks current. The report is in Dutch.",
      t151: "Your website address", t152: "Check my website", t153: "I only keep the address and the result, to improve the check.",
      t154: "How we work together", t155: "Introduction", t156: "I drop by or we call. You tell me what you do and what you need. It's free and there's no obligation.",
      t157: "Preview on your phone", t158: "You get a first version to look at on your own phone. Whatever isn't right, I change.",
      t159: "Building", t160: "I add your prices, photos and story and connect the site to what you already use, such as your calendar or till. With a dashboard I connect your mail too.",
      t161: "Live and maintained", t162: "Your site goes live on your own domain, such as yourbusiness.nl. If something needs changing later, just send me a message.",
      t163: "What does it cost?", t164: "That depends on what you need. After the introduction you get a fixed price, so you know where you stand.",
      t165: "Website", t166: "Your own domain with prices, opening hours, directions and a call button. Works on every phone. I take care of hosting.",
      t167: "Website with requests", t168: "Everything in the website, plus a form for appointments or orders. Requests arrive in your mail and in your own overview.",
      t169: "Website with dashboard", t170: "Everything above, plus a dashboard that reads your mail, checks invoices and shows what needs doing today.",
      t171: "Good to know", t172: "I'm not good with computers. Can I still do this?", t173: "Yes. I take care of everything, from the web address to the copy. You tell me what should be on it and look along on your phone.",
      t174: "I'm already on Google Maps or a booking site. Why my own website?", t175: "On a platform you're listed between other businesses and the platform decides how you look. On your own site you tell your own story, with your own prices and photos. Your platform's booking button can go on it too.",
      t176: "Can I change things myself later?", t177: "Send me a message and I'll change it. If you want to edit your prices or opening hours yourself, I'll make a simple screen for that.",
      t178: "Is my mail safe if the dashboard reads along?", t179: "The dashboard runs on its own, shielded server with its own database and password. It only reads along and never pays or sends anything without you. I use AI for the reading; I'll tell you beforehand which service that is and what happens to your data.",
      t180: "Can I keep using my current systems?", t181: "Yes, that's the whole idea. Your site connects to your calendar, till, payment provider or accounting software, as long as that system offers an integration, and most do. I find out beforehand what works for you. If it can't be done, I prepare the data neatly for your accountant.",
      t182: "How quickly will my site be live?", t183: "That depends on how much needs to go on it. We agree on a schedule together at the introduction.",
      t184: "I already have a website. Can you improve it?", t185: "Yes. First I look at whether a refresh or a rebuild makes more sense. Try the <a href=\"#check\">website check above</a> in the meantime.",
      t186: "Shall we get acquainted?", t187: "Leave your name and number. I'll call or message you back to arrange a time. I'm happy to come to your shop too.",
      t189: "WEBSITES &amp; SMART SYSTEMS", t191: "Websites and dashboards for small businesses in Utrecht",
      t192: "Your name", t193: "Your business name", t194: "Phone or email", t195: "So I can reach you.", t196: "What can I help you with?",
      t197: "A new website", t198: "Renew my website", t199: "A dashboard for mail and invoices", t200: "Not sure yet", t201: "Anything else? <span class=\"muted\">(optional)</span>", t202: "Leave this field empty",
      t203: "Send message", t204: "I only use your details to get in touch with you.", t206: "WEBSITES &amp; SMART SYSTEMS", t207: "Floris van Sonsbeek<br>Websites and dashboards for small businesses in Utrecht",
      t208: "Possibilities", t209: "Your site", t210: "Dashboard", t211: "Website check",
      t214: "Van Sonsbeek, back to the top", t215: "Main menu", t216: "Choose a type of business", t217: "Previous business", t218: "Next business",
      t219: "Open screenshot full size", t220: "Screens of Campo International", t221: "Open screenshot full size", t222: "Screens of Handelsplan", t223: "Open screenshot full size", t224: "Screens of Koersplan",
      t225: "View the example on", t226: "Example of your website", t227: "Inbox", t228: "Type your business name here", t229: "yourbusiness.nl",
      t230: "Needs attention", t231: "Ready to pay", t232: "Held back", t234: "That can happen, just as it does with people. That's why the dashboard only makes suggestions: it never pays, sends or deletes anything itself. In the first weeks you check everything and we fine-tune it together. If a part doesn't work well enough for your business, I'll tell you honestly and we leave it out.", t235: "Project", t236: "Sheet", t237: "Drawn by", t238: "You first see an example on your own phone. If you like it, you get a fixed price, so you know where you stand in advance. The prices below are starting prices.", t239: "from <b>€895</b>", t240: "Then <b>€25</b> a month for maintenance", t241: "Then <b>€75</b> a month, including the AI service", t242: "from <b>€1,495</b>", t243: "from <b>€2,950</b>", t244: "Maintenance", t245: "<b>€25</b> a month for your site, <b>€75</b> with a dashboard.", t246: "Hosting on servers in Amsterdam", t247: "Updates and security", t248: "Backups of your site and data", t249: "Small changes, such as new prices or opening hours", t250: "With a dashboard: the cost of the AI service", t251: "Cancel any month.", t252: "Small jobs to start with", t253: "Not ready for a whole website yet? Start small, for a fixed price we agree in advance.", t254: "Set up your Google Maps profile", t255: "Opening hours, photos and details correct everywhere.", t256: "Email in your own name", t257: "Like info@yourbusiness.com, on your phone and your computer.", t258: "Move your old site or Facebook page", t259: "To a fast site of your own, at your own address.", t260: "Logo and house style", t261: "A logo, colours and lettering that suit your business.", t262: "For the first three businesses", t263: "You get a lower price. In return I ask for an honest review and whether I may show your site as an example.", t264: "Ask for it", t265: "Know a business owner who could use this?", t266: "Introduce someone and if it becomes a job, you both get a discount.", t267: "Let me know", t268: "What you can count on", t269: "No long contract", t270: "You can cancel maintenance any month. Your site and your domain stay yours.", t271: "See first, then decide", t272: "You see an example on your own phone before you get a price.", t273: "Your site runs in the Netherlands", t274: "On servers in Amsterdam, with a secure connection.", t275: "You know what happens to your mail", t276: "With a dashboard, you hear in advance which AI service reads your mail and where it runs.", t277: "An answer within two working days", t278: "To every question or change, however small.", t279: "What customers say", t280: "Prices", t281: "Send a WhatsApp", t282: "Send a message on WhatsApp", t283: "Call", t284: "Send me a message", t285: "Email", t286: "Home", t287: "All prices and terms", t288: "What I have already built", t289: "Campo International, Handelsplan and Koersplan are already running. On the home page you can click through the screens.", t290: "See my work", t291: "Other kinds of business", t292: "Who it's for", t293: "Tell me what you do and what you need. I'll come by or we'll call; it's free and there's no obligation.", t294: "Selection", t295: "Package", t296: "From", t297: "Request this", t233: "What if the AI makes a mistake?",
      t298: "Examples", t299: "I make websites for small businesses in Utrecht, with your prices, opening hours and a call button, connected to your own calendar, till or accounting software. Want more? Then I'll add a dashboard that reads your mail and checks your invoices.", t300: "See examples for your trade", t301: "Pick your trade and see an example site:", t302: "What I make for you, and what it costs", t304: "All the possibilities at a glance", t305: "What does maintenance include?", t306: "<span class=\"al\">built before</span> means something similar is already running in one of my own systems.", t307: "Why not an agency or a website builder?", t308: "An agency also builds to measure, but is usually more expensive and you deal with an account manager. With a website builder you pay every month and do the work yourself, from a template. With me you get a made-to-measure site for a fixed price agreed up front, with AI where it really saves time. And you talk to me directly.", t309: "Yes. First I look at whether a refresh or a rebuild makes more sense. Try the <a href=\"/voorbeelden#check\">website check</a> in the meantime: within seconds you'll see how your site is doing.", t310: "Examples for your trade", t311: "Pick your trade. You'll see an example site on phone and computer, what it saves you behind the scenes, and links that are useful for your business.", t312: "What your customers see and do", t313: "What it saves you behind the scenes", t314: "Ask for a site like this", t315: "A few sites that are useful in your trade: for yourself, and to point your customers to.", t316: "Useful for every business owner", t317: "Rules, taxes, subsidies and free help. Good to have at hand, even if you don't get a website from me. Most of these sites are in Dutch.", t318: "Links checked in November 2026. I have no ties to these organisations.", t319: "Tell me which example appeals to you and I'll make one for your business. I'll come by or we'll call; it's free and there's no obligation.", t320: "See an example site", t321: "See the example site of a plumber", t322: "See the example site of a barber", t323: "Try the demo with sample mail", t324: "What it does", t325: "We start with one part and let it run alongside your work for a few weeks. At first you check everything.", t326: "From being found to the shop floor", t327: "Don't need a whole website yet? Start with one thing.", t328: "Dashboard demo", t329: "You'll see the name straight away on the site and on the facade.",
      t330: "Connected to what you already use",
      t331: "Your booking system, till and accounting software stay in use. Your website and dashboard connect to them, so appointments, payments and invoices end up in the right place by themselves. No switching, and nothing to enter twice.",
      t332: "Your website",
      t333: "and your dashboard",
      t334: "Calendar and bookings",
      t335: "appointments",
      t336: "Customers pick a free slot on your site. The appointment goes straight into your own calendar.",
      t337: "Google Calendar",
      t338: "Payments",
      t339: "payments",
      t340: "Pay up front or a deposit with iDEAL. The money goes to your own account.",
      t341: "iDEAL via Mollie",
      t342: "Accounting",
      t343: "invoices",
      t344: "Invoices and payments go to your accounting software by themselves. No more retyping.",
      t345: "Till and web shop",
      t346: "products and sales",
      t347: "Your site shows your own products and stock. Orders go into your till or web shop.",
      t348: "Mail and WhatsApp",
      t349: "messages",
      t350: "Confirmations and reminders go out through your own mail or WhatsApp. The dashboard reads your mail along with you.",
      t351: "Google",
      t352: "hours and reviews",
      t353: "Your opening hours are right everywhere, and new reviews show up in your dashboard straight away.",
      t354: "Google Business Profile",
      t356: "Software for your trade",
      t357: "data from your trade",
      t358: "Practice software, a workshop schedule or the vehicle register: I connect to what's usual in your line of work.",
      t359: "RDW vehicle register",
      t360: "Something else?",
      t361: "spare",
      t362: "Using something that isn't listed here? Tell me, and I'll find out whether and how it can be done.",
      t363: "Ask me",
      t364: "Check first, then promise",
      t365: "An integration works if your system offers one, and most do. I check before we start. If it can't be done, I'll tell you honestly and, for example, put your booking button on your site.",
      t366: "Your data stays where it is",
      t367: "Appointments stay in your calendar, payments with your payment provider and invoices in your accounting. Nothing has to move.",
      t368: "No surprises in the costs",
      t369: "The integration is part of the fixed price. If a service charges something itself, such as per payment or per message, you'll hear about it beforehand.",
      t371: "The booking button or web shop you already have, such as Salonized or Shopify",
      t372: "Appointments and orders straight into your own calendar or till",
      t373: "Invoices passed on to your accounting, such as Moneybird or Exact Online",
      t374: "You keep your own systems",
      t375: "Your calendar, till and accounting stay. Your site connects to them, so you don't have to switch.",
      t376: "Integrations",
      t377: "Works with your own systems",
      t378: "How integrations work",
      ui: {
        title: "Websites and smart systems for small businesses | Van Sonsbeek",
        desc: "I build websites and AI-powered systems that read your mail, check invoices and keep track of orders.",
        ongelezen: "Not read yet", bonLeeg: "Press <strong>Read my mail</strong>. You'll then see, per message, what the dashboard pulled out and what it checked.",
        lezen: "Reading", opnieuw: "Again", leesMail: "Read my mail", todoLeeg: "Nothing yet. The dashboard lists what you need to do today here.",
        kopieer: "Copy link to this example", gekopieerd: "Link copied",
        checkLeeg: "Enter your website address, for example yourbusiness.nl.", checkBezig: "Fetching {host} and checking it…", score: "Score: <strong>{n}</strong> out of 100.",
        checkGoed: "Your site is in good shape. Want a dashboard with it, or a fresh look?", checkSlecht: "Want me to fix this? I'll happily make a proposal, with a fixed price.",
        voorstel: "Ask for a proposal", checkFout: "The check didn't work. Is your internet connection OK?", checkPreview: "The website check doesn't work in this preview. On the live site it really fetches your page.",
        naamNodig: "Please enter your name.", contactNodig: "Enter a phone number or email address where I can reach you.", versturen: "Sending…", stuur: "Send message",
        bedankt: "Thanks, {naam}.", bedanktTekst: "Your message has arrived. I'll get in touch as soon as possible.", fout: "Sending didn't work. Please try again.", preview: "This is a preview: nothing is sent. On the live site your message will arrive.",
        onderschrift: "Examples of what's possible, not a fixed package. Together we choose what fits your business and start with one part.", gecheckt: "I checked {host} (score {n}).", blad: "{n} of {m}", brTitel: "A website for {groep}", brLead: "I build websites and smart systems for {groep} in and around Utrecht. Below you can see what that can mean in practice.", brMeer: "More about websites for {groep}", brDocTitel: "Website for {groep} in Utrecht | Van Sonsbeek", vbKop: "This is what it looks like", wieK: "Your customer sees this", wieJ: "For you", wieJlang: "For you, behind the scenes", kies: "Choose", gekozen: "Chosen", kiesLabel: "Choose {t}", keuzeNiets: "Nothing chosen yet", keuzeEen: "1 item", keuzeMeer: "{n} items", keuzeHint: "Pick what you want from the list. The title block works out which package fits.", keuzeTip: "Tip: start small. The rest can always come later.", pk1: "Website", pk2: "Website with requests", pk3: "Website with dashboard", pp1: "€895", pp2: "€1,495", pp3: "€2,950", wensBericht: "I'm interested in a website for {groep}, with: {lijst}.", wensLeeg: "I'm interested in a website for {groep}.", metaWie: "For whom", metaPakket: "Included in", vanafPrijs: "from {p}", linkK: "For your customers", linkJ: "For you", linkNieuw: "opens in a new tab", vbPlan: "See the floor plan for {groep}", vbLinksKop: "Useful for {groep}", demoZaak: "Below: a normal morning's mail for {zaak}.", wensVb: "I saw the example site ({soort}) and would like something like it for my business.", wensVbNaam: "I saw the example site ({soort}) and would like something like it for {naam}.", titleVb: "Examples by trade: websites and useful links | Van Sonsbeek", descVb: "See an example site for your trade on phone and computer, try the dashboard that reads your mail and find useful links for your business.", wensKoppel: "I'd like to know whether my website can connect to the system I use now, which is: "
      }
    },
    de: {
      t001: "Zum Inhalt", t003: "WEBSITES &amp; SMARTE SYSTEME", t004: "Möglichkeiten", t005: "Warum ich", t006: "Meine Arbeit", t007: "Ihre Website", t008: "Dashboard", t009: "Fragen", t010: "Kennenlernen",
      t011: "Eine schöne Website, und kluge Hilfe im Hintergrund",
      t012: "Ich baue Websites und KI-gestützte Systeme für Betriebe mit Charakter. Sie lesen Ihre Mails, prüfen Rechnungen und behalten Bestellungen im Blick, damit Sie Zeit für Ihre Kunden haben. Wählen Sie unten eine Branche und sehen Sie, was das in der Praxis bedeutet.",
      t013: "Kennenlerngespräch vereinbaren", t014: "Alle Möglichkeiten ansehen", t015: "Beispiele, was möglich ist, kein festes Paket. Gemeinsam wählen wir, was zu Ihrem Betrieb passt, und beginnen mit einem Baustein.",
      t016: "Was ich für so einen Betrieb bauen kann",
      t017: "Das sind Ideen, kein festes Paket. Gemeinsam wählen wir zuerst das eine, was Ihnen am meisten Zeit spart, und testen es in Ihrem Betrieb. Erst wenn das gut funktioniert, bauen wir aus. <em>Schon umgesetzt</em> heißt: Etwas Ähnliches habe ich bereits für eines meiner eigenen Systeme gebaut.",
      t018: "Gefunden werden", t019: "Website nach Maß, unter Ihrer eigenen Adresse", t020: "Mehrsprachige Website für Touristen oder Kunden aus dem Ausland<span class=\"al\">schon umgesetzt</span>", t021: "Texte, die bei Google gut gefunden werden", t022: "Öffnungszeiten und Angaben überall gleich, auch in Google Maps",
      t023: "Verkaufen und bestellen", t024: "Online bestellen, reservieren oder Termine buchen", t025: "Pakete und Abos, etwa eine wöchentliche Gemüsekiste", t026: "Kunden verfolgen ihre Bestellung selbst<span class=\"al\">schon umgesetzt</span>", t027: "Eine Nachricht oder Mail, sobald etwas fertig ist",
      t028: "Mails und Verwaltung", t029: "Mails lesen und sortieren: Rechnungen, Fragen, Angebote<span class=\"al\">schon umgesetzt</span>", t030: "Rechnungen prüfen auf Betrag, MwSt., Bankverbindung und Doppelte<span class=\"al\">schon umgesetzt</span>", t031: "Belege und Lieferscheine mit dem Handy scannen", t032: "Alles ordentlich für Ihren Steuerberater vorbereitet", t033: "Angebote und Rechnungen im eigenen Design",
      t034: "Kundenkontakt", t035: "Antwortentwürfe auf Fragen und Bewertungen, in Ihrem Ton", t036: "Ein Newsletter mit dem Angebot der Woche", t037: "Beiträge für Instagram oder Facebook aus einem einzigen Foto", t038: "Erinnerungen an Termine und offene Zahlungen",
      t039: "Überblick und Steuerung", t040: "Dashboard mit Umsatz, Bestsellern und vollen Tagen", t041: "Bestand im Blick, mit Hinweis, wenn etwas knapp wird", t042: "Jeden Morgen eine kurze Zusammenfassung der Lage<span class=\"al\">schon umgesetzt</span>", t043: "Eine Meldung, wenn etwas von Ihren Regeln abweicht<span class=\"al\">schon umgesetzt</span>", t044: "Ziele und ein Wochenwert für Sie oder Ihr Team<span class=\"al\">schon umgesetzt</span>",
      t045: "Im Betrieb", t046: "Großer Bildschirm mit allem, was heute ankommt und rausgeht<span class=\"al\">schon umgesetzt</span>", t047: "Packlisten und Tagesplanung", t048: "Checklisten für Öffnen, Schließen und Hygiene", t049: "Dienstpläne und Verfügbarkeit des Personals",
      t050: "Warum mit mir arbeiten", t051: "Eine Website und smarte Systeme müssen nicht teuer, langsam oder kompliziert sein. Das bekommen Sie, und so schneidet es im Vergleich ab.",
      t052: "Ein Ansprechpartner, von der Idee bis online", t053: "Design, Umsetzung, Anbindungen, Hosting und Wartung mache ich selbst. Auf jede Frage bekommen Sie innerhalb von zwei Werktagen eine Antwort.",
      t054: "Maßgeschneidert, nicht aus der Vorlage", t055: "Kein Standard-Theme mit veraltenden Plug-ins, sondern eine Website, die genau das tut, was Ihr Betrieb braucht. So bleibt sie schnell und sicher.",
      t056: "KI, wo sie wirklich Zeit spart", t057: "Ich setze KI für die lästige Arbeit ein: Mails, Rechnungen und Bestellungen. Nicht als Spielerei, sondern damit Sie mehr Zeit für Ihre Kunden haben.",
      t058: "Niedrigere Kosten durch moderne Arbeitsweise", t059: "Mit KI-Werkzeugen baue ich schneller als auf dem klassischen Weg. Das sehen Sie im Preis, den wir vorab vereinbaren.",
      t060: "Ihr Betrieb, Ihre Daten", t061: "Ihre Domain und Ihre Kundendaten gehören Ihnen. Wollen Sie irgendwann wechseln, nehmen Sie alles mit.",
      t062: "Bewiesen, nicht versprochen", t063: "Drei Systeme laufen bereits, mit Mail-Anbindung, Live-Zahlen und Login. Sie können sie unten selbst ansehen.",
      t064: "Sicher vom ersten Tag an", t065: "Verschlüsselte Verbindung und eigene Passwörter. Das Dashboard macht Vorschläge, bezahlt oder versendet aber nie selbst etwas. Eine Rechnung mit einer neuen Kontonummer wird markiert, damit Sie sie prüfen.",
      t066: "Klein anfangen, in Ruhe ausbauen", t067: "Wir starten mit einem Baustein und lassen ihn einige Wochen neben Ihrer bisherigen Arbeitsweise mitlaufen. KI macht manchmal Fehler, darum prüfen Sie anfangs alles. Erst wenn es gut funktioniert, bauen wir weiter.",
      t068: "Der Vergleich, meistens", t069: "Thema", t070: "Agentur", t071: "Baukasten-Website", t072: "Mit mir",
      t073: "Maßgeschneidert", t074: "Ja, aber teuer", t075: "Nein, eine Vorlage", t076: "Ja", t077: "KI, die Arbeit übernimmt", t078: "Oft als teures Extra", t079: "Kaum", t080: "Eingebaut, wo es hilft",
      t081: "Ansprechpartner", t082: "Account-Manager", t083: "Helpdesk oder selbst herausfinden", t084: "Ich, direkt", t085: "Preis", t086: "Meist hoch", t087: "Niedrig, aber jeden Monat", t088: "Festpreis vorab",
      t089: "Wer macht die Arbeit", t090: "Die Agentur, in Wochen", t091: "Sie selbst", t092: "Ich, schnell",
      t093: "Glauben Sie nicht meinen Worten, sondern meinen Produkten", t094: "Das habe ich gebaut, und es ist online. Klicken Sie sich durch; Namen und Beträge sind Beispieldaten.",
      t096: "Website", t097: "Rechnungen", t098: "Heute", t099: "Betrieb",
      t101: "Website und Arbeitsplatz für einen Pflanzengroßhandel in Nootdorp. Der Arbeitsplatz ist ein funktionierender Prototyp mit Beispieldaten.",
      t102: "Website in sieben Sprachen, auf der Kunden ihre Bestellung verfolgen", t103: "Liest Angebote, Rechnungen und Lieferscheine aus den Mails und legt sie nebeneinander", t104: "Hält Rechnungen mit neuer Bankverbindung, doppelter Rechnungsnummer oder ohne Bestellung zurück", t105: "Großer Bildschirm für den Betrieb: was heute ankommt und rausgeht",
      t106: "Für Ihren Betrieb: Hilfe beim Prüfen von Rechnungen und ein Überblick über alles, was heute ansteht.", t107: "Demo ansehen auf campo.vsonsbeek.nl", t108: "Mit dem Demo-Konto auf der Login-Seite können Sie sich anmelden.",
      t110: "Markt", t111: "Heute", t113: "Mein eigenes Anlage-Dashboard, das sich jeden Tag selbst aktualisiert.",
      t114: "Holt alle fünfzehn Minuten Kurse und zweimal täglich Wirtschaftsdaten", t115: "Liest alle fünfzehn Minuten neue Mails, auch Anhänge wie PDF, Word und Excel", t116: "KI zieht Beträge, Termine und Aufgaben heraus und schreibt jeden Werktag ein kurzes Briefing", t117: "Meldet sich, sobald eine meiner eigenen Regeln greift",
      t118: "<strong>Für Ihren Betrieb:</strong> Zahlen, die sich selbst aktualisieren, und ein Hinweis, wenn etwas passiert, das Sie wissen wollen.", t119: "Privat. Ich zeige es gern beim Kennenlernen.",
      t121: "Wochenwert", t122: "Jahr", t124: "Persönliches Dashboard, das zeigt, ob ich bei meinen Zielen auf Kurs bin.",
      t125: "Wochenwert aus abgehakten Aufgaben, mit dem Tempo der Woche", t126: "Jahresplaner mit einer Farbe pro Woche: auf einen Blick sehen, wie es läuft", t127: "Holt sich selbst Daten aus Handelsplan: zwei Systeme, die miteinander sprechen", t128: "Login mit PIN und Sperre gegen Raten",
      t129: "<strong>Für Ihren Betrieb:</strong> Ziele für Sie oder Ihr Team, und jede Woche sichtbar, ob Sie im Plan liegen.", t130: "Privat. Hier mit Beispielzielen gezeigt.",
      t131: "So sieht Ihr Betrieb online aus", t132: "Geben Sie den Namen Ihres Betriebs ein und wählen Sie Ihre Branche. Sie sehen sofort, wie Ihre eigene Website aussehen kann: mit Preisen, Öffnungszeiten und Anruf-Knopf, unter Ihrer eigenen Adresse.",
      t133: "Name Ihres Betriebs", t134: "Was für einen Betrieb haben Sie?", t135: "Beispiel ansehen", t136: "Kennenlerngespräch vereinbaren", t137: "Ansehen, was ich gebaut habe", t138: "Handy", t139: "Computer", t140: "Link zu diesem Beispiel kopieren",
      t141: "Ein Beispiel mit Beispielpreisen. Ihre Website mache ich mit Ihren eigenen Fotos, Preisen und Ihrer Geschichte. Die Beispielseite ist auf Niederländisch, wie Ihre Kunden.",
      t142: "Hinter der Theke: ein Dashboard, das Ihre Mails liest", t143: "Rechnungen, Kundenfragen, Mahnungen und Werbung landen alle im selben Postfach. Das Dashboard liest mit, zieht das Wichtige heraus und vermerkt bei jeder Rechnung, was auffällt. Sie prüfen und entscheiden.",
      t144: "Was hereinkommt", t145: "Meine Mails lesen", t146: "Was das Dashboard gelesen hat", t147: "Was Sie heute tun", t148: "Beispiel mit erfundenen Namen und Beträgen, aus einem niederländischen Laden. Das Dashboard bezahlt oder versendet nie selbst: Sie entscheiden.",
      t149: "Schon eine Website? Sehen Sie, wie gut sie ist", t150: "Geben Sie die Adresse ein. In wenigen Sekunden sehen Sie, ob Ihre Website sicher ist, auf dem Handy gut funktioniert, leicht zu finden ist und aktuell wirkt. Der Bericht ist auf Niederländisch.",
      t151: "Adresse Ihrer Website", t152: "Meine Website prüfen", t153: "Ich speichere nur die Adresse und das Ergebnis, um die Prüfung zu verbessern.",
      t154: "So arbeiten wir zusammen", t155: "Kennenlernen", t156: "Ich komme vorbei oder wir telefonieren. Sie erzählen, was Sie tun und was Sie brauchen. Das ist kostenlos und unverbindlich.",
      t157: "Vorschau auf Ihrem Handy", t158: "Sie bekommen eine erste Version zum Ansehen auf Ihrem eigenen Handy. Was nicht passt, ändere ich.",
      t159: "Umsetzung", t160: "Ich setze Ihre Preise, Fotos und Ihre Geschichte ein und binde die Website an das an, was Sie schon nutzen, etwa Ihren Kalender oder Ihre Kasse. Bei einem Dashboard binde ich auch Ihre Mails an.",
      t161: "Online und gepflegt", t162: "Ihre Website kommt unter Ihre eigene Adresse, etwa ihrbetrieb.de. Muss später etwas geändert werden, schicken Sie mir einfach eine Nachricht.",
      t163: "Was kostet das?", t164: "Das hängt davon ab, was Sie brauchen. Nach dem Kennenlernen bekommen Sie einen Festpreis, damit Sie vorher wissen, woran Sie sind.",
      t165: "Website", t166: "Ihre eigene Adresse mit Preisen, Öffnungszeiten, Anfahrt und Anruf-Knopf. Funktioniert auf jedem Handy. Das Hosting übernehme ich.",
      t167: "Website mit Anfragen", t168: "Alles von der Website, plus ein Formular für Termine oder Bestellungen. Anfragen kommen per Mail und in Ihre eigene Übersicht.",
      t169: "Website mit Dashboard", t170: "Alles oben, plus ein Dashboard, das Ihre Mails liest, Rechnungen prüft und zeigt, was heute ansteht.",
      t171: "Gut zu wissen", t172: "Ich bin nicht gut mit Computern. Geht das trotzdem?", t173: "Ja. Ich kümmere mich um alles, von der Webadresse bis zu den Texten. Sie sagen, was drauf soll, und schauen auf Ihrem Handy mit.",
      t174: "Ich bin schon bei Google Maps oder einer Buchungsseite. Wozu eine eigene Website?", t175: "Auf einer Plattform stehen Sie zwischen anderen Betrieben, und die Plattform bestimmt, wie Sie aussehen. Auf Ihrer eigenen Website erzählen Sie Ihre Geschichte, mit eigenen Preisen und Fotos. Den Buchungsknopf Ihrer Plattform können wir trotzdem einbauen.",
      t176: "Kann ich später selbst etwas ändern?", t177: "Schicken Sie mir eine Nachricht, und ich ändere es. Wenn Sie Preise oder Öffnungszeiten selbst ändern möchten, baue ich dafür eine einfache Maske.",
      t178: "Sind meine Mails sicher, wenn das Dashboard mitliest?", t179: "Das Dashboard läuft auf einem eigenen, abgeschirmten Server mit eigener Datenbank und eigenem Passwort. Es liest nur mit und bezahlt oder versendet nichts ohne Sie. Zum Lesen nutze ich KI; vorher sage ich Ihnen, welcher Dienst das ist und was mit Ihren Daten passiert.",
      t180: "Kann ich meine jetzigen Systeme weiter nutzen?", t181: "Ja, genau darum geht es. Ihre Website wird an Ihren Kalender, Ihre Kasse, Ihren Zahlungsdienst oder Ihre Buchhaltung angebunden, sofern das System eine Schnittstelle anbietet, und die meisten tun das. Ich kläre vorher, was bei Ihnen geht. Geht es nicht, bereite ich die Daten sauber für Ihren Steuerberater vor.",
      t182: "Wie schnell ist meine Website online?", t183: "Das hängt davon ab, wie viel drauf soll. Beim Kennenlernen vereinbaren wir gemeinsam einen Zeitplan.",
      t184: "Ich habe schon eine Website. Können Sie sie verbessern?", t185: "Ja. Zuerst schaue ich, ob Auffrischen oder Neubauen sinnvoller ist. Machen Sie schon mal den <a href=\"#check\">Website-Check oben</a>.",
      t186: "Wollen wir uns kennenlernen?", t187: "Hinterlassen Sie Ihren Namen und Ihre Nummer. Ich rufe zurück oder schreibe Ihnen, um einen Termin abzustimmen. Ich komme auch gern in Ihren Laden.",
      t189: "WEBSITES &amp; SMARTE SYSTEME", t191: "Websites und Dashboards für kleine Betriebe in Utrecht",
      t192: "Ihr Name", t193: "Name Ihres Betriebs", t194: "Telefon oder E-Mail", t195: "So kann ich Sie erreichen.", t196: "Wobei kann ich helfen?",
      t197: "Eine neue Website", t198: "Meine Website erneuern", t199: "Ein Dashboard für Mails und Rechnungen", t200: "Weiß ich noch nicht", t201: "Noch etwas? <span class=\"muted\">(optional)</span>", t202: "Dieses Feld leer lassen",
      t203: "Nachricht senden", t204: "Ich nutze Ihre Daten nur, um mit Ihnen Kontakt aufzunehmen.", t206: "WEBSITES &amp; SMARTE SYSTEME", t207: "Floris van Sonsbeek<br>Websites und Dashboards für kleine Betriebe in Utrecht",
      t208: "Möglichkeiten", t209: "Ihre Website", t210: "Dashboard", t211: "Website-Check",
      t214: "Van Sonsbeek, zum Anfang", t215: "Hauptmenü", t216: "Branche wählen", t217: "Vorheriger Betrieb", t218: "Nächster Betrieb",
      t219: "Screenshot groß öffnen", t220: "Ansichten von Campo International", t221: "Screenshot groß öffnen", t222: "Ansichten von Handelsplan", t223: "Screenshot groß öffnen", t224: "Ansichten von Koersplan",
      t225: "Beispiel ansehen auf", t226: "Beispiel Ihrer Website", t227: "Postfach", t228: "Name Ihres Betriebs hier eingeben", t229: "ihrbetrieb.de",
      t230: "Braucht Aufmerksamkeit", t231: "Bereit zur Zahlung", t232: "Zurückgehalten", t234: "Das kann passieren, genau wie bei Menschen. Deshalb macht das Dashboard nur Vorschläge: Es bezahlt, versendet und löscht nichts selbst. In den ersten Wochen prüfen Sie alles, und wir justieren gemeinsam nach. Funktioniert ein Baustein für Ihren Betrieb nicht gut genug, sage ich das ehrlich und wir lassen ihn weg.", t235: "Projekt", t236: "Blatt", t237: "Gezeichnet", t238: "Sie sehen zuerst ein Beispiel auf Ihrem eigenen Handy. Gefällt es Ihnen, bekommen Sie einen Festpreis, damit Sie vorher wissen, woran Sie sind. Unten stehen Ab-Preise.", t239: "ab <b>895 €</b>", t240: "Danach <b>25 €</b> pro Monat für die Wartung", t241: "Danach <b>75 €</b> pro Monat, inklusive KI-Dienst", t242: "ab <b>1.495 €</b>", t243: "ab <b>2.950 €</b>", t244: "Wartung", t245: "<b>25 €</b> pro Monat für Ihre Website, <b>75 €</b> mit Dashboard.", t246: "Hosting auf Servern in Amsterdam", t247: "Updates und Sicherheit", t248: "Backups Ihrer Website und Daten", t249: "Kleine Änderungen, etwa neue Preise oder Öffnungszeiten", t250: "Mit Dashboard: die Kosten des KI-Dienstes", t251: "Monatlich kündbar.", t252: "Kleine Aufträge für den Anfang", t253: "Noch nicht bereit für eine ganze Website? Fangen Sie klein an, zu einem Festpreis, den wir vorab vereinbaren.", t254: "Google-Maps-Profil einrichten", t255: "Öffnungszeiten, Fotos und Angaben stimmen überall.", t256: "E-Mail mit eigenem Namen", t257: "Wie info@ihrbetrieb.de, auf Handy und Computer.", t258: "Alte Website oder Facebook-Seite umziehen", t259: "Auf eine eigene, schnelle Website unter Ihrer eigenen Adresse.", t260: "Logo und Erscheinungsbild", t261: "Ein Logo, Farben und Schriften, die zu Ihrem Betrieb passen.", t262: "Für die ersten drei Betriebe", t263: "Sie bekommen einen niedrigeren Preis. Im Gegenzug bitte ich um eine ehrliche Bewertung und darum, Ihre Website als Beispiel zeigen zu dürfen.", t264: "Jetzt anfragen", t265: "Kennen Sie jemanden, dem das helfen würde?", t266: "Empfehlen Sie jemanden und wird daraus ein Auftrag, bekommen Sie beide einen Rabatt.", t267: "Sagen Sie mir Bescheid", t268: "Worauf Sie sich verlassen können", t269: "Kein langer Vertrag", t270: "Die Wartung ist monatlich kündbar. Website und Domain bleiben Ihre.", t271: "Erst sehen, dann entscheiden", t272: "Sie sehen ein Beispiel auf Ihrem eigenen Handy, bevor Sie einen Preis bekommen.", t273: "Ihre Website läuft in den Niederlanden", t274: "Auf Servern in Amsterdam, mit verschlüsselter Verbindung.", t275: "Sie wissen, was mit Ihren Mails passiert", t276: "Beim Dashboard erfahren Sie vorab, welcher KI-Dienst Ihre Mails liest und wo er läuft.", t277: "Antwort innerhalb von zwei Werktagen", t278: "Auf jede Frage oder Änderung, auch wenn sie klein ist.", t279: "Was Kunden sagen", t280: "Preise", t281: "WhatsApp schreiben", t282: "Nachricht über WhatsApp senden", t283: "Anrufen", t284: "Schreiben Sie mir", t285: "E-Mail", t286: "Startseite", t287: "Alle Preise und Bedingungen", t288: "Was ich schon gebaut habe", t289: "Campo International, Handelsplan und Koersplan laufen bereits. Auf der Startseite klicken Sie sich durch die Bildschirme.", t290: "Meine Arbeit ansehen", t291: "Andere Branchen", t292: "Für wen", t293: "Erzählen Sie, was Sie machen und was Sie brauchen. Ich komme vorbei oder wir telefonieren; das ist kostenlos und unverbindlich.", t294: "Auswahl", t295: "Paket", t296: "Ab", t297: "Anfragen", t233: "Was, wenn die KI einen Fehler macht?",
      t298: "Beispiele", t299: "Ich mache Websites für kleine Betriebe in Utrecht, mit Ihren Preisen, Öffnungszeiten und einem Anruf-Knopf, angebunden an Ihren eigenen Kalender, Ihre Kasse oder Buchhaltung. Wenn Sie mehr möchten, baue ich ein Dashboard dazu, das Ihre Mails liest und Ihre Rechnungen prüft.", t300: "Beispiele für Ihre Branche ansehen", t301: "Wählen Sie Ihre Branche und sehen Sie eine Beispielseite:", t302: "Was ich für Sie mache, und was es kostet", t304: "Alle Möglichkeiten auf einen Blick", t305: "Was ist in der Wartung enthalten?", t306: "<span class=\"al\">schon umgesetzt</span> heißt: Etwas Ähnliches läuft bereits in einem meiner eigenen Systeme.", t307: "Warum nicht eine Agentur oder ein Website-Baukasten?", t308: "Eine Agentur baut auch maßgeschneidert, ist aber meist teurer, und Sie sprechen mit einem Kundenbetreuer. Bei einem Baukasten zahlen Sie jeden Monat und machen die Arbeit selbst, mit einer Vorlage. Bei mir bekommen Sie eine maßgeschneiderte Website zum vorab vereinbarten Festpreis, mit KI dort, wo sie wirklich Zeit spart. Und Sie sprechen direkt mit mir.", t309: "Ja. Zuerst schaue ich, ob Auffrischen oder Neubauen sinnvoller ist. Machen Sie schon mal den <a href=\"/voorbeelden#check\">Website-Check</a>: In wenigen Sekunden sehen Sie, wie Ihre Website dasteht.", t310: "Beispiele für Ihre Branche", t311: "Wählen Sie Ihre Branche. Sie sehen eine Beispielseite auf Handy und Computer, was sie Ihnen hinter den Kulissen erspart, und Links, die für Ihren Betrieb nützlich sind.", t312: "Was Ihre Kunden sehen und tun", t313: "Was es Ihnen hinter den Kulissen erspart", t314: "So eine Website anfragen", t315: "Einige Websites, die in Ihrer Branche nützlich sind: für Sie selbst und um Ihre Kunden dorthin zu verweisen.", t316: "Nützlich für alle Unternehmer", t317: "Regeln, Steuern, Förderungen und kostenlose Hilfe. Gut griffbereit zu haben, auch wenn Sie keine Website bei mir bestellen. Die meisten Seiten sind auf Niederländisch.", t318: "Links geprüft im November 2026. Ich habe keine Verbindung zu diesen Organisationen.", t319: "Sagen Sie mir, welches Beispiel Sie anspricht, dann mache ich eines für Ihren Betrieb. Ich komme vorbei oder wir telefonieren; das ist kostenlos und unverbindlich.", t320: "Beispielseite ansehen", t321: "Beispielseite eines Installateurs ansehen", t322: "Beispielseite eines Friseurs ansehen", t323: "Demo mit Beispielmails ausprobieren", t324: "Was es macht", t325: "Wir starten mit einem Baustein und lassen ihn einige Wochen mitlaufen. Anfangs prüfen Sie alles.", t326: "Vom Gefundenwerden bis zur Werkstatt", t327: "Noch keine ganze Website nötig? Fangen Sie mit einer Sache an.", t328: "Dashboard-Demo", t329: "Sie sehen den Namen sofort auf der Seite und an der Fassade.",
      t330: "Angebunden an das, was Sie schon nutzen",
      t331: "Ihr Buchungssystem, Ihre Kasse und Ihre Buchhaltung bleiben in Gebrauch. Website und Dashboard werden daran angebunden, sodass Termine, Zahlungen und Rechnungen von selbst am richtigen Ort landen. Kein Umstieg und nichts doppelt eintippen.",
      t332: "Ihre Website",
      t333: "und Ihr Dashboard",
      t334: "Kalender und Buchungen",
      t335: "Termine",
      t336: "Kunden wählen auf Ihrer Website eine freie Zeit. Der Termin steht sofort in Ihrem eigenen Kalender.",
      t337: "Google Kalender",
      t338: "Bezahlen",
      t339: "Zahlungen",
      t340: "Vorab bezahlen oder eine Anzahlung mit iDEAL. Das Geld kommt auf Ihr eigenes Konto.",
      t341: "iDEAL über Mollie",
      t342: "Buchhaltung",
      t343: "Rechnungen",
      t344: "Rechnungen und Zahlungen gehen von selbst in Ihr Buchhaltungsprogramm. Abtippen ist nicht mehr nötig.",
      t345: "Kasse und Webshop",
      t346: "Angebot und Verkäufe",
      t347: "Ihre Website zeigt Ihr eigenes Angebot und Ihren Bestand. Bestellungen landen in Ihrer Kasse oder Ihrem Webshop.",
      t348: "Mail und WhatsApp",
      t349: "Nachrichten",
      t350: "Bestätigungen und Erinnerungen gehen über Ihre eigene Mail oder WhatsApp raus. Das Dashboard liest Ihre Mails mit.",
      t351: "Google",
      t352: "Zeiten und Bewertungen",
      t353: "Ihre Öffnungszeiten stimmen überall, und neue Bewertungen sehen Sie sofort in Ihrem Dashboard.",
      t354: "Google Unternehmensprofil",
      t356: "Software für Ihre Branche",
      t357: "Daten aus Ihrer Branche",
      t358: "Praxissoftware, Werkstattplanung oder das Fahrzeugregister: Ich binde an, was in Ihrer Branche üblich ist.",
      t359: "RDW-Fahrzeugregister",
      t360: "Etwas anderes?",
      t361: "Reserve",
      t362: "Nutzen Sie etwas, das hier nicht steht? Sagen Sie es mir, dann kläre ich, ob und wie es geht.",
      t363: "Fragen Sie nach",
      t364: "Erst klären, dann versprechen",
      t365: "Eine Anbindung klappt, wenn Ihr System eine Schnittstelle anbietet, und die meisten tun das. Ich kläre das, bevor wir anfangen. Geht es nicht, sage ich es ehrlich und baue zum Beispiel Ihren Buchungsknopf in die Website ein.",
      t366: "Ihre Daten bleiben, wo sie sind",
      t367: "Termine bleiben in Ihrem Kalender, Zahlungen bei Ihrem Zahlungsdienst und Rechnungen in Ihrer Buchhaltung. Nichts muss umziehen.",
      t368: "Keine Überraschungen bei den Kosten",
      t369: "Die Anbindung ist im Festpreis enthalten. Berechnet ein Dienst selbst etwas, etwa pro Zahlung oder pro Nachricht, erfahren Sie das vorher.",
      t371: "Der Buchungsknopf oder Webshop, den Sie schon haben, etwa Salonized oder Shopify",
      t372: "Termine und Bestellungen direkt in Ihrem eigenen Kalender oder Ihrer Kasse",
      t373: "Rechnungen weiter an Ihre Buchhaltung, etwa Moneybird oder Exact Online",
      t374: "Sie behalten Ihre eigenen Systeme",
      t375: "Kalender, Kasse und Buchhaltung bleiben. Ihre Website wird daran angebunden, Sie müssen also nicht umsteigen.",
      t376: "Anbindungen",
      t377: "Arbeitet mit Ihren eigenen Systemen",
      t378: "So funktionieren Anbindungen",
      ui: {
        title: "Websites und smarte Systeme für kleine Betriebe | Van Sonsbeek",
        desc: "Ich baue Websites und KI-gestützte Systeme, die Mails lesen, Rechnungen prüfen und Bestellungen im Blick behalten.",
        ongelezen: "Noch nicht gelesen", bonLeeg: "Drücken Sie <strong>Meine Mails lesen</strong>. Dann sehen Sie pro Nachricht, was das Dashboard herausgezogen und geprüft hat.",
        lezen: "Liest", opnieuw: "Nochmal", leesMail: "Meine Mails lesen", todoLeeg: "Noch nichts. Hier zeigt das Dashboard, was Sie heute tun müssen.",
        kopieer: "Link zu diesem Beispiel kopieren", gekopieerd: "Link kopiert",
        checkLeeg: "Geben Sie die Adresse Ihrer Website ein, zum Beispiel ihrbetrieb.de.", checkBezig: "Ich hole {host} und prüfe die Seite…", score: "Wert: <strong>{n}</strong> von 100.",
        checkGoed: "Ihre Website ist in gutem Zustand. Möchten Sie ein Dashboard dazu, oder einen frischen Look?", checkSlecht: "Soll ich das beheben? Ich mache gern ein Angebot, zum Festpreis.",
        voorstel: "Angebot anfragen", checkFout: "Die Prüfung hat nicht geklappt. Ist Ihre Internetverbindung in Ordnung?", checkPreview: "In dieser Vorschau funktioniert der Website-Check nicht. Auf der Live-Seite wird Ihre Seite wirklich geprüft.",
        naamNodig: "Bitte geben Sie Ihren Namen ein.", contactNodig: "Geben Sie eine Telefonnummer oder E-Mail-Adresse ein, unter der ich Sie erreiche.", versturen: "Wird gesendet…", stuur: "Nachricht senden",
        bedankt: "Danke, {naam}.", bedanktTekst: "Ihre Nachricht ist angekommen. Ich melde mich so schnell wie möglich.", fout: "Senden hat nicht geklappt. Bitte versuchen Sie es noch einmal.", preview: "Dies ist eine Vorschau: Es wird nichts gesendet. Auf der Live-Seite kommt Ihre Nachricht an.",
        onderschrift: "Beispiele, was möglich ist, kein festes Paket. Gemeinsam wählen wir, was zu Ihrem Betrieb passt, und beginnen mit einem Baustein.", gecheckt: "Ich habe {host} geprüft (Wert {n}).", blad: "{n} von {m}", brTitel: "Eine Website für {groep}", brLead: "Ich baue Websites und smarte Systeme für {groep} in Utrecht und Umgebung. Unten sehen Sie, was das in der Praxis bedeuten kann.", brMeer: "Mehr über Websites für {groep}", brDocTitel: "Website für {groep} in Utrecht | Van Sonsbeek", vbKop: "So sieht es aus", wieK: "Sieht Ihr Kunde", wieJ: "Für Sie", wieJlang: "Für Sie, hinter den Kulissen", kies: "Wählen", gekozen: "Gewählt", kiesLabel: "{t} auswählen", keuzeNiets: "Noch nichts gewählt", keuzeEen: "1 Baustein", keuzeMeer: "{n} Bausteine", keuzeHint: "Wählen Sie in der Liste, was Sie möchten. Das Schriftfeld rechnet aus, welches Paket passt.", keuzeTip: "Tipp: Fangen Sie klein an. Der Rest kann später kommen.", pk1: "Website", pk2: "Website mit Anfragen", pk3: "Website mit Dashboard", pp1: "895 €", pp2: "1.495 €", pp3: "2.950 €", wensBericht: "Ich interessiere mich für eine Website für {groep}, mit: {lijst}.", wensLeeg: "Ich interessiere mich für eine Website für {groep}.", metaWie: "Für wen", metaPakket: "Enthalten in", vanafPrijs: "ab {p}", linkK: "Für Ihre Kunden", linkJ: "Für Sie", linkNieuw: "öffnet in einem neuen Tab", vbPlan: "Grundriss für {groep} ansehen", vbLinksKop: "Nützlich für {groep}", demoZaak: "Unten: die Mails von {zaak} an einem normalen Morgen.", wensVb: "Ich habe die Beispielseite ({soort}) gesehen und hätte gern so etwas für meinen Betrieb.", wensVbNaam: "Ich habe die Beispielseite ({soort}) gesehen und hätte gern so etwas für {naam}.", titleVb: "Beispiele nach Branche: Websites und nützliche Links | Van Sonsbeek", descVb: "Sehen Sie pro Branche eine Beispielseite auf Handy und Computer, testen Sie das Dashboard, das Ihre Mails liest, und finden Sie nützliche Links für Ihren Betrieb.", wensKoppel: "Ich möchte wissen, ob meine Website an das System angebunden werden kann, das ich jetzt nutze, nämlich: "
      }
    },
    nl: { ui: {
      title: "Websites en slimme systemen voor kleine zaken | Van Sonsbeek",
      desc: "Ik bouw websites en systemen met AI die je mail lezen, facturen nakijken en bestellingen bijhouden.",
      ongelezen: "Nog niet gelezen", bonLeeg: "Druk op <strong>Lees mijn mail</strong>. Daarna zie je hier per bericht wat het dashboard eruit haalde en wat het controleerde.",
      lezen: "Bezig met lezen", opnieuw: "Opnieuw", leesMail: "Lees mijn mail", todoLeeg: "Nog niets. Het dashboard zet hier wat jij vandaag moet doen.",
      kopieer: "Kopieer link naar dit voorbeeld", gekopieerd: "Link gekopieerd",
      checkLeeg: "Vul het adres van je website in, bijvoorbeeld jouwzaak.nl.", checkBezig: "Ik haal {host} op en kijk hem na…", score: "Score: <strong>{n}</strong> van de 100.",
      checkGoed: "Je site staat er goed voor. Wil je er een dashboard bij, of een frisse look?", checkSlecht: "Wil je dat ik dit oplos? Ik maak er graag een voorstel voor, met een vaste prijs.",
      voorstel: "Vraag een voorstel", checkFout: "De check lukte niet. Is je internet in orde?", checkPreview: "In deze voorvertoning werkt de websitecheck nog niet. Op de live site haalt hij je pagina echt op.",
      naamNodig: "Vul je naam in.", contactNodig: "Vul een telefoonnummer of e-mailadres in waarop ik je kan bereiken.", versturen: "Versturen…", stuur: "Stuur bericht",
      bedankt: "Dank je, {naam}.", bedanktTekst: "Je bericht is binnen. Ik neem zo snel mogelijk contact met je op.", fout: "Versturen lukte niet. Probeer het nog eens.", preview: "Dit is een voorvertoning: er wordt nog niets verstuurd. Op de live site komt je bericht wel aan.",
      onderschrift: "Voorbeelden van wat kan, geen vast pakket. We kiezen samen wat bij jouw zaak past en beginnen met één onderdeel.", gecheckt: "Ik heb {host} gecheckt (score {n}).", blad: "{n} van {m}", brTitel: "Een website voor {groep}", brLead: "Ik bouw websites en slimme systemen voor {groep} in Utrecht en omgeving. Hieronder zie je wat dat in de praktijk kan betekenen.", brMeer: "Meer over websites voor {groep}", brDocTitel: "Website voor {groep} in Utrecht | Van Sonsbeek", vbKop: "Zo ziet het eruit", wieK: "Ziet je klant", wieJ: "Voor jou", wieJlang: "Voor jou, achter de schermen", kies: "Kies", gekozen: "Gekozen", kiesLabel: "{t} kiezen", keuzeNiets: "Nog niets gekozen", keuzeEen: "1 onderdeel", keuzeMeer: "{n} onderdelen", keuzeHint: "Kies in de lijst wat je wilt hebben. Het titelblok rekent uit welk pakket past.", keuzeTip: "Tip: begin klein. De rest kan later altijd nog.", pk1: "Website", pk2: "Website met aanvragen", pk3: "Website met dashboard", pp1: "€ 895", pp2: "€ 1.495", pp3: "€ 2.950", wensBericht: "Ik heb interesse in een website voor {groep}, met: {lijst}.", wensLeeg: "Ik heb interesse in een website voor {groep}.", metaWie: "Voor wie", metaPakket: "Zit in", vanafPrijs: "vanaf {p}", linkK: "Voor je klanten", linkJ: "Voor jou", linkNieuw: "opent in een nieuw tabblad", vbPlan: "Bekijk de plattegrond voor {groep}", vbLinksKop: "Handig voor {groep}", demoZaak: "Hieronder de mail van {zaak} op een gewone ochtend.", wensVb: "Ik zag de voorbeeldsite voor een {soort} en wil graag zoiets voor mijn zaak.", wensVbNaam: "Ik zag de voorbeeldsite voor een {soort} en wil graag zoiets voor {naam}.", titleVb: "Voorbeelden per vak: websites en handige links | Van Sonsbeek", descVb: "Bekijk per vak een voorbeeldsite op telefoon en computer, probeer het dashboard dat je mail leest en vind handige links voor je bedrijf.", wensKoppel: "Ik wil graag weten of mijn website kan aansluiten op het systeem dat ik nu gebruik, namelijk: "
    } }
  };

  var orig = {}, origAttr = {};
  function bewaarOrigineel() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) { orig[el.getAttribute("data-i18n")] = el.innerHTML; });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { origAttr[el.getAttribute("data-i18n-aria")] = el.getAttribute("aria-label"); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { origAttr[el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder"); });
  }
  function kies(t) {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && TALEN[q]) return q;
    try { var s = localStorage.getItem("taal"); if (s && TALEN[s]) return s; } catch (e) {}
    return "nl";
  }
  var taal = "nl";
  function zet(t, bewaar) {
    taal = TALEN[t] ? t : "nl";
    var d = D[taal] || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); var v = taal === "nl" ? orig[k] : (d[k] != null ? d[k] : orig[k]);
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria"); el.setAttribute("aria-label", taal === "nl" ? origAttr[k] : (d[k] || origAttr[k]));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); el.setAttribute("placeholder", taal === "nl" ? origAttr[k] : (d[k] || origAttr[k]));
    });
    document.documentElement.lang = taal;
    if (!document.body.hasAttribute("data-plan")) {          // op /voor/... zet plan.js de titel
      var vb = document.body.getAttribute("data-pagina") === "voorbeelden";
      document.title = window.T(vb ? "titleVb" : "title");
      var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", window.T(vb ? "descVb" : "desc"));
    }
    if (bewaar) { try { localStorage.setItem("taal", taal); } catch (e) {} }
    var knop = document.getElementById("taal-knop"); if (knop) knop.firstChild.textContent = taal.toUpperCase();
    document.querySelectorAll("#taal-menu [role=option]").forEach(function (o) { o.setAttribute("aria-selected", String(o.dataset.taal === taal)); });
    document.dispatchEvent(new CustomEvent("taal", { detail: taal }));
  }
  window.T = function (k, vars) {
    var v = ((D[taal] || {}).ui || {})[k]; if (v == null) v = D.nl.ui[k]; if (v == null) return k;
    if (vars) Object.keys(vars).forEach(function (n) { v = v.replace("{" + n + "}", vars[n]); });
    return v;
  };
  window.TAAL = function () { return taal; };

  // Taalkeuze in de kop, zoals bij Campo
  function maakMenu() {
    var plek = document.getElementById("taal");
    if (!plek) return;
    plek.innerHTML = '<button type="button" class="taal-knop" id="taal-knop" aria-haspopup="listbox" aria-expanded="false" aria-label="Taal / Language">NL<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg></button>' +
      '<ul class="taal-menu" id="taal-menu" role="listbox" hidden>' + Object.keys(TALEN).map(function (k) {
        return '<li role="option" tabindex="-1" data-taal="' + k + '" aria-selected="false"><b>' + k.toUpperCase() + "</b>" + TALEN[k] + "</li>";
      }).join("") + "</ul>";
    var knop = document.getElementById("taal-knop"), menu = document.getElementById("taal-menu");
    function open(o) { menu.hidden = !o; knop.setAttribute("aria-expanded", String(o)); if (o) { var s = menu.querySelector('[aria-selected="true"]') || menu.firstChild; s.focus(); } }
    knop.addEventListener("click", function () { open(menu.hidden); });
    menu.addEventListener("click", function (e) { var li = e.target.closest("[data-taal]"); if (!li) return; zet(li.dataset.taal, true); open(false); knop.focus(); });
    menu.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(menu.children), i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.activeElement.click(); }
      else if (e.key === "Escape") { open(false); knop.focus(); }
    });
    document.addEventListener("click", function (e) { if (!plek.contains(e.target)) open(false); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    bewaarOrigineel(); maakMenu();
    var t = kies(); if (t !== "nl") zet(t, false); else { zet("nl", false); }
  });
})();
