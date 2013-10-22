var BOSH_SERVICE = 'https://tka.im:8080/http-bind'
var connection = null;
var DOMAIN = 'tka.im'
var full_jid = null;

function rawInput(data)
{
    console.log('RECV: ' + data);
    if(data.indexOf('urn:ietf:params:xml:ns:xmpp-bind')!=-1 &&
        data.indexOf("jid")!=-1){
        re = /<jid>(.*)<\/jid>/;
        full_jid = re.exec(data)[1];
    }
}

function rawOutput(data)
{
    console.log('SENT: ' + data);
    
}

function connect() {
    connection.connect($('#username').get(0).value+'@'+DOMAIN,
                   $('#password').get(0).value,
                   onConnect); 
}

function disconnect(){
     connection.disconnect();
       
}

function bind(data){
    alert('bind');
}


function updateStatusNiceName(data){
    v = VCard.jsonify(data);
    if('FN' in v){
        $(user_label).get(0).innerHTML=v['FN'];
    }
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
        document.getElementById('menu').removeChild(document.getElementById('usermenu'));
        $('#mainapp').hide();

		$('#login').show();
	}
    else if (status == Strophe.Status.CONNECTED) {
		
		console.log('Strophe is connected.');
	
		$('#login').hide();
        $('#password')[0].value = '';
		$('#mainapp').show();
		user_menu = document.createElement('li');
        user_menu.setAttribute('class',"active");
        user_menu.setAttribute('id','usermenu');
        user_label =document.createElement("a");
        user_label.setAttribute("href","#");
        user_label.setAttribute('id','user_label');
        user_label.innerHTML =$('#username').get(0).value;

		
        user_menu.appendChild(user_label);
       		
        sub_menu = document.createElement("ul");
    
        vcard_item = document.createElement("li");
        vcard_label = document.createElement("a");
        vcard_label.setAttribute("href","javascript:VCard.showVCard()");
        vcard_label.innerHTML = "Profile";
        vcard_item.appendChild(vcard_label);
	
        status_item = document.createElement('li');
        status_label = document.createElement("a");
        status_label.setAttribute("href","#");
        status_label.innerHTML = "Status";
        status_item.appendChild(status_label);
        
        status_list = document.createElement('ul');
        //status_list.setAttribute('class',);
        var statuses = ['Available','Away','Busy','Offline'];
        for(var i=0;i<statuses.length;i++){
            s_item= document.createElement('li');
            s_label = document.createElement("a");
            s_label.setAttribute('id',statuses[i].toLowerCase());
            s_label.setAttribute("href","javascript:Status.set_status('"+statuses[i]+"')");
            s_label.innerHTML = statuses[i];
            s_item.appendChild(s_label);
            status_list.appendChild(s_item);
        }
      
        m_item = document.createElement('li');
        m_input = document.createElement('input');
        m_input.setAttribute('id','status_message');
        m_input.setAttribute('type','text');
        m_input.setAttribute('value','');
        m_input.setAttribute('placeholder','Status message here');
        m_input.setAttribute('class','form-control');
        


        m_item.appendChild(m_input);
        status_list.appendChild(m_item);
        
        status_item.appendChild(status_list);

        
		quit_item = document.createElement("li");
        quit_label = document.createElement("a");
        quit_label.setAttribute("href","javascript:disconnect()");
        quit_label.innerHTML = "Logout";
        quit_item.appendChild(quit_label);

		
        sub_menu.appendChild(vcard_item);
        sub_menu.appendChild(status_item);
        sub_menu.appendChild(quit_item);
        user_menu.appendChild(sub_menu);

		
        document.getElementById('menu').appendChild(user_menu);
        Chat.connection.addHandler(Chat.handle_message,null,'message');
    	Roster.connection.addHandler(Roster.handle_presence,
                                 null, "presence");

		iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		connection.sendIQ(iq, Roster.handle_roster);
		connection.send($pres());
        connection.send($iq({type:'set',id:'s1',xmlns:'jabber:client'}).c('enable',{'xmlns':'urn:xmpp:carbons:2'}));
        Status.set_status('Available');
        $( "#status_message" ).keypress(function(event) { 
            if(event.keyCode == 13){
                Status.set_message($.trim($("#status_message").val()));
            }
            
	   });

        $( "#chatentry" ).keypress(function(event) { 
            if(event.keyCode == 13){
                Chat.send_message($.trim($("#chatentry").val()));
                $("#chatentry").val('');
            }
            else if(event.keyCode == 32){//space
                Chat.send_composing();
            }
       });

         VCard.getVCard(user_label.innerHTML,updateStatusNiceName);

    }
}

$(document).ready(function () {
    $('#mainapp').hide();
    $('#vcard').hide();
    
	if(typeof console === "undefined"){
    	console = { log: function() { } };
  	}
  	console.log("doc ready");
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;

    Roster.connection = connection;
    VCard.connection = connection;
    Status.connection = connection;
    Chat.connection = connection;
    //connection.addHandler(function(data){alert('bind');},null,'bind');
    $('#username').get(0).value = 'andersph';
    $('#password').get(0).value = 'flaps';
    connect();
});
