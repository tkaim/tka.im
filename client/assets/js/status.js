var Status = {
    connection: null,
    xmpp_presence: null,
    message: null,


    set_status : function(status){
        Status.xmpp_presence = status;
        Status.update_presence();
    },

    set_message: function(message){
        Status.message = message;
        Status.update_presence();
    },

    update_presence : function(){
        //Status.xmpp_presence =Ststatus.toLowerCase();
        
        
        xm = $pres({'from':full_jid});

        actual_xmpp_presence = Status.xmpp_presence.toLowerCase();
        if(actual_xmpp_presence=='busy'){
            actual_xmpp_presence ='dnd';
        }
        else if(actual_xmpp_presence=='available'){
            actual_xmpp_presence = 'online';
        }

        xm.c('show',actual_xmpp_presence);
        if(Status.message!=null && Status.message!=""){
            xm.up();
            xm.c('status',Status.message);
        }

        Status.connection.send(xm);

        presence = document.getElementById('presence');
        if(presence==null){
            presence = document.createElement('span');
            presence.setAttribute('class','navbar-unread');
            presence.setAttribute('id','presence');
            presence.innerHTML = 1;
        }
        else{
            presence.parentElement.removeChild(presence)  
        }
        link = document.getElementById(Status.xmpp_presence.toLowerCase());
        link.appendChild(presence);
        return true;   
    }

    
};