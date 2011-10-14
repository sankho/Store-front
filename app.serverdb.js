var APP = APP || {};

APP.serverDB = (function() {
    
    var domain = '/';

    function upsertDoc(doc,collection) {
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

    return {
        init : function() {
            /** subscribe to internal events **/
            APP.subscribe('doc-save',function(doc,collection) {
                upsertDoc(doc,collection);
            });
        
            APP.subscribe('doc-remove',function(doc_id,collection) {
                removeDoc(doc_id,collection);
            });
        }
    };

}());