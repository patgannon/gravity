if (typeof Gravity === 'undefined') {
	Gravity = {};
}

Gravity._privilege = {};
Gravity.can = {};

Gravity.create_privilege = function(name) {
  g = this;
  g.can[name] = function(collection, criteria) {
  	if (!g._privilege[collection]) {
  		g._privilege[collection] = {};
		}
    g._privilege[collection][name] = criteria || true;
  };
};

Gravity.create_privilege("create");
Gravity.create_privilege("update");
Gravity.create_privilege("delete"); //TODO: Refactor this to 'destroy' to match cancan
Gravity.create_privilege("read");
Gravity.create_privilege("manage");

Gravity._criteria_satisfied = function(priv, document) {
  if (priv) {
    if (priv === true) {
      return true;
    } else {
      criteriaSatisified = true;
      for (var key in priv) {
        var value = priv[key];

        if (document[key] !== priv[key]) {
          criteriaSatisified = false;
        }
      }
      return criteriaSatisified;
    }
  } else {
    return false;
  }
};

Gravity.has_ability = function(collection, action, document) {
  if (!this._privilege[collection]) {
    return false;
  }

  if (this._criteria_satisfied(this._privilege[collection][action], document)) {
    return true;
  }

  if (this._criteria_satisfied(this._privilege[collection]["manage"], document)) {
    return true;
  }

  return false;
};

Gravity.abilities = function(collection) {
  var g = this;
  var can = {};
  can.create = function() { return g.has_ability(collection, "create", this); };
  can.update = function() { return g.has_ability(collection, "update", this); };
  can.delete = function() { return g.has_ability(collection, "delete", this); };
  can.read = function() { return g.has_ability(collection, "read", this); };
  return can;
};

Gravity.define_abilities_for_user = function(userId) {
  user = User.find({_id: userId});
  g._privelege = {};
  g.define_abilities(user);
};

Gravity.secure = function(collection) {
  var g = this;
  var options = {};
  options.insert = function(userId, doc) {
  	g.define_abilities_for_user(userId);
  	return g.has_ability(collection, "create", doc); 
  };
  options.update = function(userId, docs, fields, modifier) {
  	canUpdateAll = true;
  	g.define_abilities_for_user(userId);
  	for (var doc in docs) {
	  	if (!g.has_ability(collection, "update", doc)) {
	  		canUpdateAll = false;
	  	}
	  }
  	return canUpdateAll;
  };
  options.remove = function(userId, docs) { 
  	canUpdateAll = true;
  	g.define_abilities_for_user(userId);
  	for (var doc in docs) {
	  	if (!g.has_ability(collection, "delete", doc)) {
	  		canUpdateAll = false;
	  	}
	  }
  	return canUpdateAll;
  };

  collection.allow(options);
};

if (Meteor.is_client) {
	Gravity.define_abilities(Meteor.user(), Gravity.can);
}

//TODO: Figure out a way to restrict reads by hooking into publications
