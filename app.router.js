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
	$guts, o, _uri, exitCallback;

	function shuffle(v){
	    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    	return v;
	}

	function _handleUriChange(uri) {
		uri = uri.split('?')[0];

		var uriLen = uri.length-1;
		if (uri.charAt(uriLen) === '/' && uriLen !== 0) {
			uri = uri.slice(0,uriLen);
		}

		_uri = uri;
		
		var routes = o.routes;
		var route  = routes[uri.replace('/', '').replace('#', '')];
		
		if (!route) {
			var route = routes.default;
			route.tmpl = uri !== '/' ? uri.replace('/', '') : o.defaultHome;
		} else {
			route = $.extend({}, routes.default, route);
		}
		
		if (typeof exitCallback === 'function') {
			exitCallback();
		}

		if (route.exit) {
			exitCallback = route.exit;
		} else {
			exitCallback = false;
		}

		if (route.preLoad) {
			route.preLoad(function(data) {
				o.handleUriChange(uri,route,data);
			});
		} else {
			o.handleUriChange(uri,route);
		}
	}

	defaults.handleUriChange = function(uri,route,data) {
		if (uri) {
			$guts.toggleClass('invisible');
			setTimeout(function() {
				var html = htmlCache[uri];
				
				if (html) {
					insertTemplate(html,data,route.callback);
				} else {
					var url = [o.dir, route.tmpl, o.ext].join('');
					$.ajax({
						url : url,
						success : function(html) {
							htmlCache[uri] = html;
							insertTemplate(html,data,route.callback);
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
			_handleUriChange(uri);
  		}
	}

	function handlePopState(e) {
		// if is one of ours
		var uri = window.location.pathname;
		if (e.state) {
			// load the content
			_handleUriChange(uri);
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
		_handleUriChange(uri);
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
						_handleUriChange(window.location.pathname);
					}
				} else if (o.useHash) {
					$guts.empty();
					if (window.location.pathname !== '/') {
						window.location.href = '/#' + window.location.pathname;
					} else {
						_handleUriChange(window.location.hash.replace('#',''));
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
			_handleUriChange(uri);
		},

		getUri : function() {
			return _uri;
			o.handleUriChange(uri);
		}

	};

}());