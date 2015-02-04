Introduzione
------------
scrollback.io è un sito che fornisce un servizio di messagistica che
s'interfaccia con le principali piattaforme di chat di gruppo quali
irc, facebook, twitter- Sul sito gira il programma open source
"scrollback" disponibile su github.

Lo scopo di questo documento è quello di dare maggiori informazioni
sulla infrastruttura interna con lo scopo di far girare un server
scrollback locale. La documentazione su questo punto, infatti, è
abbastanza carente.
I motivi principali per avere un server scrollback locale sono i segueti:
    1) Eliminare la dipendenza da un sito esterno
    2) Permettere una personalizzazione del programma
    3) Ridurre eventuali ritardi e sovraffollamenti esterni
    4) Avere un maggiore controllo su *quali* informazioni far
       trasparire all'esterno. Attualmente, infatti, scrollback
       indicizza le transazioni sul motore di ricerca google e
       questo potrebbe non essere un effetto voluto.
    5) Non rimandare a terzi una computazione che può essere svolta
       da se stessi.

Installazione
-------------
E' presente uno script d'installazione che fornisce il supporto alle
distribuzioni Fedora, Ubuntu e Archlinux. E' possibile scaricarlo all'indirizzo
https://raw.githubusercontent.com/scrollback/scrollback/master/tools/install.sh

Su debian (jessie), è necessario apportare qualche modifica. Si consiglia
la lettura delle mie istruzioni presenti su `install_scrollback`

Una volta completata, lanciando il comando "sudo npm start" si avvia
il server scrollback, in ascolto sulla porta 80. Visitando da browser
la pagina http://local.scrollback.io si dovrebbe aprire la finestra
del client di scrollback.

Configurazione consigliata
--------------------------
Per evitare la generazione di un fiume di messaggi di log dovuti ai
vari plugins, si consiglia di settare la variabile plugins in /index.js
come segue:

var plugins = [ "validator","browserid-auth", "recommendation", "anti-abuse",
			   "authorizer", "redis-storage",  "leveldb-storage",
			   "entityloader", "censor", "superuser", "search", "sitemap",
			   "push-notification"];

Effettuare modifiche
--------------------
Per rendere effettive le varie modifiche ai moduli è necessario:

lato server: semplicemente riavviare il server (sudo npm start)
lato client: invocare il comando "gulp" che (dopo qualche minuto)
             genera il file public/client.min.js, importato come script
             dalla pagina local.scrollback.io

Districarsi nella matassa
-------------------------
Per individuare quali moduli vengano usati lato client o lato server
dare un'occhiata alla variabile "plugins" contenuta in /index.js

Allo stesso modo, i moduli lato client vanno cercati negli argomenti
delle varie "require" dentro il file /client.js

La parte server è organizzata proprio con una struttura a plugin.
Ognuno di essi aggiunge una funzionalità all'oggetto
*core = require("ebus")*. Per maggiori informazioni su come sono
strutturati i plugin, visitare https://github.com/scrollback/scrollback/wiki/Writing-a-Module .

Il sistema ad eventi
--------------------
Tutto funziona ad eventi, gli oggetti "core" (server side) e "libsb"
(client side, a volte chiamato anche core) vengono "riempiti" con
catene di listeners secondo lo schema
    core.on(eventType, listener, priority)
I listeners sono delle procedure del tipo
    function listener(parameters, next)
che una volta svolta la loro funzione, richiamano next() per attivare
il successivo listener.

Per generare un evento, si usa la sintassi
    core.emit(eventType, parameters, callback)
Tutti gli eventType sono delle stringhe, i parameters invece sono dizionari

Per maggiori informazioni sugli eventi, https://github.com/scrollback/scrollback/wiki/Events
Per maggiori informazioni su libsb, https://github.com/scrollback/scrollback/wiki/LibSb

Moduli interessanti
-------------------
/leveldb-storage : server : stores messages, maintains rooms and users
/socket/socket-client.js : client : procedure per il login e per la comunicazione col server
/interface/interface-client.js : contiene la chiamata a libsb.connect(), che "dovrebbe" far connettere il client

Il problema del login
---------------------
Attualmente local.scrollback.io mostra una finestra in stato "offline" e
non sembra esserci modo di far loggare l'utente. Il modo migliore per
sperimentare e compredere l'interfaccia api esistente è, su firefox,
visitare la pagina http://local.scrollback.io e aprire la console
dello sviluppatore. A questo punto, digitanto "libsb" si accede
alle sue proprietà. Si ricorda che libsb è il bus principale di
eventi lato client.

Per facilitare il debug, bisognerebbe disattivare lo strip delle
informazioni di debug eliminate dal comando "gulp". Questo va fatto,
in qualche modo, dal file /gulpfile.js .

Uno script che mostra come dovrebbe funzionare il processo di login
è visionabile a `connection_script`. Per avviarlo, copiare il contenuto
nella console di sviluppo.
L'errore INVALID_STATE_ERR che viene tornato proviene dalla funzione:
    /calls_to_action/calls_to_action_client.js::libsb.on("init-dn")
ed è dovuto, probabilmente, al fatto che la variabile "client"
creata dal nostro script è ovviamente diversa da quella contenuta in
/socket/socket-client.js a cui, essendo interna allo script, non è possibile
accedere.