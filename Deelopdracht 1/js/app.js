// Namespace
var APP = APP || {};

// Self-invoking anon function
(function() {

	'use strict';

	APP.pools = {};

	APP.pool = {};
	
	APP.games = {};
	
	APP.game = {};
	
	APP.teams = {};
	
	APP.tournaments = {};
	
	APP.controller = {
		init: function() {
			APP.router.init();
		}
	};
	
	APP.router = {
		init: function () {
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
		render: function (route, url, dataObject) {
			document.getElementById("floatingBarsG").style.display = 'block';
			APP.ajax.get(url, dataObject, function() {
				var data = eval('APP.'+route);
				// Access token 82996312dc
				
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
				} else if (route == 'pool') {
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
				
				Transparency.render(qwery('[data-route='+route+']')[0], data, directives);
				APP.router.change();
				document.getElementById("floatingBarsG").style.display = 'none';
			});
		},
		submit: function(event) {
			
			document.getElementById("floatingBarsG").style.display = 'block';
			
			var senddata	=	JSON.stringify({
									game_id: document.getElementById('id').value,
									team_1_score: document.getElementById('team_1_score').value,
									team_2_score: document.getElementById('team_2_score').value,
									is_final: 'True'
								}),
				pool_id		=	document.getElementById('pool_id').value,
				url			=	"https://api.leaguevine.com/v1/game_scores/";
			
			APP.ajax.post(url, senddata, function() {
				window.location.href = "index.html#/pool/" + pool_id;
			});
			return false;
			
		}
	}
	
	APP.ajax = {
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
		APP.controller.init();

		$$('#team_1_score').singleTap(function(){
			document.getElementById("team_1_score").value ++;
		});

		$$('#team_2_score').singleTap(function(){
			document.getElementById("team_2_score").value ++;
		});
	});
})();