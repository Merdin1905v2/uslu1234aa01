const fs = require('fs');
const Discord = require("discord.js");
require('dotenv').config();
const client = new Discord.Client();
const { promisify } = require("util");
const db = require('quick.db')
const ytdl = require('ytdl-core');
const chalk = require("chalk");
const YouTube = require('simple-youtube-api');
const moment = require("moment");
const Jimp = require('jimp');
const config =require("./config.json");
const express = require('express'); // Full İngiliççe
const db2 = require("wio.db");
const ms2 = require("parse-ms");
const ms = require("ms");
const Canvas = require('canvas');
const queue = new Map();
const { GiveawaysManager } = require('discord-giveaways');
const prefix = 'u!'

const DisTube = require('distube'),
 distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true }); 

/////
const app = express()
app.get('/', (req, res) => res.send("Bot Online"))
app.listen(process.env.PORT, () => console.log('Port ayarlandı: ' + process.env.PORT))
//////////////////
client.avatarURL =
  "https://cdn.discordapp.com/attachments/816247170437087293/822052715298947122/uslu.png"; // Optional

  /////
  /////

client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  let command = message.content.split(' ')[0].slice(config.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
     cmd.run(client, message, params, perms);
  }
})


client.on("ready", () => { 
  console.log(`${client.user.tag} adı ile giriş yapıldı!`);
  client.user.setStatus("idle");
  client.user.setActivity('Uslu v0.3 ^ u!sponsor ^ u!yardım www.yoldashost.com'); // Bura olmucak yani durumu olmucak prefix !
})


