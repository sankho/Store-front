var APP = APP || {};

APP.baseModel = function() {

    var self = this;

    var namespace = APP.namespace;

    this.save = function(callback) {
        if (this.doc) {
            var collection = APP.clientDB.getCollection(this.collection);

            /** this needs some major love. when you're feeling smarter that is. */
            if (!this.doc._id) {
                // might want to find something other than sha256. shorter, even.
                //this.doc._id = 'new_' + Sha256.hash(Math.floor(Math.random()*999));
                this.doc._id = 'new_' + Math.floor(Math.random()*999);
                // probably should check if this ID exists elsewhere first, meh
            }

            APP.collections[this.collection][this.doc._id] = this.doc;

            APP.publish('doc-save',[this.doc,this.collection,callback]);
        }
    }

    this.remove = function() {
        delete APP.collections[this.collection][this.doc._id];
        APP.publish('doc-remove',[this.doc._id,this.collection]);
    }

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

    this.find = function(args) {
        // collection search.
    }

    this.findOnServer = function(args,callback) {
        console.log(args,this.collection)
        APP.publish('find-on-server',[args,this.collection,function(docs) {
            typeof callback === 'function' ? callback(docs) : '';
        }]);
    }

};