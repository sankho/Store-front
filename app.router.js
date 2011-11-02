var APP = APP || {};

APP.router = (function() {

	var defaults = {
		routes 		: {
			default : {
				tmpl     : '',
				callback : $.noop
			}
		},
		ext 		: '.ejs', 
		dir 		: '/',
		cnnr 		: '#guts',
		link 		: 'a',
		scope 		: 'body',
		defaultHome : 'home',
		useHistory  : true,
		useHash     : true,
		loadOnLoad  : false
	};

	var htmlCache = {},
	$guts, o;

	function shuffle(v){
	    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    	return v;
	}

	defaults.handleUriChange = function(uri) {
		if (uri) {
			$guts.toggleClass('invisible');
			setTimeout(function() {
				var routes = o.routes;
				var route  = routes[uri];
				
				if (!route) {
					var route = routes.default;
					route.tmpl = uri !== '/' ? uri.replace('/','') : o.defaultHome;
				} else {
					route = $.extend(routes.default,route);
				}
		
				var html = htmlCache[uri];
				
				if (html) {
					insertTemplate(html,{},route.callback);
				} else {
					var url = [o.dir, route.tmpl, o.ext].join('');
					$.ajax({
						url : url,
						success : function(data) {
							htmlCache[uri] = html = data;
							insertTemplate(html,{},route.callback);
						},
						error : function() {
							$guts.empty().toggleClass('invisible');
							alert('template not found.');
						}
					});
				}
			},350);
		}
	}

	defaults.templateParser = function(text,data) {
		return text;
	}

	defaults.afterInsert = function() {
		$guts.toggleClass('invisible');
	}

	function insertTemplate(text,data,callback) {
		$guts.empty();
		var html = o.templateParser(text,data);
		$guts.html(html);
		o.afterInsert();
		callback();
	}

	function pushStateOnClick(e) {
  		$link 	   = $(this);
  		var uri    = $link.attr('href');
  		var ignore = uri.indexOf('http://') !== -1 || uri.indexOf('#') !== -1 || !uri || $link.hasClass('ignore');

  		if (!ignore) {
  			e.preventDefault();
  			var title = $link.attr('title') || $link.text()
	
			var stateObj = {
				title : title,
				url   : uri
			};
	
  			window.history.pushState(stateObj, title, uri);
			o.handleUriChange(uri);
  		}
	}

	function handlePopState(e) {
		// if is one of ours
		var uri = window.location.pathname;
		if (e.state) {
			// load the content
			o.handleUriChange(uri);
		} else {
			var stateObj = {
				title : document.title,
				url   : uri
			};
			window.history.replaceState(stateObj,document.title,uri);
		}
	}

	function hashChange(e) {
		e.preventDefault();
		var uri = $(this).attr('href');
		window.location.hash = uri;
		o.handleUriChange(uri);
	}

	return {

		init : function(config) {
			o 		 = $.extend(true, {}, defaults, config);
			o.routes = $.extend(true, {}, defaults.routes, config.routes);

			if (o.useHistory || o.useHash) {
				$guts  = $(o.cnnr);
				$scope = $(o.scope);
	
				if (Modernizr.history && o.useHistory) {
					$scope.delegate(o.link, 'click', pushStateOnClick);
					window.addEventListener('popstate', handlePopState);
					if (o.loadOnLoad) {
						o.handleUriChange(window.location.pathname);
					}
				} else if (o.useHash) {
					$guts.empty();
					if (window.location.pathname !== '/') {
						window.location.href = '/#' + window.location.pathname;
					} else {
						o.handleUriChange(window.location.hash.replace('#',''));
						$guts.show();
						$scope.delegate(o.link, 'click', hashChange);
					}
				}
			}

		},

		goTo : function(uri,title) {
			if (Modernizr.history && o.useHistory) {
				title = title || uri;
				var stateObj = {
					title : title,
					url   : uri
				};
	  			window.history.pushState(stateObj, title, uri);
			} else if (o.useHash) {
				window.location.hash = uri;
			}
			o.handleUriChange(uri);
		}

	};

}());