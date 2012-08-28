// Generated by CoffeeScript 1.3.3
(function() {

  jQuery(function($) {
    var addNotification, authenticate, authenticated, clearMemberExchange, client, connect_guest, connect_member, getMemberExchange, member_exchange, on_connect_auth, on_connect_guest, on_connect_member, on_error_auth, on_error_guest, on_error_member, setMemberExchange;
    setMemberExchange = function(value) {
      var date, expires;
      date = new Date();
      date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
      return document.cookie = "exchange=" + value + expires + "; path=/";
    };
    getMemberExchange = function() {
      var c, key, _i, _len, _ref;
      key = "exchange=";
      _ref = document.cookie.split(";");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(key) === 0) {
          return c.substring(key.length, c.length);
        }
      }
      return null;
    };
    clearMemberExchange = function() {
      var date, expires;
      date = new Date();
      date.setTime(date.getTime() - (24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
      return document.cookie = "exchange=" + expires + "; path=/";
    };
    addNotification = function(html) {
      var container, notification;
      container = $("#amqp-notifications");
      if (!container.length) {
        container = $("<div id=\"amqp-notifications\"></div>").appendTo("body");
      }
      notification = $("<div class=\"amqp-notification\">" + html + "</div>");
      window.setTimeout((function() {
        return notification.fadeOut(500, function() {
          return notification.remove();
        });
      }), 5000);
      return notification.appendTo(container);
    };
    on_connect_guest = function(response) {
      if (typeof console !== "undefined" && console !== null) {
        console.log("on_connect " + response);
      }
      return client.subscribe("/topic/published", function(message) {
        var data;
        if (typeof console !== "undefined" && console !== null) {
          console.log("on_message " + message);
        }
        data = JSON.parse(message.body);
        return addNotification("<p>Just published:<br/>" + ("<a href=\"" + data.url + "\">" + data.title + "</a></p>"));
      });
    };
    on_error_guest = function(response) {
      return typeof console !== "undefined" && console !== null ? console.log("on_error " + response) : void 0;
    };
    on_connect_member = function(response) {
      on_connect_guest(response);
      client.subscribe("/exchange/" + member_exchange + "/*", function(message) {
        var actions, data, key, value, _ref;
        if (typeof console !== "undefined" && console !== null) {
          console.log("on_message " + message);
        }
        if (message.headers["content-type"] === "application/x-json") {
          data = JSON.parse(message.body);
          if (/^\/exchange\/reviewers\//.test(message.destination)) {
            actions = $("<ul></ul>");
            _ref = data != null ? data.actions : void 0;
            for (key in _ref) {
              value = _ref[key];
              actions.append(("<li><a href=\"" + data.url + "/content_status_modify?") + ("workflow_action=" + key + "\">" + value + "</a></li>"));
            }
            if (actions.children().length) {
              actions = "<ul>" + (actions.html()) + "</ul>";
            } else {
              actions = "";
            }
            return addNotification("<p>Waiting for review:<br/>" + ("<a href=\"" + data.url + "\">" + data.title + "</a></p>") + actions);
          }
        } else {
          return addNotification(message.body);
        }
      });
      return client.subscribe("/amq/queue/" + member_exchange + "-keepalive", function(message) {
        return null;
      });
    };
    on_error_member = function(response) {
      if (typeof console !== "undefined" && console !== null) {
        console.log("on_error " + response);
      }
      if (new RegExp("no exchange '" + member_exchange + "'").test(response)) {
        if (typeof console !== "undefined" && console !== null) {
          console.log("DO AUTHENTICATE");
        }
        return authenticate();
      }
    };
    on_connect_auth = function(response) {
      if (typeof console !== "undefined" && console !== null) {
        console.log("on_connect " + response);
      }
      if (typeof console !== "undefined" && console !== null) {
        console.log("sending authentication request");
      }
      return $.get("" + portal_url + "/@@configure-member-exchange", function(response) {
        var member_exchange;
        member_exchange = JSON.parse(response);
        if (member_exchange) {
          setMemberExchange(member_exchange);
          return on_connect_member("AUTHENTICATED");
        } else {
          return on_connect_guest("AUTHENTICATION REJECTED");
        }
      });
    };
    on_error_auth = function(response) {
      if (typeof console !== "undefined" && console !== null) {
        console.log("on_error " + response);
      }
      return connect_guest();
    };
    connect_guest = function() {
      return client.connect("guest", "guest", on_connect_guest, on_error_guest, "/");
    };
    connect_member = function() {
      return client.connect("guest", "guest", on_connect_member, on_error_member, "/");
    };
    authenticate = function() {
      return client.connect("guest", "guest", on_connect_auth, on_error_auth, "/");
    };
    Stomp.WebSocketClass = SockJS;
    client = Stomp.client("http://" + window.location.hostname + ":55674/stomp");
    authenticated = !$("#personaltools-login").length;
    member_exchange = getMemberExchange();
    if (!authenticated) {
      if (typeof console !== "undefined" && console !== null) {
        console.log("CONNECT GUEST");
      }
      connect_guest();
      return clearMemberExchange();
    } else if (!member_exchange) {
      return authenticate();
    } else {
      if (typeof console !== "undefined" && console !== null) {
        console.log("CONNECT MEMBER");
      }
      return connect_member();
    }
  });

}).call(this);
