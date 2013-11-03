// Namespace
var APP = APP || {};

// Self-invoking anon function
(function() {

	'use strict';
	
	// De page objecten defineren
	APP.pools = {};

	APP.pool = {};
	
	APP.games = {};
	
	APP.game = {};
	
	APP.teams = {};
	
	APP.tournaments = {};
	
	// APP controller object
	APP.controller = {
		init: function() {
			APP.router.init();
		}
	};
	
	APP.router = {
		init: function () {
			// Routie zorgt ervoor dat de routes goed worden afgehandeld. Binnen de route functie wordt de page.render function aangehaald met daarin de naam van de route, de desbetreffende Leaguevine API url en het desbetreffende data object.
	  		routie({
			    '/pools': function() {
			    	APP.page.render('pools', 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=[name]&access_token=82996312dc', APP.pools);
				},
			    '/pool/:id': function(id) {
			    	APP.page.render('pool', 'https://api.leaguevine.com/v1/games/?pool_id='+id+'&access_token=82996312dc', APP.pool);
				},
			    '/games': function() {
			    	APP.page.render('games', 'https://api.leaguevine.com/v1/game_scores/?tournament_id=19389&access_token=82996312dc', APP.games);
				},
			    '/game/:id': function(id) {
			    	APP.page.render('game', 'https://api.leaguevine.com/v1/games/'+id+'/?access_token=82996312dc', APP.game);
				},				
			    '/teams': function() {
			    	APP.page.render('teams', 'https://api.leaguevine.com/v1/tournament_teams/?tournament_ids=[19389]&order_by=[team_id]&access_token=82996312dc', APP.teams);
			    },
			    '/tournaments': function() {
			    	APP.page.render('tournaments', 'https://api.leaguevine.com/v1/tournaments/19389/', APP.tournaments);
			    },
			    '*': function() {
			    	APP.page.render('tournaments', 'https://api.leaguevine.com/v1/tournaments/19389/', APP.tournaments);
			    }
			    
			});
		},
		
		// Als de route veranderd wordt de goede route uit de URL gehaald en de desbetreffende route op active gezet
		change: function() {
			var route = window.location.hash.slice(2);

			if(route.indexOf('/') == 4) {
				route = route.slice(0,4);
			}
			
			var	sections = qwery('section'),
				section = qwery('[data-route=' + route + ']')[0];
				
			if (section) {
	        	for (var i=0; i < sections.length; i++){
	        		sections[i].classList.remove('active');
	        	}
	        	section.classList.add('active');
	        }

	        if (!route) {
	        	sections[0].classList.add('active');
	        }
		}
	};
	
	APP.page = {
		// De pagina render function (vraagt om de naam van de route, de Leaguevine API url en het dataobject van de desbetreffende pagina)
		render: function (route, url, dataObject) {
		
			// Laat de loader zien om aan te geven dat het systeem bezig is met data verwerken
			document.getElementById("floatingBarsG").style.display = 'block';
			
			// De get request method van het App.ajax object wordt hier aangevraagd waarin de Leaguevine API url en het pagina object wordt doorgegeven. Daarna komt de callback functie die wordt geinitialiseerd zodra de get method een response heeft van de Leaguevine API.
			APP.ajax.get(url, dataObject, function() {
				var data = eval('APP.'+route);
				
				// Als de route 'pools' is, geef dan aan de transparancy functie een aantal directives mee om de goede pool-ID in de URL te zetten voor de individuele pool linkjes
				if(route == 'pools') {
					var directives = {
						data: {
							objects: {
								name: {
									href: function(params) {
										return 'index.html#/pool/' + this.id;
									},
									text: function() {
										return 'Pool ' + this.name;
									}
								}
							}
						}
					};
				}
				// Als de route 'pool' is, geef dan aan de transparancy functie een aantal directives mee om de goede game-ID in de URL te zetten voor de individuele game linkjes 
				else if (route == 'pool') {
					var directives = {
						name: {
							text: function() {
								return 'Wedstrijden in pool ' + this.data.objects['0'].pool.name;
							}
						},
						data: {
							objects: {
								update: {
									href: function(params) {
										return 'index.html#/game/' + this.id;
									},
									text: function() {
										return 'Update score';
									}
								}
							}
						}				
					};
				}
				
				// De Transparancy library zorgt ervoor dat de opgehaalde data van de Leaguevine API bij de goede elementen wordt gebind.
				Transparency.render(qwery('[data-route='+route+']')[0], data, directives);
				
				// Verander vervolgens de active class om de nieuwe gegenereerde pagina te laten zien.
				APP.router.change();
				
				// Laat de loader verdwijnen, de pagina is klaar met laden.
				document.getElementById("floatingBarsG").style.display = 'none';
			});
		},
		// Zodra de game-score wordt gesubmit wordt deze method aangehaald om de score-submit actie te verwerken
		submit: function(event) {
		
			// Laat de loader zien om aan te geven dat het systeem bezig is met data verwerken
			document.getElementById("floatingBarsG").style.display = 'block';
			
			// Zet de data klaar om naar de Leaguevine API te sturen.
			var senddata	=	JSON.stringify({
									game_id: document.getElementById('id').value,
									team_1_score: document.getElementById('team_1_score').value,
									team_2_score: document.getElementById('team_2_score').value,
									is_final: 'True'
								}),
				pool_id		=	document.getElementById('pool_id').value,
				url			=	"https://api.leaguevine.com/v1/game_scores/";
			
			// De post request method van het App.ajax object wordt hier aangevraagd om de data naar de Leaguevine API te sturen. Zodra er een response is wordt de browser geredirected naar de pool overzichtspagina
			APP.ajax.post(url, senddata, function() {
				window.location.href = "index.html#/pool/" + pool_id;
			});
			
			// Return false zorgt ervoor dat de browser de request niet op de standaard  manier verwerkt verder.
			return false;		
		}
	}
	
	APP.ajax = {
		// Get request via XMLHttpRequest
		get: function(linkurl, obj, callback) {
			var url			= linkurl,
				xhr			= new XMLHttpRequest();

			xhr.open('GET',url,true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 200){
					if(xhr.responseText != null){
						obj.data = JSON.parse(xhr.responseText);
						callback.call(obj.data);
					}
				}
			}
			xhr.send();
		},
		// Post request via XMLHttpRequest
		post: function(linkurl, senddata, callback) {
			var url		= linkurl,
			xhr			= new XMLHttpRequest();
			
			xhr.open('POST',url,true);
			xhr.setRequestHeader('Content-type','application/json');
			xhr.setRequestHeader('Authorization','bearer 82996312dc');
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 201){
					callback.call();
				}
			}
			xhr.send(senddata);
		}
	}

	domready(function () {
		// App initialiseren
		APP.controller.init();
		
		// Tap gestures om score makkelijk aan te passen
		$$('#team_1_score').singleTap(function(){
			document.getElementById("team_1_score").value ++;
		});

		$$('#team_2_score').singleTap(function(){
			document.getElementById("team_2_score").value ++;
		});
	});
})();