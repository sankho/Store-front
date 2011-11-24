var APP = APP || {};

APP.baseModel = function() {

    var self = this;

    var namespace = APP.namespace;

    this.save = function(callback) {
        if (this.doc) {
            APP.collections[this.collection] = APP.collections[this.collection] || {};
            
            var docs = this.doc;

            if (!APP.isArray(this.doc)) {
                docs = [this.doc];
            }

            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];

                /** this needs some major love. when you're feeling smarter that is. */
                if (!doc._id) {
                    // probably should check if this ID exists elsewhere first, meh
                    // maybe a recursive function
                    doc._id = 'new_' + Math.floor(Math.random()*999);
                }

                APP.collections[this.collection][doc._id] = doc;
            }

            APP.publish('doc-save',[docs,this.collection,callback]);
        }
    }

    this.remove = function(callback) {
        var docs = this.doc;
        
        if (!APP.isArray(docs)) {
            docs = [this.doc];
        }

        console.log('attempting to remove ', docs, this);
        
        for (var i = 0; i < docs.length; i++) {
            delete APP.collections[this.collection][docs[i]._id];
        }

        APP.publish('doc-remove',[docs,this.collection]);

        typeof callback === 'function' ? callback(docs) : null;
    }

    // this needs to be sorted out better.
    // the basemodel should never directly be accessing
    // the server or clientDB modules.
    this.getById = function(_id,callback) {
        var self       = this;
        var collection = APP.collections[self.collection];
        if (collection && collection[_id]) {
            self.doc = collection[_id];
            return typeof callback === 'function' ? callback(self) : self;
        } else if (APP.serverDB.inited) {
            APP.serverDB.getByIdOnServer(_id,self.collection,function(doc) {
                self.doc = doc;
                var collection = APP.clientDB.getCollection(self.collection);
                collection[_id] = doc;
                APP.clientDB.saveCollection(self.collection);
                return typeof callback === 'function' ? callback(self) : self;
            });
        }
    }

    this.find = function(args,toServer,callback) {
        if (typeof toServer === 'function' && typeof callback === 'undefined') {
            callback = toServer;
        } else if (toServer === true) {
            return APP.publish('find-on-server',[args,this.collection,callback]);
        }

        return APP.publish('find-on-server',[args,this.collection,callback]);

        /*
         * leaving the internal collection search out for now.
         * Need to analyze each "find" to see if it's been done yet
         * or not. If it's been done; then records should already be
         * stored internally.

        var collection = APP.collections[this.collection];
        var items      = [];

        // nice programming, smart guy
        for (item in collection) {
            var addItem = true;
            var item    = collection[item];
            for (arg in args) {
                if (item[arg] !== args[arg]) {
                    addItem = false;
                }
            }
            if (addItem) {
                items.push(item);
            }
        }

        if (items.length > 0) {
            callback(items);
        } else {
            return APP.publish('find-on-server',[args,this.collection,callback]);
        }
        //*/
    }

    this.findOnServer = function(args,callback) {
        APP.publish('find-on-server',[args,this.collection,function(docs) {
            typeof callback === 'function' ? callback(docs) : '';
        }]);
    }

};