var Roster = {
    connection: null,
    people:{},
    nameMap : {},
    flaps: null,

    handle_roster: function(message){
        
        folk = message.childNodes.item(0).childNodes;
        var contacts = {};
        for(var i=0;i<folk.length;i++){
            contacts[folk.item(i).getAttribute('jid').replace('@'+DOMAIN,'')] = folk.item(i).getAttribute('subscription');
        }

        keys = Object.keys(contacts);
        keys.sort();
        ros = $(roster).get(0);
        while(ros.firstChild){
            ros.removeChild(ros.firstChild);
        }

        for (var i =0;i<keys.length;i++){               
            person = keys[i];
            d = document.createElement('div');
            d.setAttribute('class','row');

            status = contacts[person];
            if(status=='both'){
                status = 'offline'
            }
            
            user = document.createElement('div');
            user.setAttribute('id','roster_'+person);
            user.setAttribute('user',person);
            var smap = {'offline':'btn-danger',
                'xa':'btn-warning','dnd':'btn-danger',
                'online':'btn-primary','none':'disabled'}
                //user.setAttribute('class','contact-status-'+status);
            user.setAttribute('class','btn btn-block btn-lg ' + smap[status] + ' btn-unrounded');
             
            user.innerHTML = person;

            
            

            d.appendChild(user);
            
            $(roster)[0].appendChild(d);
        }
        return true;
    },

    handle_vcard : function(data){
        from = data.getAttribute('from').replace('@'+DOMAIN,'');
        vr = VCard.jsonify(data);
        if('FN' in vr){
            document.getElementById('roster_'+from).innerHTML = vr['FN'];
            Roster.nameMap[from] = vr['FN'];
        }
        else
        {
            Roster.nameMap[from] = from;
        }

    },

    getStatusMessage: function(person){
        name = person;
        if(person in Roster.nameMap){
            name = Roster.nameMap[person];
        }
        statusMessage = Roster.people[person]['status_message'];
        if(statusMessage!=''){
            name = name + ' - ' + statusMessage;
        }

        return name;

    },

    handle_presence: function (message) {
        // obviously needs to get cleverer.
        
        from = $(message).attr('from');
        
        changed = false;
        if (from.indexOf($(username).get(0).value+'@'+DOMAIN)==-1) {
            person = from.substring(0,from.lastIndexOf('/')).replace('@'+DOMAIN,'');
            x = message.getElementsByTagName('show');
            status = "online";
            status_message = "";
            if(x.length>0){
                status = x.item(0).childNodes.item(0).nodeValue;
            }
            
            if(message.getElementsByTagName('status').length>0){
                sm =message.getElementsByTagName('status').item(0).childNodes[0];
                if(Object.prototype.toString.call(sm)=='[object Text]'){
                    status_message = sm.nodeValue;
                }
            }

            if (!( person in Roster.people)){
                Roster.people[person] = {};                
                Roster.people[person][from] = status;
                changed = true;
            }
            Roster.people[person]['status'] = status;
            Roster.people[person]['status_message'] = status_message;
         

            VCard.getVCard(person,Roster.handle_vcard);
            relem = document.getElementById('roster_'+person);
            var smap = {'offline':'btn-danger',
            'xa':'btn-warning',
            'away':'btn-warning',
            'dnd':'btn-danger',
            'online':'btn-primary',
            'none':'disabled'}
            
            relem.setAttribute('class','btn btn-block btn-lg ' + smap[status] + ' btn-unrounded');
            if($(chatpanel)[0].getAttribute('user')==person){
                $(chatpanelbanner)[0].innerHTML = Roster.getStatusMessage(person);
                $(chatpanelbanner)[0].setAttribute('class',relem.getAttribute('class')+ ' btn-statusheader');
            }
            if(status!='none'){
                relem.setAttribute('onclick','javascript:Chat.update_chat(\''+person+'\')');
            }
        }
        
        return true;
    }
};