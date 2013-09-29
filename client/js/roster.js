var Roster = {
    connection: null,
    people:{},

    handle_roster: function(message){
        
        folk = message.childNodes.item(0).childNodes;
        var contacts = {};
        for(var i=0;i<folk.length;i++){
            contacts[folk.item(i).getAttribute('jid').replace('@'+DOMAIN,'')] = folk.item(i).getAttribute('subscription');
        }

        keys = Object.keys(contacts);
        keys.sort();
        while($('roster').firstChild){
            roster.removeChild(roster.firstChild);
        }

            for (var i =0;i<keys.length;i++){               
                person = keys[i];
                d = document.createElement('div');
                d.setAttribute('class','row');

                status = contacts[person];
                if(status=='both'){
                    status = 'offline'
                }
                symbol = document.createElement('div');
                symbol.setAttribute('id','roster_'+person+'_symbol');
                symbol.setAttribute('class','symbol-contact-status-'+status)
                d.appendChild(symbol);

                user = document.createElement('div');
                user.setAttribute('id','roster_'+person);
                user.setAttribute('user',person);
                user.setAttribute('class','contact-status-'+status);
                user.innerHTML = person;

                d.appendChild(user);
                $(roster)[0].appendChild(d);
            }
        return true;
    },

    show_chat : function(elem){

        relem = document.createElement('div');
        xrelem = document.createElement('p');
        xrelem.innerHTML = 'flaps';
        relem.appendChild(xrelem);
        relem.dialog();    

    },

    handle_presence: function (message) {
        // obviously needs to get cleverer.
        from = $(message).attr('from');
        changed = false;
        if (from.indexOf($(jid).get(0).value+'@'+DOMAIN)==-1) {
            person = from.substring(0,from.lastIndexOf('/')).replace('@'+DOMAIN,'');
            x = message.getElementsByTagName('show');
            status = "online";
            if(x.length>0){
                status = x.item(0).childNodes.item(0).nodeValue;
            }
            if (!( person in Roster.people)){
                Roster.people[person] = {};                
                Roster.people[person][from] = status;
                changed = true;
            }
            Roster.people[person]['status'] = status;
            relem = document.getElementById('roster_'+person);
            if(status=='offline'){
                relem.setAttribute('class','contact-status-offline');
            }
            else{
                relem.setAttribute('class','contact-status-online');
                /**if (relem.addEventListener) {
                    relem.addEventListener("click", show_chat, false);
                } else {
                    relem.attachEvent('onclick', show_chat);
                }*/
            }
            relem = document.getElementById('roster_'+person+'_symbol');
            relem.setAttribute('class','symbol-contact-status-'+status);
            //dclass = x.getAttribute('class');

        }
        
        return true;
    }
};