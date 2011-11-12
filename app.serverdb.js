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
                    }
                    typeof callback === 'function' ? callback(data.doc) : null;

                    /* need to figure out how to
                       update local data in both memory
                       and clientDB library

                    var oldDocs = doc;
                    var docs    = data.doc;
                    if (!data.doc.length) {
                        docs    = [docs];
                        oldDocs = [oldDocs];
                    }
                    for (var i=0; i<docs.length; i++) {
                        var doc = docs[i];
                        var _collection = APP.clientDB.getCollection(collection);
                        _collection[doc._id]._id = data.doc._id;
                        APP.publish('server-upsert',[data.doc,doc]);
                    }
                    APP.clientDB.saveCollection(collection);
                    //*/
                }
            }
        });

    };

    function removeDoc(id,collection) {
        var uri = 'remove';

        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                id         : id,
                collection : collection
            },
            success : function(data) {
                console.log('Server Response to Removal... ', data);

                APP.publish('server-remove',[_id,collection]);
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
        
            APP.subscribe('doc-remove',function(doc_id,collection) {
                removeDoc(doc_id,collection);
            });

            APP.subscribe('find-on-server', findOnServer);
        },
        inited : false,
        getByIdOnServer : getByIdOnServer
    };

}());