var Chat = {
    connection: null,
    conversations:  {},
    a_message:null,
    
    send_composing : function(){
        user = $(chatpanel)[0].getAttribute('user');
        msg = $msg({to: user+'@'+DOMAIN, from: $('#username').get(0).value+'@'+DOMAIN, type: 'chat'});
        msg.c('composing',{xmlns:'http://jabber.org/protocol/chatstates'});
        Chat.connection.send(msg);
            
    },

    send_message: function(message){
        user = $(chatpanel)[0].getAttribute('user');
        if(user!='' && message.trim()!=''){
            msg = $msg({to: user+'@'+DOMAIN, from: $('#username').get(0).value+'@'+DOMAIN, type: 'chat',id:new Date().getTime()}).c("body").t(message);
            console.log(msg.toString);
            Chat.connection.send(msg);
            v_message = {time:new Date(),'author':$(user_label).get(0).innerHTML,'content':message};

            if(!(user in Chat.conversations)){
                Chat.conversations[user] = [];
            }
            msgs = Chat.conversations[user];
            Chat.render_message(v_message,msgs.length==0?null:msgs[msgs.length-1]['time']);
            Chat.conversations[user].push(v_message);    
        }
    },

    update_chat: function(user){
        //alert(user);
        chat = $(chatpanel)[0];
        if(chat.getAttribute('user')!=user){
            $(composing)[0].innerHTML = '';
            $(chatpanelbanner)[0].setAttribute('class',$('#roster_'+user)[0].getAttribute('class')+ ' btn-statusheader');
            $(chatpanelbanner)[0].innerHTML = Roster.getStatusMessage(user);

            chat.setAttribute('user',user);
            console.log('Erasing old chat');
            while(chat.firstChild){
                chat.removeChild(chat.firstChild);
            }
            if(user in Chat.conversations){
                console.log('Preparing chat window');
                messages = Chat.conversations[user];
                for(var i=0;i<messages.length;i++){
                    Chat.render_message(messages[i],i==0 ? null : messages[i-1]['time']);
                }
            }
        }
    },

    render_message: function(message,prevTime){

        date = message['time'].toDateString();
        if(prevTime==null || prevTime.toDateString()!=date){
            date_row = document.createElement('div');
            date_row.setAttribute('class','row');
            date_cell = document.createElement('div');
            date_cell.setAttribute('class','col-md-12');
            date_cell.setAttribute('style','text-align:center');
            date_cell.innerHTML = date;
            date_row.appendChild(date_cell);
            $(chatpanel)[0].appendChild(date_row);               
         }

        d = document.createElement('div');
        d.setAttribute('class','row');

        tc = document.createElement('div');
        tc.setAttribute('class','col-md-1');

        mins = message['time'].getMinutes();
        if(mins <10){
            mins = '0'+mins;
        }
        tc.innerHTML = message['time'].getHours()+':'+mins;
        d.appendChild(tc);

        uc = document.createElement('div');
        uc.setAttribute('class','col-md-2');
        author = message['author'];
        if(author in Roster.nameMap){
            author = Roster.nameMap[author];
        }
        uc.innerHTML = author;
        d.appendChild(uc);
        mc = document.createElement('div');
        mc.setAttribute('class','col-md-9');

        content = message['content'];
        content =content.replace(/(http(s)?:\/\/[^ ]*)/g,'<a href=\'$1\' target=\"_blank\">$1</a>')
        //todo - render links as valid a tags, format html formatted strings.

        mc.innerHTML = content;
        d.appendChild(mc);
        $(chatpanel)[0].appendChild(d);
        $(chatpanel)[0].scrollTop = d.offsetTop;
    },
    
    handle_message: function(message){
        //alert(message.toString());
        from = $(message).attr('from');
        from = from.substring(0,from.indexOf('@'));
        //alert(from);
        content = $(message).children()[0];
        if(content.nodeName=='sent'){//carbon
            f_message = content.childNodes[0].childNodes[0];
            to = f_message.getAttribute('to');
            to = to.substring(0,to.indexOf('@'));
            Chat.a_message = to;
            
            f_content = f_message.childNodes[0].childNodes[0].nodeValue;
            v_message = {'time':new Date(),'author':$(user_label).get(0).innerHTML,'content':f_content};

            if(!(to in Chat.conversations)){
                Chat.conversations[to] = [];
            }
            msgs = Chat.conversations[to];
            Chat.conversations[to].push(v_message);    
            if($(chatpanel)[0].getAttribute('user')==to){
                Chat.render_message(v_message,msgs[msgs.length-1]['time']);
            }
            
        }
        else if(content.nodeName=='body')// this is a message
        {
            $(composing)[0].innerHTML = '';
            id = $(message).attr('id');
            if(id!=null){
                id = parseInt(id);
            }
            Chat.a_message = id;
            timeStamp = (id ==null || isNaN(id) || id==1) ? new Date() : new Date(id);

            v_message = {'time':timeStamp,'author':from,'content':content.childNodes[0].nodeValue};

            if(!(from in Chat.conversations)){
                Chat.conversations[from] = [];
            }
            chat = $(chatpanel)[0];
            if(chat.getAttribute('user')==from){
                msgs = Chat.conversations[from];
                Chat.render_message(v_message,msgs.length==0?null:msgs[msgs.length-1]['time']);
            }
            else{
                // todo - UI notifcations on tabs.
            }
            Chat.conversations[from].push(v_message);   
        }
        else if(content.nodeName=='composing'){
            $(composing)[0].innerHTML = 'Typing...';
        }
        return true;
    }
    
};