gravity
=======

Overview
--------

This package for Meteor.js enables semi-declarative authorization.  It was inspired by Ryan Bates' cancan (for Rails).  Once you define your authorization rules, they will be enforced on the server, and you can check them in your client-side templates.

Usage
-----
Below is an example of declaring your authorization rules. (Put this in a file available to both client and server, for example "abilities.js" in your app's root folder.)  The rules permit a user named "Bill Brasky" to manage (perform all actions) on the Todos collection, and permits all other logged-in users to create or update Todos, or to delete the Todo titled "Marie Curie". (The criteria has can have multiple criteria, all of which must match, and is the way you could enforce that a user can only modify or delete their own items.)

``` javascript
if (typeof Gravity === 'undefined') {
	Gravity = {};
}

Gravity.define_abilities = function(user, can) {
  if (user) {
    if(user.name == "Bill Brasky") {
      can.manage(Todos);
    } else {
      can.create(Todos);
      can.update(Todos);
      can.delete(Todos, {text: "Marie Curie"});
    }
  }
};
```

In your templates, you can include conditionals that check permissions on specific resources before showing widgets that enable data modification.  The example below (derived from the "todo" example included with Meteor), checks that the logged-in user has access to create items in the Todo collection before showing the button.

``` javascript
<template name="todos">
  {{#if can.create}}
    <div id="new-todo-box">
      <input type="text" id="new-todo" placeholder="New item" />
    </div>
  {{/if}}
  ...
</template>
```

Installation
------------
This isn't straight-forward just yet. *** You need to be using the "auth" branch of Meteor in order to use this. *** Follow the instructions on meteor.com for installing from git, and switch to the "auth" repository.
When they integrate that into the main branch, I'll hook this into meteorite.

Wiring it up
------------
In the Meteor.startup handler in your client-side code, add a "can" helper object for use in the templates, and set it to an invocation of "Gravity.abilities" on the collection that corresponds to the template. For example:
``` javascript
  Template.todos.can = Gravity.abilities(Todos);
  Template.todo_item.can = Gravity.abilities(Todos);
```

In the Meteor.startup handler in your server-side code, for each collection that should be secured with gravity, call Gravity.secure, passing in the collection.

Limitations
-----------

Gravity doesn't currently secure read operations (only data modification).

Future plans
------------
First, I would like to be able to secure read operations, which will probably entail hooking into publications.

Next, I'd like to have a way of optionally securing all collections on the server side (rather than identifying each table to secure), and maybe also hooking up the template helpers based on a naming convention.
