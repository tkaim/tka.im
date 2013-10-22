
var VCard = {
    connection: null,
    results: {},
    lastRes: null,

    showVCardForCurrentCorrespondent: function(){
        VCard.showVCard($(chatpanel)[0].getAttribute('user'));
    },

    showVCard: function(user){
        VCard.getVCard(user);
        $('#mainapp').hide();
        if(user==null)
        {
            $(vJid).val($(username).get(0).value);
            $(cancelvcardbutton).get(0).innerHTML = 'Cancel';
            $('#savevcard').show();
        }
        else{
            $(vJid).val($(username).get(0).value);
            $(cancelvcardbutton).get(0).innerHTML = 'Ok';
            $('#savevcard').hide();    
        }
        $('#vcard').show();
    },
    
    hide : function(){
        $('#vcard').hide();
        $('#mainapp').show();
    }
    ,
    handle_vcard_message: function(message){
    	id = message.getAttribute('id')
    	VCard.lastRes = message.childNodes.item(0);
    	res = VCard.jsonify(VCard.lastRes);
        if('FN' in res){
            $(vDisplayName).val(res['FN']);
        }

        if('NICKNAME' in res){
            $(vNickName).val(res['NICKNAME']);   
        }

        if('N' in res){
            if('FAMILY' in res['N']){
                $(vFamilyName).val(res['N']['FAMILY']);
            }
            if('GIVEN' in res['N']){
                $(vGivenName).val(res['N']['GIVEN']);
            }
            if('MIDDLE' in res['N']){
                $(vMiddleName).val(res['N']['MIDDLE']);
            }
        }
    	//VCard.results[id] = res;
    	//return true;
    },

    getVCard : function(user,handler){
    	iq = null;
        if(user==null){
            iq = $iq({type: 'get'}).c('vCard', {xmlns: 'vcard-temp'});
        }
        else
        {
            iq = $iq({type: 'get','to':user+'@'+DOMAIN}).c('vCard', {xmlns: 'vcard-temp'});
        } 	
        VCard.connection.sendIQ(iq, handler==null ? VCard.handle_vcard_message : handler);
    },

    save : function(){
    	iq = $iq({type: 'set'}).c('vCard', {xmlns: 'vcard-temp'});
        if($.trim($("#vDisplayName").val())!=""){
            iq.c('FN',$.trim($("#vDisplayName").val()));
        }
        
        if($.trim($("#vNickName").val())!=""){
            iq.up();
            iq.c('NICKNAME',$.trim($("#vNickName").val()));
        }
        VCard.connection.sendIQ(iq,null);
        $(user_label).get(0).innerHTML = $.trim($("#vDisplayName").val());
        VCard.connection.send($pres());
        VCard.hide();	
    },

    jsonify: function(vcard){
    	
    	if(vcard.childNodes.length==1 && vcard.childNodes[0].nodeType ==3){
    		return vcard.childNodes[0].nodeValue;
    	}
    	else
    	{
    		xx = {};
    		for(var i =0;i<vcard.childNodes.length;i++)
    		{	
    			nextNode = vcard.childNodes[i];
    			xx[nextNode.nodeName] = VCard.jsonify(nextNode);
    		}
    		return xx;
    	}
    }


}


