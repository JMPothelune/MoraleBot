var dotenv = require('dotenv');
dotenv.load();
var slack = require('slack')


var bot = slack.rtm.client()
var token = process.env.SLACK_TOKEN

var icons = ["smile", "neutral_face", "white_frowning_face"]
var botId;
var botName = "MoraleBot"

var postedMessages = {}
bot.started(function(payload) {
  botId = payload.self.id;
})

// respond to a user_typing message
bot.user_typing(function(msg) {
  console.log('several people are coding', msg)
})

bot.reaction_added(function(data){
  if(data.user == botId) return;
  console.log('REACTION', data)

  if(data.item.type == "message"){
    console.log('type ok')

    if(postedMessages[data.item.channel] == data.item.ts){
      slack.chat.delete({token : token, channel : data.item.channel, ts: data.item.ts}, console.log)
      slack.chat.postMessage({token : token, username : botName,  channel : data.item.channel, text : "Merci pour votre réponse :"+data.reaction+":" }, console.log)
    }
  }
})

bot.message(function(data){
  console.log('blabla', data)
  if(data.subtype != null) return
    console.log('OKKK')
    askForMoral(data.channel)
})

askForMoral = function(channel){
  text = "Comment ça se passe aujourd'hui?"
  slack.chat.postMessage({token : token, username : botName,  channel : channel, text : text }, onMessagePosted)
}

onMessagePosted = function(err, data) {
  postedMessages[data.channel] = data.ts;
  addReaction(icons.slice(0), data.channel, data.ts)(null, null);
}


addReaction = function(reactions, channel, ts){
  if (typeof reactions !== 'undefined' && reactions.length > 0) {
    reaction_name = reactions.shift()
    return function(err) {
      slack.reactions.add({token:token, name:reaction_name, channel:channel, timestamp:ts}, addReaction(reactions, channel, ts));
    }
  }
  else {
    return function(err){}
  }
}


// start listening to the slack team associated to the token
bot.listen({token:token})
