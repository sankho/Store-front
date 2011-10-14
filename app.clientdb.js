var APP = APP || {};

APP.clientDB = (function() {
    
    var defaults = {
        session : false
    };

    var o,db,namespace;

    function saveCollection(collection) {
        db[namespace + collection] = JSON.stringify(APP.collections[collection]);
    }

    function getCollection(collection) {
        APP.collections[collection] = db[namespace + collection] ? JSON.parse(db[namespace + collection]) : {};

        return APP.collections[collection] ? APP.collections[collection] : [];
    }


    return {
        init : function(options) {
            
            o  = $.extend({},defaults,options);
            db = o.session ? sessionStorage : localStorage;
        
            namespace     = APP.namespace;
            
            /** subscribe to internal events **/
            APP.subscribe('doc-save',function(doc,collection) {
                saveCollection(collection);
            });
        
            APP.subscribe('doc-remove',function(doc_id,collection) {
                saveCollection(collection);
            });
        },
        getCollection  : getCollection,
        saveCollection : saveCollection
    };

}());