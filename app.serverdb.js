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
                    APP.collections[collection][doc._id]._id = data.doc._id;
                    APP.clientDB.saveCollection(collection);
                    APP.publish('server-upsert',[data.doc,doc]);
                    typeof callback === 'function' ? callback() : null;
                }
            }
        });

    };

    function removeDoc(_id,collection) {
        var uri = 'remove';

        $.ajax({
            url : domain + uri,
            type : 'post',
            data : {
                doc_id     : _id,
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
                callback(data.doc);
            }
        });
    }

    return {
        init : function() {
            /** subscribe to internal events **/
            APP.subscribe('doc-save',function(doc,collection,callback) {
                upsertDoc(doc,collection,callback);
            });
        
            APP.subscribe('doc-remove',function(doc_id,collection) {
                removeDoc(doc_id,collection);
            });

            APP.subscribe('find-on-server', findOnServer);
        }
    };

}());