const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut ismi: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

  
client.yetkiler = message => { // Bot Sahibi Yetkileri
  if(!message.guild) {
	return; }
  let permlvl = -config.varsayilanperm  ;
  if(message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if(message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if(message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if(message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if(message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if(message.author.id === message.guild.ownerID) permlvl = 6;
  if(message.author.id === config.sahip) permlvl = 7;
  return permlvl;
};

client.login(config.token) //Client'a giriş yap client.login('tokengiriniz') Bu Şekildede Olabilir
/////////////////////// KOMUTLAR ////////////////////////////////
// EMOJİ ROL
client.on("message", async message => {
  if(message.author.bot) return;
  var spl = message.content.split(" ");
  if(spl[0] === "u!emoji-rol-ayarla") {
  var args = spl.slice(1);
  var msg, emoji, rol, ee = "";
  try {
    msg = await message.channel.messages.fetch(args[0])
    emoji = args[1]
    rol = message.guild.roles.cache.get(args[2]) || message.mentions.roles.first();
    await msg.react(emoji)
    if(!rol) throw new Error("Düzgün bir rol yaz")
  } catch(e) {
    if(!e) return;
    e = (""+e).split("Error:")[1]
    if(e.includes("Cannot read property") || e.includes("Invalid Form Body")) {
      message.channel.send(`Mesaj id hatalı!`)
    } else if(e.includes("Emoji")) {
      message.channel.send(` Girdiğiniz emoji mesaja eklenemiyor!`)
    } else if(e.includes("ROLÜ")) {
      message.channel.send(`Girdiğiniz rol geçersiz!`)
    }
    ee = e
  }
   if(ee) return;
   message.channel.send(`<a:Onaylama:736297416709373992> Emoji rol, **${msg.content}** içerikli mesaja atandı!`)
   db.push(`tepkirol.${message.guild.id}`, {
     kanal: msg.channel.id,
     rol: rol.id,
     mesaj: msg.id,
     emoji: emoji
   })
  } else if(spl[0] === "u!emoji-rol-log") {
    var args = spl.slice(1)
    var chan = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first()
    if(!chan) return message.channel.send(`<a:anqy:736295314402705428> Kanal etiketle veya id gir`)
    db.set(`tepkirolkanal.${message.guild.id}`, chan.id)
    message.channel.send("<a:Onaylama:736297416709373992> Tepkirol log kanalı "+ chan+ " olarak ayarlandı!")
  }
})

client.on("raw", async event => {
  if(event.t === "MESSAGE_REACTION_ADD") {
    var get = db.get(`tepkirol.${event.d.guild_id}`)
    if(!get) return;
    var rol = get.find(a => a.emoji === event.d.emoji.name && a.mesaj === event.d.message_id)
    if(!rol) return;
    rol = rol.rol
    var member = await client.guilds.cache.get(event.d.guild_id).members.fetch(event.d.user_id)
    member.roles.add(rol);
    var kanal = db.get(`tepkirolkanal.${event.d.guild_id}`)
    if(kanal) {
      var kanal = client.channels.cache.get(kanal)
      kanal.send(member  + " kullanıcısına, **" + kanal.guild.roles.cache.get(rol).name + "** adlı rol verildi! ")
    }
  } else if(event.t === "MESSAGE_REACTION_REMOVE") {
    var get = db.get(`tepkirol.${event.d.guild_id}`)
    if(!get) return;
    var rol = get.find(a => a.emoji === event.d.emoji.name && a.mesaj === event.d.message_id)
    if(!rol) return;
    rol = rol.rol
    var member = await client.guilds.cache.get(event.d.guild_id).members.fetch(event.d.user_id)
    member.roles.remove(rol);
    var kanal = db.get(`tepkirolkanal.${event.d.guild_id}`)
    if(kanal) {
      var kanal = client.channels.cache.get(kanal)
      kanal.send(member + " kullanıcısından, **" + kanal.guild.roles.cache.get(rol).name + "** adlı rol alındı!")
    }
  }
})
// EMOJİ ROL

// OTOROL

// OTOROL

// OTOROL 2\\
client.on("guildMemberAdd", async (member,) => {
  let kanal = db.fetch(`judgekanal_${member.guild.id}`);
  let rol = db.fetch(`judgerol_${member.guild.id}`);
  let mesaj = db.fetch(`judgemesaj_${member.guild.id}`);

  if (!kanal) return; 
  member.roles.add(rol);
  client.channels.cache
    .get(kanal)
    .send(new Discord.MessageEmbed()
      .setColor(`#66c4a6`)
      .setDescription("> <a:boost1:732696855821156571> **`" +
        member.user.username +
        "`** Adlı Kullanıcı Sunucuya Katıldı Rol Verildi Seninle Beraber `" +
        member.guild.memberCount +
        "` <a:Onaylama:736297416709373992>")
    );
});
// OTOROL 2\\

//SAYAÇ \\
client.on("guildMemberAdd", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal = await db.fetch(`sayacK_${member.guild.id}`);
  if (!sayac) return;
  if (member.guild.memberCount >= sayac) {
    member.guild.channels.cache
      .get(skanal)
      .send(new Discord.MessageEmbed()
      .setColor(`#66c4a6`)
      .setDescription(`> <a:boost1:732696855821156571> **${
          member.user.tag
        }** Sunucuya **Katıldı**! \`${db.fetch(
          `sayac_${member.guild.id}`
        )}\` Kullanıcı Oldu Sayaç Başarıyla Sıfırlandı.`)
      );
    db.delete(`sayac_${member.guild.id}`);
    db.delete(`sayacK_${member.guild.id}`);
    return;
  } else {
    member.guild.channels.cache
      .get(skanal)
      .send(new Discord.MessageEmbed()
        .setColor(`#66c4a6`)
        .setDescription(`> <a:boost1:732696855821156571> **${
          member.user.tag
        }**  Adlı Kullanıcı Sunucuya **Katıldı** \`${db.fetch(
          `sayac_${member.guild.id}`
        )}\` Kullanıcı Olmaya  \`${db.fetch(`sayac_${member.guild.id}`) -
          member.guild.memberCount}\` Kullanıcı Kaldı. \`${
          member.guild.memberCount
        }\` Kişiyiz! <a:GiriGif1:736297359188820120>`)
      );
  }
});

client.on("guildMemberRemove", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal = await db.fetch(`sayacK_${member.guild.id}`);
  if (!sayac) return;
  member.guild.channels.cache
    .get(skanal)
    .send(new Discord.MessageEmbed()
      .setColor(`#66c4a6`)
      .setDescription(`> <a:boost1:732696855821156571> **${
        member.user.tag
      }** Adlı Kullanıcı Sunucudan **Ayrıldı** \`${db.fetch(
        `sayac_${member.guild.id}`
      )}\` Kullanıcı Olmaya \`${db.fetch(`sayac_${member.guild.id}`) -
        member.guild.memberCount}\` Kullanıcı Kaldı. \`${
        member.guild.memberCount
      }\` Kişiyiz! <a:kGif1:736297354512040058>`)
    );
});
//SAYAÇ \\

// EKLENİNCE MESAJ
client.on("message", msg => {
    //let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "!";
    const uslu = new Discord.MessageEmbed()
    .setColor("#66c4a6")
    .setDescription(`Prefixim: \`u!\`\n Yardım için: u!yardım`)
  if (msg.content.includes(`<@${client.user.id}>`) || msg.content.includes(`<@!${client.user.id}>`)) {
    msg.channel.send(uslu);
  }
});
// EKLENİNCE MESAJ

// BAN SİSTEM
client.on("guildBanAdd", async (guild, user) => {
  let kontrol = await db.fetch(`dil_${guild.id}`);
  let kanal = await db.fetch(`bank_${guild.id}`);
  let rol = await db.fetch(`banrol_${guild.id}`);
  if (!kanal) return;
  if (kontrol == "agayokaga") {
    const entry = await guild
      .fetchAuditLogs({ type: "GUILD_BAN_ADD" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == guild.owner.id) return;
    guild.members.unban(user.id);
    guild.members.cache.get(entry.executor.id).kick();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Biri Yasaklandı!`)
      .setColor("#66c4a6")
      .addField(`Yasaklayan`, entry.executor.tag)
      .addField(`Yasaklanan Kişi`, user.name)
      .addField(
        `Sonuç`,
        `Yasaklayan kişi sunucudan açıldı!\nve yasaklanan kişinin yasağı kalktı!`
      );
    client.channels.cache.get(kanal).send(embed);
  } else {
    const entry = await guild
      .fetchAuditLogs({ type: "GUILD_BAN_ADD" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == guild.owner.id) return;
    guild.members.unban(user.id);
    guild.members.cache.get(entry.executor.id).kick();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Biri Yasaklandı!`)
      .setColor("#66c4a6")
      .addField(`Yasaklayan`, entry.executor.tag)
      .addField(`Yasaklanan Kişi`, user.name)
      .addField(
        `Sonuç`,
        `Yasaklayan Kişi Sunucudan Atıldı ve yasaklanan kişinin yasağı kalktı `
      );
    client.channels.cache.get(kanal).send(embed);
  }
});
// BAN SİSTEM

// MOD LOG
client.on("messageDelete", async (message) => {

  if (message.author.bot || message.channel.type == "dm") return;

  let log = message.guild.channels.cache.get(await db.fetch(`log_${message.guild.id}`));

  if (!log) return;

  const embed = new Discord.MessageEmbed()

    .setTitle(message.author.username + " | Mesaj Silindi")

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "")

  log.send(embed)

})

client.on("messageUpdate", async (oldMessage, newMessage) => {

  let modlog = await db.fetch(`log_${oldMessage.guild.id}`);

  if (!modlog) return;

  let embed = new Discord.MessageEmbed()

  .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

  .addField("**Eylem**", "Mesaj Düzenleme")

  .addField("**Mesajın sahibi**", `<@${oldMessage.author.id}> = **${oldMessage.author.id}**`)

  .addField("**Eski Mesajı**", `${oldMessage.content}`)

  .addField("**Yeni Mesajı**", `${newMessage.content}`)

  .setTimestamp()

  .setColor("#66c4a6")

  .setFooter(`Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`, oldMessage.guild.iconURL())

  .setThumbnail(oldMessage.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

});

client.on("channelCreate", async(channel) => {

  let modlog = await db.fetch(`log_${channel.guild.id}`);

    if (!modlog) return;

    const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first());

    let kanal;

    if (channel.type === "text") kanal = `<#${channel.id}>`

    if (channel.type === "voice") kanal = `\`${channel.name}\``

    let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Oluşturma")

    .addField("**Kanalı Oluşturan Kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturduğu Kanal**", `${kanal}`)

    .setTimestamp()

    .setColor("#66c4a6")

    .setFooter(`Sunucu: ${channel.guild.name} - ${channel.guild.id}`, channel.guild.iconURL())

    .setThumbnail(channel.guild.iconUR)

    client.channels.cache.get(modlog).send(embed)

    })

client.on("channelDelete", async(channel) => {

  let modlog = await db.fetch(`log_${channel.guild.id}`);

    if (!modlog) return;

    const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());

    let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Silme")

    .addField("**Kanalı Silen Kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen Kanal**", `\`${channel.name}\``)

    .setTimestamp()

    .setColor("#66c4a6")

    .setFooter(`Sunucu: ${channel.guild.name} - ${channel.guild.id}`, channel.guild.iconURL())

    .setThumbnail(channel.guild.iconURL)

    client.channels.cache.get(modlog).send(embed)

    })

client.on("roleCreate", async(role) => {

let modlog = await db.fetch(`log_${role.guild.id}`);

if (!modlog) return;

const entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Rol Oluşturma")

.addField("**Rolü oluşturan kişi**", `<@${entry.executor.id}>`)

.addField("**Oluşturulan rol**", `\`${role.name}\` **=** \`${role.id}\``)

.setTimestamp()

.setFooter(`Sunucu: ${role.guild.name} - ${role.guild.id}`, role.guild.iconURL)

.setColor("#66c4a6")

.setThumbnail(role.guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("roleDelete", async(role) => {

let modlog = await db.fetch(`log_${role.guild.id}`);

if (!modlog) return;

const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Rol Silme")

.addField("**Rolü silen kişi**", `<@${entry.executor.id}>`)

.addField("**Silinen rol**", `\`${role.name}\` **=** \`${role.id}\``)

.setTimestamp()

.setFooter(`Sunucu: ${role.guild.name} - ${role.guild.id}`, role.guild.iconURL)

.setColor("#66c4a6")

.setThumbnail(role.guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("emojiCreate", async(emoji) => {

let modlog = await db.fetch(`log_${emoji.guild.id}`);

if (!modlog) return;

const entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_CREATE'}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Emoji Oluşturma")

.addField("**Emojiyi oluşturan kişi**", `<@${entry.executor.id}>`)

.addField("**Oluşturulan emoji**", `${emoji} - İsmi: \`${emoji.name}\``)

.setTimestamp()

.setColor("#66c4a6")

.setFooter(`Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`, emoji.guild.iconURL)

.setThumbnail(emoji.guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("emojiDelete", async(emoji) => {

let modlog = await db.fetch(`log_${emoji.guild.id}`);

if (!modlog) return;

const entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_DELETE'}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Emoji Silme")

.addField("**Emojiyi silen kişi**", `<@${entry.executor.id}>`)

.addField("**Silinen emoji**", `${emoji}`)

.setTimestamp()

.setFooter(`Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`, emoji.guild.iconURL)

.setColor("#66c4a6")

.setThumbnail(emoji.guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("emojiUpdate", async(oldEmoji, newEmoji) => {

let modlog = await db.fetch(`log_${oldEmoji.guild.id}`);

if (!modlog) return;

const entry = await oldEmoji.guild.fetchAuditLogs({type: 'EMOJI_UPDATE'}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Emoji Güncelleme")

.addField("**Emojiyi güncelleyen kişi**", `<@${entry.executor.id}>`)

.addField("**Güncellenmeden önceki emoji**", `${oldEmoji} - İsmi: \`${oldEmoji.name}\``)

.addField("**Güncellendikten sonraki emoji**", `${newEmoji} - İsmi: \`${newEmoji.name}\``)

.setTimestamp()

.setColor("#66c4a6")

.setFooter(`Sunucu: ${oldEmoji.guild.name} - ${oldEmoji.guild.id}`, oldEmoji.guild.iconURL)

.setThumbnail(oldEmoji.guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("guildBanAdd", async(guild, user) => {

let modlog = await db.fetch(`log_${guild.id}`);

if (!modlog) return;

const entry = await guild.fetchAuditLogs({type: "MEMBER_BAN_ADD"}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Yasaklama")

.addField("**Kullanıcıyı yasaklayan yetkili**", `<@${entry.executor.id}>`)

.addField("**Yasaklanan kullanıcı**", `**${user.tag}** - ${user.id}`)

.addField("**Yasaklanma sebebi**", `${entry.reason}`)

.setTimestamp()

.setColor("#66c4a6")

.setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

.setThumbnail(guild.iconURL)

client.channels.cache.get(modlog).send(embed)

})

client.on("guildBanRemove", async(guild, user) => {

let modlog = await db.fetch(`log_${guild.id}`);

if (!modlog) return;

const entry = await guild.fetchAuditLogs({type: "MEMBER_BAN_REMOVE"}).then(audit => audit.entries.first());

let embed = new Discord.MessageEmbed()

.setAuthor(entry.executor.username, entry.executor.avatarURL())

.addField("**Eylem**", "Yasak kaldırma")

.addField("**Yasağı kaldıran yetkili**", `<@${entry.executor.id}>`)

.addField("**Yasağı kaldırılan kullanıcı**", `**${user.tag}** - ${user.id}`)

.setTimestamp()
//DarkCode
.setColor("#66c4a6")
//DarkCode
.setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

.setThumbnail(guild.iconURL)
//DarkCode
//DarkCode
client.channels.cache.get(modlog).send(embed)

})
// MOD LOG

// GİRİŞ ÇIKIŞ
client.on("guildMemberRemove", async member => {
  //let resimkanal = JSON.parse(fs.readFileSync("./ayarlar/gç.json", "utf8"));
  //const canvaskanal = member.guild.channels.cache.get(resimkanal[member.guild.id].resim);
  
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
  if (!canvaskanal) return;

  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = ["Sunucudan Ayrıldı."];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://cdn.discordapp.com/attachments/822371998863851571/823250247882506280/usluayrl.png"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#66c4a6";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  let avatarURL = member.user.avatarURL({ format: 'png', dynamic: true, size: 1024 });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "güle-güle.png"
  );

    canvaskanal.send(attachment);
    canvaskanal.send(
      msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
    );
    if (member.user.bot)
      return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
  
});

client.on("guildMemberAdd", async member => {
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));

  if (!canvaskanal || canvaskanal ===  undefined) return;
  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = ["Sunucuya Katıldı."];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let paket = await db.fetch(`pakets_${member.id}`);
  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://cdn.discordapp.com/attachments/822371998863851571/823250269105422396/uslukatL.png"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#66c4a6";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  let avatarURL = member.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }) ;
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "hoş-geldin.png"
  );

  canvaskanal.send(attachment);
  canvaskanal.send(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
});
// GİRİŞ ÇIKIŞ

//küfür engel //
const küfür = [
        "siktir",
        "fuck",
        "puşt",
        "pust",
        "piç",
        "sikerim",
        "sik",
        "yarra",
        "yarrak",
        "amcık",
        "orospu",
        "orosbu",
        "orosbucocu",
        "oç",
        ".oc",
        "ibne",
        "yavşak",
        "bitch",
        "dalyarak",
        "amk",
        "awk",
        "taşak",
        "taşşak",
        "daşşak",
		"sikm",
		"sikim",
		"sikmm",
		"skim",
		"skm",
		"sg"
      ];
client.on("messageUpdate", async (old, nev) => {
  
    if (old.content != nev.content) {
    let i = await db.fetch(`küfür.${nev.member.guild.id}.durum`);
    let y = await db.fetch(`küfür.${nev.member.guild.id}.kanal`);
   if (i) {
      
      if (küfür.some(word => nev.content.includes(word))) {
      if (nev.member.hasPermission("BAN_MEMBERS")) return ;
       //if (ayarlar.gelistiriciler.includes(nev.author.id)) return ;
 const embed = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${nev.author} , **Mesajını Editleyerek Küfür Etmeye Çalıştı!**`)
            .addField("Küfür:",nev)
        
            nev.delete();
            const embeds = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${nev.author} , **Mesajı Editleyerek Küfür Etmene İzin Veremem!**`) 
          client.channels.cache.get(y).send(embed)
            nev.channel.send(embeds).then(msg => msg.delete({timeout:5000}));
          
      }
    } else {
    }
    if (!i) return;
  }
});

client.on("message", async msg => {

     
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
         let y = await db.fetch(`küfür.${msg.member.guild.id}.kanal`);
   
    let i = await db.fetch(`küfür.${msg.member.guild.id}.durum`);
          if (i) {
              if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
                try {
                 if (!msg.member.hasPermission("MANAGE_GUILD")) {
                 //  if (!ayarlar.gelistiriciler.includes(msg.author.id)) return ;
     msg.delete({timeout:750});
                    const embeds = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`<@${msg.author.id}> , **Bu Sunucuda Küfür Yasak!**`)
      msg.channel.send(embeds).then(msg => msg.delete({timeout: 5000}));
                const embed = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${msg.author} , **Küfür Etmeye Çalıştı!**`) .addField("Mesajı:",msg)
               client.channels.cache.get(y).send(embed)
                  }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
         if(!i) return ;
});

// KÜFÜR ENGEL

//ROL VE KANAL KORUMA
client.on("roleCreate", async role => {
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());
  let rol = await db.fetch(`rolrol_${role.guild.id}`);
  let kontrol = await db.fetch(`dil_${role.guild.id}`);
  let kanal = await db.fetch(`rolk_${role.guild.id}`);
  if (!kanal) return;
  if (kontrol == "agayokaga") {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.delete();

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Açıldı!`)
      .setColor("BLACK")
      .addField(`Açan`, entry.executor.tag)
      .addField(`Açılan Rol`, role.name)
      .addField(`Sonuç`, `Rol Geri Silindi!`);
    client.channels.cache.get(kanal).send(embed);
  } else {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.delete();

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Açıldı!`)
      .setColor("BLACK")
      .addField(`Rolu Açan`, entry.executor.tag)
      .addField(`Açılan Rol`, role.name)
      .addField(`Sonuç`, `Açılan Rol Geri Silindi!`);
    client.channels.cache.get(kanal).send(embed);
  }
});

client.on("channelDelete", async channel => {
  let kontrol = await db.fetch(`dil_${channel.guild.id}`);
  let kanal = await db.fetch(`kanalk_${channel.guild.id}`);
  if (!kanal) return;
  if (kontrol == "agayokaga") {
    const entry = await channel.guild
      .fetchAuditLogs({ type: "CHANNEL_DELETE" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == channel.guild.owner.id) return;
    channel.guild.channels.create(channel.name, channel.type, [
      {
        id: channel.guild.id,
        position: channel.calculatedPosition
      }
    ]);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Kanal Silindi!`)
      .addField(`Silen`, entry.executor.tag)

      .addField(`Silinen Kanal`, channel.name)
      .addField(`Sonuç`, `Kanal Geri Açıldı!`)

      .setColor("#66c4a6");
    client.channels.cache.get(kanal).send(embed);
  } else {
    const entry = await channel.guild
      .fetchAuditLogs({ type: "CHANNEL_DELETE" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == channel.guild.owner.id) return;
    channel.guild.channels.create(channel.name, channel.type, [
      {
        id: channel.guild.id,
        position: channel.calculatedPosition
      }
    ]);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Kanal Silindi!`)
      .addField(`Kanalı Silen`, entry.executor.tag)
      .setColor("#66c4a6")
      .addField(`Silinen Kanal`, channel.name)
      .addField(`Sonuç`, `Silinen Kanal Geri Açıldı!`);
    client.channels.cache.get(kanal).send(embed);
  }
});

client.on("channelCreate", async channel => {
  let kontrol = await db.fetch(`dil_${channel.guild.id}`);
  let kanal = await db.fetch(`kanalk_${channel.guild.id}`);
  if (!kanal) return;
  if (kontrol == "agayokaga") {
    const entry = await channel.guild
      .fetchAuditLogs({ type: "CHANNEL_CREATE" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == channel.guild.owner.id) return;
    channel.delete();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Kanal Açıldı!`)
      .setColor("#66c4a6")
      .addField(`Açan`, entry.executor.tag)
      .addField(`Açılan Kanal`, channel.name)
      .addField(`Sonuç`, `Kanal Geri Silindi!`);
    client.channels.cache.get(kanal).send(embed);
  } else {
    const entry = await channel.guild
      .fetchAuditLogs({ type: "CHANNEL_CREATE" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == channel.guild.owner.id) return;
    channel.delete();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Kanal Açıldı!`)
      .setColor("#66c4a6")
      .addField(`Kanalı Açan`, entry.executor.tag)
      .addField(`Açılan Kanal`, channel.name)
      .addField(`Sonuç`, `Açılan Kanal Geri Silindi`);
    client.channels.cache.get(kanal).send(embed);
  }
});
// ROL KORUMA
client.on("roleDelete", async role => {
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
  let rol = await db.fetch(`rolrol_${role.guild.id}`);
  let kontrol = await db.fetch(`dil_${role.guild.id}`);
  let kanal = await db.fetch(`rolk_${role.guild.id}`);
  if (!kanal) return;
  if (kontrol == "TR_tr") {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.guild.roles
      .create({
        data: {
          name: role.name
        }
      })
      .then(r => r.setPosition(role.position));

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Silindi!`)
      .setColor("#66c4a6")
      .addField(`Silen`, entry.executor.tag)
      .addField(`Silinen Rol`, role.name)
      .addField(`Sonuç`, `Rol Geri Açıldı!`);
    client.channels.cache.get(kanal).send(embed);
  } else {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.guild.roles
      .create({
        data: {
          name: role.name
        }
      })
      .then(r => r.setPosition(role.position));

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Silindi!`)
      .setColor("#66c4a6")
      .addField(`Silen`, entry.executor.tag)
      .addField(`Silinen Rol`, role.name)
      .addField(`Sonuç`, `Silinen Rol Geri Açıldı!`);
    client.channels.cache.get(kanal).send(embed);
  }
});
// ROL VE KANAL KORUMA

// REKLAM KORUMA

const reklam = [
        ".com",
        ".net",
        ".xyz",
        ".tk",
        ".pw",
        ".io",
        ".me",
        ".gg",
        "www.",
        "https",
        "http",
        ".gl",
        ".org",
        ".com.tr",
        ".biz",
        "net",
        ".rf",
        ".gd",
        ".az",
        ".party",
		".gf"
      ];
client.on("messageUpdate", async (old, nev) => {
  
    if (old.content != nev.content) {
    let i = await db.fetch(`reklam.${nev.member.guild.id}.durum`);
    let y = await db.fetch(`reklam.${nev.member.guild.id}.kanal`);
   if (i) {
      
      if (reklam.some(word => nev.content.includes(word))) {
      if (nev.member.hasPermission("BAN_MEMBERS")) return ;
       //if (ayarlar.gelistiriciler.includes(nev.author.id)) return ;
 const embed = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${nev.author} , **Mesajını Editleyerek Reklam Yapmaya Çalıştı!**`)
            .addField("Reklamı:",nev)
        
            nev.delete();
            const embeds = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${nev.author} , **Mesajı Editleyerek Reklam Yapamana İzin Veremem!**`) 
          client.channels.cache.get(y).send(embed)
            nev.channel.send(embeds).then(msg => msg.delete({timeout:5000}));
          
      }
    } else {
    }
    if (!i) return;
  }
});

client.on("message", async msg => {

     
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
         let y = await db.fetch(`reklam.${msg.member.guild.id}.kanal`);
   
    let i = await db.fetch(`reklam.${msg.member.guild.id}.durum`);
          if (i) {
              if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
                try {
                 if (!msg.member.hasPermission("MANAGE_GUILD")) {
                 //  if (!ayarlar.gelistiriciler.includes(msg.author.id)) return ;
     msg.delete({timeout:750});
                    const embeds = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`<@${msg.author.id}> , **Bu Sunucuda Reklam Yapmak Yasak!**`)
      msg.channel.send(embeds).then(msg => msg.delete({timeout: 5000}));
                const embed = new Discord.MessageEmbed() .setColor("#66c4a6") .setDescription(`${msg.author} , **Reklam Yapmaya Çalıştı!**`) .addField("Mesajı:",msg)
               client.channels.cache.get(y).send(embed)
                  }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
         if(!i) return ;
});


// REKLAM KORUMA

// PANEL
// PANEL

// SPAM ENGEL

const dctrat = require('dctr-antispam.js'); 

var authors = [];
var warned = [];

var messageLog = [];

client.on('message', async message => {
const spam = await db.fetch(`spam.${message.guild.id}`);
if(!spam) return;
const maxTime = await db.fetch(`max.${message.guild.id}.${message.author.id}`);
const timeout = await db.fetch(`time.${message.guild.id}.${message.author.id}`);
db.add(`mesaj.${message.guild.id}.${message.author.id}`, 1)
if(timeout) {
const sayı = await db.fetch(`mesaj.${message.guild.id}.${message.author.id}`);
if(Date.now() < maxTime) {
  const westraaaaam = new Discord.MessageEmbed()
  .setColor("#66c4a6")
  .setDescription(`<@${message.author.id}> , **Bu Sunucuda Spam Yapmak Yasak!**`)
  .setFooter(`Bu mesaj otomatik olarak silinecektir.`)

 message.channel.send(westraaaaam).then(msg => msg.delete({timeout: 1500}));
  return message.delete();
  
}
} else {
db.set(`time.${message.guild.id}.${message.author.id}`, 'ok');
db.set(`max.${message.guild.id}.${message.author.id}`, Date.now()+3000);
setTimeout(() => {
db.delete(`mesaj.${message.guild.id}.${message.author.id}`);
db.delete(`time.${message.guild.id}.${message.author.id}`);
}, 500) // default : 500
}


});
// SPAM ENGEL

// GÜVENLİK
client.on('guildMemberAdd',async member => {
  let user = client.users.cache.get(member.id);
  let kanal = client.channels.cache.get(db.fetch(`guvenlik${member.guild.id}`)) 
       const Canvas = require('canvas')
       const canvas = Canvas.createCanvas(360,100);
       const ctx = canvas.getContext('2d');
  
  const resim1 = await Canvas.loadImage('https://cdn.discordapp.com/attachments/822371998863851571/823254333130276884/uslusupheli.png')
    const resim2 = await Canvas.loadImage('https://cdn.discordapp.com/attachments/822371998863851571/823253707717345290/usluguvenli.png')
    const kurulus = new Date().getTime() - user.createdAt.getTime();
    const gün = moment(kurulus).format('dddd');  
    var kontrol;
      if (kurulus > 2629800000) kontrol = resim2
    if (kurulus < 2629800000) kontrol = resim1


     const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/816247170437087293/819281642061430814/uslu.png");
       ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
   

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({format: "png"}));
  ctx.drawImage(kontrol,0,0,canvas.width, canvas.height)
  ctx.beginPath();
    ctx.lineWidth = 4;
  ctx.fill()
    ctx.lineWidth = 4;
  ctx.arc(180, 46, 36, 0, 2 * Math.PI);
    ctx.clip();
  ctx.drawImage(avatar, 143,10, 73, 72  );

   if (!kanal) return
       const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'güvenlik.png');
    kanal.send(attachment)
});
// GÜVENLİK

// MESAJ TAKİP
client.on("message", async (message) => {

  if (message.author.bot || message.channel.type == "dm") return;

  let mesajtakip = message.guild.channels.cache.get(await db.fetch(`mesajtakip_${message.guild.id}`));

  if (!mesajtakip) return;

  const embed = new Discord.MessageEmbed()

    .setAuthor(message.author.username + " | Adlı Kullanıcı Şu Mesajı Attı")

    .setColor(`#66c4a6`)

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "")

  mesajtakip.send(embed)

})

client.on("messageDelete", async (message) => {

  if (message.author.bot || message.channel.type == "dm") return;

  let mesajtakip = message.guild.channels.cache.get(await db.fetch(`mesajtakip_${message.guild.id}`));

  if (!mesajtakip) return;

  const embed = new Discord.MessageEmbed()

    .setTitle(message.author.username + " | Adlı Kullanıcı Şu Mesajı Geri Silindi")

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "")

    mesajtakip.send(embed)

})

client.on("messageUpdate", async (oldMessage, newMessage) => {

  let mesajtakip = await db.fetch(`mesajtakip_${oldMessage.guild.id}`);

  if (!mesajtakip) return;

  let embed = new Discord.MessageEmbed()

  .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

  .addField("**Eylem**", "Mesaj Düzenleme")

  .addField("**Mesajın sahibi**", `<@${oldMessage.author.id}> = **${oldMessage.author.id}**`)

  .addField("**Eski Mesajı**", `${oldMessage.content}`)

  .addField("**Yeni Mesajı**", `${newMessage.content}`)

  .setTimestamp()

  .setColor("#66c4a6")

  .setFooter(`Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`, oldMessage.guild.iconURL())

  .setThumbnail(oldMessage.guild.iconURL)

  client.channels.cache.get(mesajtakip).send(embed)

});
// MESAJ TAKİP

// CEKILIS
if(!db.get("giveaways")) db.set("giveaways", []);

const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {

    async getAllGiveaways(){
        return db.get("giveaways");
    }

    async saveGiveaway(messageID, giveawayData){
        db.push("giveaways", giveawayData);
        return true;
    }

    async editGiveaway(messageID, giveawayData){
        const giveaways = db.get("giveaways");
        const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageID !== messageID);
        newGiveawaysArray.push(giveawayData);
        db.set("giveaways", newGiveawaysArray);
        return true;
    }

    async deleteGiveaway(messageID){
        const newGiveawaysArray = db.get("giveaways").filter((giveaway) => giveaway.messageID !== messageID);
        db.set("giveaways", newGiveawaysArray);
        return true;
    }
  
  
};
const manager = new GiveawayManagerWithOwnDatabase(client, {
  storage: false,
  updateCountdownEvery: 5000,
  default: {
    botsCanWin: false,
    embedColor: "#66c4a6",
    reaction: "🎉"
  }
});
client.giveawaysManager = manager;
// ÇEKİLİŞ

/////////////////////////////// HOŞGELDİN
client.on('guildMemberAdd', async(member, message) => {
  let ozelhosgeldin = await db.fetch(`ozelhosgeldin_${member.guild.id}`)
  if (!ozelhosgeldin) return;
  member.send(ozelhosgeldin ? ozelhosgeldin.replace('-sunucu-', `\`${member.guild.name}\``) .replace('-kullanıcı-',`\`${member.user.tag}\``) .replace('-kackısıkaldı-',`\`${member.guild.memberCount}\``) .replace('-uyesayisi-',`\`${member.guild.memberCount}\``) .replace('-sunucubolgesi-',`\`${message.guild.region}\``) : ``)// ${message.guild.region}
})  

////////////////////////////// GÖRÜŞÜRÜZ
 client.on('guildMemberRemove', async(member, message)=> {
  let ozelgorusuruz = await db.fetch(`ozelgorusuruz_${member.guild.id}`)
  if (!ozelgorusuruz) return;
  member.send(ozelgorusuruz ? ozelgorusuruz.replace('-sunucu-', `\`${member.guild.name}\``) .replace('-kullanıcı-',`\`${member.user.tag}\``) .replace('-kackısıkaldı-',`\`${member.guild.memberCount}\``) .replace('-uyesayisi-',`\`${member.guild.memberCount}\``) .replace('-sunucuboglesi-',`\`${message.guild.region}\``) : ``)
})
//-------------main dosyasına atılıcakdır (bot.js ,server.js,index.js\\

// ayarlanabilir sayaç
client.on("guildMemberAdd", async member => {
  let kanal = await db.fetch(`sskanal_${member.guild.id}`)
   if(!kanal) return
  let sayaç = await db.fetch(`ssayı_${member.guild.id}`)
  let hgmsj = await db.fetch(`sayachgmsj_${member.guild.id}`)
  let bbmsj = await db.fetch(`sayacbbmsj_${member.guild.id}`)
  let sonuç = sayaç - member.guild.memberCount
  ///....
  
 
  ///....
   if(!hgmsj) {
client.channels.get(kanal).send(':loudspeaker: :inbox_tray: Kullanıcı Katıldı! `'+sayaç+'` Kişi Olmamıza `'+sonuç+'` Kişi Kaldı `'+member.guild.memberCount+'` Kişiyiz! `'+member.user.username+'`')
   }


  if(hgmsj) {
 var mesajs = await db.fetch(`sayachgmsj_${member.guild.id}`).replace("-uye-", `${member.user.tag}`).replace("-server-",  `${member.guild.name}`).replace("-uyesayisi-", `${member.guild.memberCount}`).replace("-botsayisi-",  `${member.guild.members.filter(m => m.user.bot).size}`).replace("-bolge-", `${member.guild.region}`).replace("-kanalsayisi-",  `${member.guild.channels.size}`).replace("-kalanuye-", `${sonuç}`).replace("-hedefuye-", `${sayaç}`)         
  
 client.channels.get(kanal.id).send(mesajs) 
 return
 }
 
    

  
  
  
  })
client.on("guildMemberRemove", async member => {
  let kanal = await db.fetch(`skanal_${member.guild.id}`)
  let sayaç = await db.fetch(`ssayı_${member.guild.id}`)
  let hgmsj = await db.fetch(`sayachgmsj_${member.guild.id}`)
  let bbmsj = await db.fetch(`sayacbbmsj_${member.guild.id}`)
  let sonuç = sayaç - member.guild.memberCount
  ///....
  
  if(!kanal) return
  if(!sayaç) return
  if(member.bot) return
  ///....
  
  if(!bbmsj) {
    client.channels.get(kanal).send(':loudspeaker: :outbox_tray: Kullanıcı Ayrıldı. `'+sayaç+'` Kişi Olmamıza `'+sonuç+'` Kişi Kaldı `'+member.guild.memberCount+'` Kişiyiz!  `'+member.user.username+'`')
  return
  }
  
  if(bbmsj) {
 var mesajs = await db.fetch(`sayacbbmsj_${member.guild.id}`).replace("-uye-", `${member.user.tag}`).replace("-server-",  `${member.guild.name}`).replace("-uyesayisi-", `${member.guild.memberCount}`).replace("-botsayisi-",  `${member.guild.members.filter(m => m.user.bot).size}`).replace("-bolge-", `${member.guild.region}`).replace("-kanalsayisi-",  `${member.guild.channels.size}`).replace("-kalanuye-", `${sonuç}`).replace("-hedefuye-", `${sayaç}`)         
  
 client.channels.get(kanal).send(mesajs) 
 }
  
  
  
  })
// ayarlanabilir sayaç

// SA AS EMOJİLİ
client.on("message", async message => {
  let a = await db.fetch(`saasemojılı_${message.guild.id}`);
  if (a) {
    if (message.content.toLowerCase() === "sa") {
      message.channel.send(``)
      message.react('<:as:822793233914527764>')
    }
  }
});

// SA AS
client.on("message", async message => {
  let a = await db.fetch(`saas_${message.guild.id}`);
  if (a) {
    if (message.content.toLowerCase() === "sa") {
      message.reply(`**Aleyküm Selam, Hoşgeldin**<:usluemoji2:824574302875418656>`)
    }
  }
});
// SA AS

// EKONOMİ

client.emojiler = {
  gold: "744898834584436736", //?PARAM DAKİ ALTIN EMOJİSİ
  paraGitti: "763316512051691520", // X İŞARETİ
  paraGitmedi: "763316512937082890", // TİK İŞARETİ
  paraROZET: "763321485942063104", // PARA İLE ALINAN YILDIRIM ROZET EMOJİSİ
  onayRozet: "733997295384789023", // ONAY ROZETİ
  modRozet: "763320398301102080", // MOD ROZETİ
  yetkiliRozet: "734004125401874463", // YETKİLİ ROZETİ
  destekçiRozet: "763320039893237790",
  evet: "763316512051691520", // TİK İŞARET
  hayır: "763316512937082890", // X İŞARETİ
  acikk: "763322641783455765",
  kapalii: "763322641171218462",
  kendineParaYollama: "763323284040843265", // KENDİNE PARA ATMAYA ÇALIŞANLAR İÇİN SİNİRLİ EMOJİSİ
  konfeti: "763322965060091914", // MESLEK SAHİBİ OLUNCA RENGARENK KONFETİ ATIYOR
  yukleniyor: "763323566346993694", // YÜKLENİYOR EMOJİ İŞTE :D
  sinirli: "763323284040843265", // TİTREYEN SİNİRLİ :D
  mutlu: "763323802863796226", // MUTLU EMOJİ
  rahatsızetme: "763324528361209867"  , // RAHATSIZ ETMEYİN EMOJİSİ
  çevrimiçi: "763324906628055072", // ÇEVRİMİÇİ EMOJİSİ
  yayıncı: "763325119677726720", // YAYINCI EMOJİSİ
  çevrimdışı: "763325323323768853", // ÇEVRİM DIŞI EMOJİSİ
  boşta: "763325616954408970", // BOŞTA EMOJİSİ
  bot: "763325775511683103", // BOT EMOJİSİ
  polis: "763325938208735232", // POLİS EMOJİ
  Yvar: "690266213426790480", // YETKİLERİM KOMUDUNDAKİ TİK İŞARETİ
  Yyok: "690266274336342068", // YETKİLERİM KOMUDUNDAKİ X İŞARETİ
  yan: "735869816103108689", // > GİBİ EMOJİ İŞTE :ç
  kalpSarılmalı: "763326559997526017",
  olumlu: "",
  olumsuz: "",

  // AYARLAR KOMUDUNDAKİ AÇIK KAPALI EMOJİLERİ >>>>>>>>>>>>>>>>>
  kapalıA: "763326997266038794",
  açıkA: "763326993135566848",

  // AÇIK BONUS EMOJİLERİ -------------- >>>>>>>>>>

  açıkB: "549204804468211740", // B
  açıkO: "549204805151621141", // O
  açıkN: "549204804446978058", // N
  açıkU: "549204806796050462", // U
  açıkS: "549204806380552202", // S

  // KAPALI BONUS EMOJİLERİ ---------------- >>>>>>>>>>>>>

  kapalıO: "549205266130927648", // O
  kapalıN: "549205265702977542", // N
  kapalıU: "549205268051787776", // U
  kapalıS: "549205267246612482" // S
};
// EKONOMİ

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift();

  if (command == "çal")
      distube.play(message, args.join(" "));
      
  if (command == "çalan"){
   let queue = distube.getQueue(message); 
   message.channel.send('Çalan Müzik:\n' + queue.songs.map((song) => `**${song.name} - \`${song.formattedDuration}\`\nYoutube Linki: ${song.url}**`));
  }
  if (command == "tekrarla") {
    let tekrar = distube.setRepeatMode(message, parseInt(args[0]));
    tekrar = tekrar ? tekrar == 2 ? "Tüm Sıra"  : "Bu Şarkı" : "Kapalı";
    message.channel.send("Tekrarlama modu `" + tekrar + "` olarak ayarlandı");
  }
  if (command == "ses") {
      distube.setVolume(message, args[0]);
      message.channel.send("Ses `"+ args[0] +"` düzeyine getirildi.")
  };
  if (command == "dur") {
      distube.stop(message);
      message.channel.send("Müzik Kapatıldı");
  }
   if (command == "duraklat") {
      distube.pause(message);
      message.channel.send("Müzik Duraklatıldı");
  }
  if (command == "devam") {
      distube.resume(message);
      message.channel.send("Müzik Devam Ettiriliyor");
  }
  if (command == "geç")
      distube.skip(message);

  if (command == "otooynat") {
      let mode = distube.toggleAutoplay(message);
      message.channel.send("Otomatik oynatma modu: `" + (mode ? "Açık" : "Kapalı") + "`");
  } 
  if (command == "sıra") {
      let queue = distube.getQueue(message);
      message.channel.send('Mevcut Sıra:\n' + queue.songs.map((song, id) => `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``).slice(0, 10).join("\n"));
  }
});

distube.on("initQueue", queue => {
  queue.autoplay = false; // Otomatik random başka şarkıya geçme
  queue.volume = 90; // Varsayılan Ses Seviyesi
});

const status = (queue) => `Ses: \`${queue.volume}%\` | Tekrar: \`${queue.repeatMode ? queue.repeatMode == 2 ? "Tüm Sıra" : "Bu şarkı" : "Kapalı"}\` | Otomatik Oynat: \`${queue.autoplay ? "Açık" : "Kapalı"}\``;

distube
  .on("playSong", (message, queue, song) => message.channel.send(
      `Çalınıyor \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}\nYoutube Linki: ${song.url}\nMüziği İsteyen: ${song.user}`
  ))
  .on("addSong", (message, queue, song) => message.channel.send(
      `**${song.name} - \`${song.formattedDuration}\` ${song.user} Tarafından Kuyruğa Eklendi.**`
  ))
  .on("playList", (message, queue, playlist, song) => message.channel.send(
      `Oyna \`${playlist.name}\` Oynatma Listesi (${playlist.songs.length} şarkılar).\nŞuan Çalıyor: \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}\nMüziği İsteyen: ${song.user}`
  ))
  .on("addList", (message, queue, playlist) => message.channel.send(
      `Eklendi \`${playlist.name}\` Oynatma Listesi (${playlist.songs.length} şarkılar) sıraya\n${status(queue)}`
  ))
  .on("searchResult", (message, result) => {
      let i = 0;
      message.channel.send(`**Aşağıdan bir seçenek seçin**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Bu komut işlem yapılmazsa 60 saniye içinde iptal olacaktır*`);
  })
  .on("searchCancel", (message) => message.channel.send(`Arama iptal edildi`))
  .on("error", (message, e) => {
      console.error(e)
      message.channel.send("Bir hata ile karşılaşıldı: " + e);
  });
