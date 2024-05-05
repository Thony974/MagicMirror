/* MagicMirror² Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "localhost",	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
									// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],	// Set [] to allow all IP addresses
									// or add a specific IPv4 of 192.168.1.5 :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
									// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false,			// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "",	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "",	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			header: "Mon agenda (chenmosdine)",
			position: "top_left",
			config: {
				calendars: [
					{
						fetchInterval: 1 * 24 * 60 * 60 * 1000,
						maximumNumberOfDays: 8,
						symbol: "calendar-check",
						url: "CALENDAR_URL"
					}
				]
			}
		},
		{
			module: "weather",
			position: "top_right",
			config: {
				weatherProvider: "openweathermap",
				type: "current",
				location: "Massy, FR",
				apiKey: "OPENWEATHERMAP_API_KEY"
			}
		},
		{
			module: "compliments",
			position: "middle_center",
			config: {
				updateInterval: 15 * 1000,
				compliments: {
					morning: [
						"Bonjour Anthony",
						"Bonjour Romy",
						"Coucou Éléonore",
						"Salut Rodin"
					],
					evening: [
						"Kossa ou fé encore debout ?!",
						"Allé dormi"
					]
				}
			}
		},
		{
			module: "compliments",
			position: "bottom_bar",
			config: {
				updateInterval: 1 * 24 * 60 * 60 * 1000,
				classes: "thin medium bright",
				compliments: {
					anytime: [
						"Bon kari i fé dann vië marmit (C'est dans les vieux pots qu'on fait la bonne soupe)",
						"Boug la li bat la mèr pou guinye lekïm (Brasser du vent)",
						"bef dovan i boir d'lo prop (Premier arrivé, premier servi)",
						"Dann oui la poin batay (Dire oui, ça évite les querelles)",
						"Deux poules i pond' pa dann' mèm nid (Plusieurs femmes ne peuvent pas vivre dans le même ménage)",
						"Espèr trouv boudin kui dann vant koshon (Espérer trouver quelque chose de tout fait sans se donner beaucoup d'efforts)",
						"Fèr in noce èk in queue la morue (Exagérer, faire croire que l'on peut se régaler)",
						"Foutan i angrèss pa cochon (La critique est aisée, l'art est difficile)",
						"Goni vide i tien pa d'bout (Estomac affamé rend faible)",
						"Gro poisson i bèk su l'tar (Une bonne affaire se fait parfois attendre)",
						"Gèt èk le zié, fini èk le kèr (Contente-toi de regarder, t'auras rien d'autre)",
						"I fé pa la bou avan la plï (Ne pas avoir de conclusions hâtives)",
						"In bon zo i tomb zamé dann la guèl in bon shien (Les gens biens ne rencontrent pas forcément des gens biens)",
						"Kalbass amèr i suiv la racine (Tel père, Tel fils)",
						"Kan gro béf i charge, sort dovan ! (Ne pas rester sur le chemin d'un patron en colère)",
						"Kan i koz èk Boukané, sosis rès pandiyé (Quand on parle à Jean, Pierre n'a pas la parole)",
						"Kan la mer i bat, lèss ali bat (Laisse parler les gens)",
						"Kan la rivièr i desann, la bou i desann ansanm (Lorsqu'un scandale arrive, tout ceux qui y sont impliqués ne doivent pas passer à travers mailles)",
						"Kass pa la tèt la plï i farin, Soley va rovnir ! (Après la pluie, le beau temps)",
						"kont pa sÏ bato ton frèr pou sot la rivièr (Ne pas compter sur les autres pour avancer)",
						"kok mon voizin grosër mon marmit (Ce que le voisin possède est toujours objet de convoitise, toujours plus beau que ce que l'on a)",
						"koshon i komann pa la kord (Vous ne pouvez diriger quelqu'un qui doit vous diriger)",
						"Koulër la po lé pa koulër lo kèr (La couleur de la peau, ne vous dit pas quel genre de personnage est l'autre)",
						"krapo i argard aou, ou lé pa blizé guèt ali gro zië (C'est pas parce que'on vous regarde que vous devez défigurer l'autre)",
						"La lang na poin le zo (Tu fais que d'parler)",
						"Na in zour i apèl domin (Demain est un autre jour)",
						"Nouri lo ver pou pik out kër (Être trahi par quelqu'un à qui on a donné sa confiance)",
						"Ou donn in pië, i pran in karo (Donne la main, on te prend le bras)",
						"Ou va war kel koté brinzel i sharz (Tu vas voir de quelle bois je me chauffe)",
						"Pakapab lé mor san esayé (Qui ne tente rien n'a rien)",
						"Payanké dann siel i voi pi son pti dann trou (Quand on s'élève socialement, on devient tellement fier (cet oiseau gonfle son jabot quand il vole) qu'on snobe ses anciennes connaissances)",
						"Pèz su la tèt pou war si la kë i bouz (Prêcher le faux pour connaître le vrai)",
						"Poul i ponn pa kanar (Les chiens ne font pas des chats)",
						"Poul ki kakay, lï minm la ponn (L'alarme est souvent donné par une personne qui a agi)",
						"Rod le pou dan la tët na poin sheveu (Chercher des ennuis là où il n'y en a pas)",
						"Sak i frekant lo shien, y guinye le pus (On sème ce qu'on a récolté)",
						"Si tonton la di wi, rod pa kosa va dir tantine (Ne pas s'encombrer d'opinions trop diverses avant d'entreprendre quelque chose)",
						"Ti asch i koup gro bwa (Avec de la persévérance on arrive à ses fins)",
						"Tortue i oua pa son queue (On voit les défauts des autres mais pas les siens.)",
						"Tout martin, la zèl lé blan (Beaucoup de choses se ressemblent)",
						"Zenfan i plèr pa, i gaigne pa d'lait (Il faut se faire entendre pour avoir ce qu'on veut)",
						"Zorey koshon dann marmit poi (Faire la sourde oreille)",
						"Do pain a l'pain (La nécessité doit l’emporter sur le superflu)",
						"Doner de rou i ral pa charet (Celui qui donne des mauvaises idées n'est pas celui qui en subira les conséquences)",
						"Lo promier i lance galet, a li mem i tend pas la zou (Celui qui ne se remet jamais en question est le premier à critiquer)"
					]
				}
			}
		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }