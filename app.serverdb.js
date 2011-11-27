var APP = APP || {};

APP.serverDB = (function() {
    
    var domain = '/';

    function upsertDoc(doc,collection,callback) {
        var uri = 'upsert';

        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                doc        : doc,
                collection : collection
            },
            success : function(data) {
                console.log('Server Response to Upsertion... ', data);
                if (data.success) {
                    var docs = data.doc;
                    for (var i=0; i<docs.length; i++) {
                        var doc = docs[i];
                        APP.collections[collection] = APP.collections[collection] || {};
                        APP.collections[collection][doc._id] = doc;

                        if (doc.__client_id && APP.collections[collection][doc.__client_id]) {
                            delete APP.collections[collection][doc.__client_id];
                        }
                    }
                    typeof callback === 'function' ? callback(docs) : null;
                }
            }
        });

    };

    function removeDocs(docs,collection) {
        var uri = 'remove';
        
        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                docs         : docs,
                collection   : collection
            },
            success : function(data) {
                //console.log('Server Response to Removal... ', data);

                APP.publish('server-remove',[docs,collection]);
            }
        });
    };

    // ???
    // how in the world will this work...?
    function syncLocal() {
        var uri = 'sync';
    }

    function findOnServer(args,collection,callback) {
        var uri = 'find';
        
        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                args       : args,
                collection : collection
            },
            success : function(data) {
                var docs = data.doc;
                for (var i=0; i<docs.length; i++) {
                    var doc = docs[i];
                    APP.collections[collection] = APP.collections[collection] || {}; 
                    APP.collections[collection][doc._id] = doc;
                }
                callback(docs);
            }
        });
    }

    function getByIdOnServer(id,collection,callback) {
        var uri = 'get-by-id';
        
        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                id         : id,
                collection : collection
            },
            success : function(data) {
                if (data && data._id) {
                    APP.collections[collection] = APP.collections[collection] || {};
                    APP.collections[collection][data._id] = data;
                }
                callback(data);
            }
        });
    }

    return {
        init : function() {
            this.inited = true;
            
            /** subscribe to internal events **/
            APP.subscribe('doc-save',function(doc,collection,callback) {
                upsertDoc(doc,collection,callback);
            });
        
            APP.subscribe('doc-remove',function(docs,collection) {
                removeDocs(docs,collection);
            });

            APP.subscribe('find-on-server', findOnServer);
        },
        inited : false,
        getByIdOnServer : getByIdOnServer
    };

}());