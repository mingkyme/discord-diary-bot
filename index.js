const Discord = require('discord.js');
const mysql = require('mysql');
require('dotenv').config();

var diaryDBConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'diary',
    charset: 'utf8mb4'
};
var client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});
client.login(process.env.DISCORD_TOKEN).catch(function (err) {

})

client.on('ready', () => {
    console.log("ON");
    client.user.setActivity('diary.mingky.me');
});

client.on('message', message => {
    if (message.content.startsWith('~일기검색 ')) {
        var connection = mysql.createConnection(diaryDBConfig);
        connection.query('SELECT id,text,writer,DATE_FORMAT(time,"%Y-%m-%d") as time FROM diary WHERE text LIKE CONCAT("%",?,"%");', [(message.content.substring(6))], function (err, result) {
            if (err) {
                message.reply('ERROR');
                console.log(err);
            } else {
                var resultString = "";
                for (var i = 0; i < result.length; i++) {
                    resultString += `${result[i]['id']}/${result[i]['time']}/${result[i]['writer']}\n${result[i]['text']}\n\n`;
                }
                if (result.length == 0) {
                    message.channel.send("검색된 데이터가 없습니다.");
                } else {
                    message.channel.send(resultString);
                }
            }
        });
        connection.end();
    } else if (message.content.startsWith('~일기조회 ')) {
        var connection = mysql.createConnection(diaryDBConfig);
        connection.query('SELECT text,writer,DATE_FORMAT(time,"%Y-%m-%d") as time FROM diary WHERE id = ?;', [(Number)(message.content.substring(6))], function (err, result) {
            if (err) {
                message.reply('ERROR');
                console.log(err);
            } else {
                message.channel.send(result[0]['time'] + ' / ' + result[0]['text'] + ' / ' + result[0]['writer']);
            }
        });
        connection.end();
    } else if (message.content.startsWith('~일기 ')) {
        var connection = mysql.createConnection(diaryDBConfig);
        connection.query('INSERT INTO diary(text,writer,discord_id) VALUES (?,?,?);', [message.content.substring(4), message.member.displayName, message.member.id], function (err, result) {
            if (err) {
                message.reply('ERROR');
                console.log(err);
            } else {
                message.reply('일기 등록 완료');
            }
        });
        connection.end();
    } else if (message.content == '~내일기') {
        message.reply("https://diary.mingky.me/id/" + message.member.id);
    } else if (message.content == '~내일기2') {
        message.reply("https://diary.mingky.me/" + encodeURIComponent(message.member.displayName));
    } else if (message.content == '~모두의일기') {
        message.reply("https://diary.mingky.me/all");
    } else if (message.content.startsWith('~일기수정 ')){
        var connection = mysql.createConnection(diaryDBConfig);
        connection.query('UPDATE diary SET text = ? WHERE id = (SELECT id FROM diary WHERE discord_id = ? ORDER BY id DESC LIMIT 1)', [(message.content.substring(6)),message.member.id], function (err, result) {
            if (err) {
                message.reply('ERROR');
                console.log(err);
            } else {
                if (result.length == 0) {
                    message.channel.send("검색된 데이터가 없습니다.");
                } else {
                    message.channel.send(`수정 완료`);
                }
            }
        });
        connection.end();
    }
});