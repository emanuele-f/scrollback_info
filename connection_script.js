function makeAction(action, props) {
	var i;
	for (i in action) {
		delete action[i];
	} //doing something weird and stupid to maintain the reference of the object. should change this soon.
	for (i in props) {
		if (props.hasOwnProperty(i)) action[i] = props[i];
	}

	if (libsb.user && libsb.user.id) {
		action.from = libsb.user.id;
	}

	action.time = new Date().getTime();
	if (localStorage.hasOwnProperty("session")) {
		action.session = localStorage.session;
	} else {
		action.session = libsb.session;
	}
	action.resource = libsb.resource;
	return action;
}

var client = new SockJS("http://local.scrollback.io:81" + "/socket");
client.onmessage = function(event) {
    alert(event);
    var data = JSON.parse(event.data);
    libsb.emit(data.type + "-dn", data);
}



var init = {
        id: libsb.resource+"z",
		origin: {"gateway":"web"},
        session: libsb.session,
        suggestedNick: "kamal"
	};

var action, newAction = {
		type: 'init',
		to: 'me',
        id: init.id,
		origin: init.origin
    };
newAction.session = init.session;

//newAction.suggestedNick = "jack";
action = makeAction(init, newAction);
client.send(JSON.stringify(action));

// un esempio di buona risposta è:
// SimpleEvent(type=message, data={"type":"init","to":"me","id":"1oanus5dqy318z5g0jtgc0fwvj477crfz","origin":{"gateway":"web","client":"127.0.0.1"},"session":"web://d7imrj3uwbqkq14eu7j1lntvanlh3y5j","time":1423013236514,"resource":"1oanus5dqy318z5g0jtgc0fwvj477crf","eventStartTime":1423013236513,"from":"guest-blefor","user":{"id":"guest-blefor","description":"","createTime":1423013236530,"type":"user","params":{},"timezone":0,"sessions":["web://d7imrj3uwbqkq14eu7j1lntvanlh3y5j"],"picture":"https://gravatar.com/avatar/a88fb7173e4d1e69a370e54594e0c224/?d=retro"},"memberOf":[],"occupantOf":[]})
