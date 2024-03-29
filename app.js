var APP = (function(config) { 
	
	// Object.prototype.size = function() {
 //    	var size = 0, key;
 //    	for (key in this) {
 //    	    if (this.hasOwnProperty(key)) size++;
 //    	}
 //    	return size;
	// };

	var api = {
	    collections : {},
	    namespace   : 'appStorage_'
	};

	api.isArray = function(obj) {
		//returns true is it is an array
		return obj.constructor.toString().indexOf("Array") !== -1;
	}

	api.config = function(config) {
		api = $.extend(api,config);
		return api;
	}

	api.getParam = function(name) {
	    return decodeURI(
	        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	    );
	}

    /**
     * Returns the number of pixels from the left which the user has scrolled.
     *
     * @returns {Number} The number of pixels scrolled.
     */
    api.countScrollX = function () {
        return window.pageXOffset || window.scrollX || document.body.scrollLeft || document.documentElement.scrollLeft;
    };
 
    /**
     * Returns the number of pixels from the top which the user has scrolled.
     *
     * @returns {Number} The number of pixels scrolled.
     */
    api.countScrollY = function () {
        return window.pageYOffset || window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
    };
 

	/*	
	
		jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)
	
		Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
	
		Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
		http://dojofoundation.org/license for more information.
	
	*/	
	
	;(function(d,$){
	
		// the topic/subscription hash
		var cache = {};
	
		d.publish = function(/* String */topic, /* Array? */args){
			// summary: 
			//		Publish some data on a named topic.
			// topic: String
			//		The channel to publish on
			// args: Array?
			//		The data to publish. Each array item is converted into an ordered
			//		arguments on the subscribed functions. 
			//
			// example:
			//		Publish stuff on '/some/topic'. Anything subscribed will be called
			//		with a function signature like: function(a,b,c){ ... }
			//
			//	|		$.publish("/some/topic", ["a","b","c"]);
			cache[topic] && $.each(cache[topic], function(){
				this.apply(d, args || []);
			});
		};
	
		d.subscribe = function(/* String */topic, /* Function */callback){
			// summary:
			//		Register a callback on a named topic.
			// topic: String
			//		The channel to subscribe to
			// callback: Function
			//		The handler event. Anytime something is $.publish'ed on a 
			//		subscribed channel, the callback will be called with the
			//		published array as ordered arguments.
			//
			// returns: Array
			//		A handle which can be used to unsubscribe this particular subscription.
			//	
			// example:
			//	|	$.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
			//
			if(!cache[topic]){
				cache[topic] = [];
			}
			cache[topic].push(callback);
			return [topic, callback]; // Array
		};
	
		d.unsubscribe = function(/* Array */handle){
			// summary:
			//		Disconnect a subscribed function for a topic.
			// handle: Array
			//		The return value from a $.subscribe call.
			// example:
			//	|	var handle = $.subscribe("/something", function(){});
			//	|	$.unsubscribe(handle);
			
			var t = handle[0];
			cache[t] && $.each(cache[t], function(idx){
				if(this == handle[1]){
					cache[t].splice(idx, 1);
				}
			});
		};
	
	})(api,jQuery);

	return api;

}());