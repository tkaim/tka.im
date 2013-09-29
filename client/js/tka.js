var BOSH_SERVICE = 'https://tka.im:8080/http-bind'
var connection = null;
var DOMAIN = 'tka.im'

function log(msg) 
{
    $('#chatpanel').append('<div></div>').append(document.createTextNode(msg));
}

function rawInput(data)
{
    console.log('RECV: ' + data);
}

function rawOutput(data)
{
    console.log('SENT: ' + data);
}

function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
	console.log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
		console.log('Strophe failed to connect.');
		$('#connect').get(0).value = 'connect';
		$('#login').show();
		
    }
     else if (status == Strophe.Status.DISCONNECTED) {
		$('#login').show();
	}
    else if (status == Strophe.Status.CONNECTED) {
		console.log('Strophe is connected.');
		$('#login').hide();
		$('#loginbutton').val('Logout');
		Roster.connection.addHandler(Roster.handle_presence,
                                 null, "presence");
		iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		connection.sendIQ(iq, Roster.handle_roster);
		connection.send($pres());
	}
}

$(document).ready(function () {
	if(typeof console === "undefined"){
    	console = { log: function() { } };
  	}
  	console.log("doc ready");
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;

    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
	    button.value = 'disconnect';

	    connection.connect($('#jid').get(0).value+'@'+DOMAIN,
			       $('#pass').get(0).value,
			       onConnect);
	} else {
	    button.value = 'connect';
	    connection.disconnect();
	}
    });
    Roster.connection = connection;
});
