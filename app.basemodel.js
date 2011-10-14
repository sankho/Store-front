var APP = APP || {};

APP.baseModel = function() {

    var self = this;

    var namespace = APP.namespace;

    this.save = function() {
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

            APP.publish('doc-save',[this.doc,this.collection]);
        }
    }

    this.remove = function() {
        delete APP.collections[this.collection][this.doc._id];
        APP.publish('doc-remove',[this.doc._id,this.collection]);
    }

    this.getById = function(_id) {
        var collection = APP.collections[this.collection];
        this.doc = collection[_id];
        return this;
    }

    this.find = function(args) {
        // collection search.
    }

};