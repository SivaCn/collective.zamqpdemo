// Generated by CoffeeScript 1.3.3
(function() {

  jQuery(function($) {
    var client, on_connect, on_error;
    Stomp.WebSocketClass = SockJS;
    client = Stomp.client("http://" + window.location.hostname + ":55674/stomp");
    on_connect = function(response) {
      var id;
      if (typeof console !== "undefined" && console !== null) {
        console.log("on_connect " + response);
      }
      return id = client.subscribe("/exchange/amqpdemo.notifications/*", function(message) {
        var data, el;
        if (typeof console !== "undefined" && console !== null) {
          console.log("on_message " + message);
        }
        data = $.parseJSON(message.body);
        el = $("<p class=\"amqp-notification\">Just published:<br/>" + ("<a href=\"" + data.url + "\">" + data.title + "</a></p>"));
        window.setTimeout((function() {
          return el.fadeOut(500);
        }), 3000);
        return $("body").append(el);
      });
    };
    on_error = function(response) {
      return typeof console !== "undefined" && console !== null ? console.log("on_error " + response) : void 0;
    };
    return client.connect("amqpdemo", "amqpdemo", on_connect, on_error, "/amqpdemo");
  });

}).call(this);
