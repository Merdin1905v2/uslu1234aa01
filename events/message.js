const emoji = [":white_check_mark:"];
let ne = db.fetch(`kural_${message.author.id}`);
if (ne === null)
return message.channel
.send(
new Discord.MessageEmbed().setTitle("Uslu BOT Kurallar")
.setColor('#66c4a6')
.setDescription(`
:white_small_square: Botu Zorlayacak Herangi Bir şey Yasaktır.
:white_small_square: Bot Hakkında Kötü Söz Söylemek Yasaktır.
:white_small_square: Botu Kendinizin Gibi Göstermek Yasaktır.
:white_small_square: Botu Hiçbir Şekilde Kopyalamak Kesinlikle Yasaktır.

:white_small_square: Bunlar Uygulandıgı Taktirde Dava Açılacaktır.`)
.setFooter(`Kuralları Kabul Etmek İçin ✅ Emojisine Basmanız Yeterlidir.`)
.setTimestamp())
.then(async function(embed) {
const emoji = [":white_check_mark:"];
const filter = (reaction, user) => emoji.includes(reaction.emoji.name) && user.id === message.author.id;
await embed.react(emoji[0]).catch(function() {});
var reactions = embed.createReactionCollector(filter); reactions.on("collect", async function(reaction) {
if (reaction.emoji.name === ":white_check_mark:") {
await embed.reactions.removeAll();
await db.set(`kural_${message.author.id}`, "nul");
return embed.edit(
new Discord.MessageEmbed()
.setColor('#66c4a6')
.setDescription(`Kuralları Kabul Ettiğiniz İçin Teşekkür Ederim, Artık Botu Kullanabilirsin.`)
);
}
});
});