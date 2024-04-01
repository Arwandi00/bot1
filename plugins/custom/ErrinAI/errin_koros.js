const fs = require('fs');
exports.run = {
    async: async (m, { client, body, Func, Scraper }) => {
      try {
        const botId = "6283893900755@s.whatsapp.net";
        const isQuotedFromBot = m.quoted ? m.quoted.sender === botId : false;
        const isMedia =
            m.msg.hasOwnProperty("imageMessage") ||
            m.msg.hasOwnProperty("videoMessage");
        let prompt = fs.readFileSync('./media/personaerrin.txt', 'utf-8');
        let text = ""; 

        if (/(Errin|errin)/.test(body) || isQuotedFromBot) {
          if (typeof body === "string") {
            text = prompt + body.replace(/(Errin|errin)/g, "");
          }
        }

        if (m.quoted && !isMedia) {
          let quotedMessage = m.quoted.text || "";
          if (quotedMessage && isQuotedFromBot) {
            text = prompt + (m.text || "")+ (quotedMessage ? quotedMessage : "");
            //text = prompt + quotedMessage;
            //text += ` ${body}`;
          } else{
              return;
          }
        }
          
        if (/image/.test(m.mtype) && body && /(Errin|errin)/i.test(body)) {
            let q = m.quoted ? m.quoted : m;
            client.sendReact(m.chat, "🕒", m.key);
            let img = await q.download();
            let image = await Scraper.uploadImageV2(img);
            const json = await Api.neoxr("/koros", {
              image: image.data.url,
              q: body.replace(/(Errin|errin)/g, "")
            });
            client.reply(m.chat, json.data.description, m);
            
			} else if (/conversation|extended/.test(m.mtype) && text !== "") {
            client.sendReact(m.chat, "🥰", m.key);
            let json = await Func.fetchJson(
              `https://aemt.me/bard?text=${encodeURIComponent(prompt + body.replace(/(Errin|errin)/g, ""))}`
            );
            let data = json.result;
            if (data === "Request failed!") {
              const json = await Api.neoxr("/bard", {
                q: prompt + text.replace(/(Errin|errin)/g, ""),
              });
              client.reply(m.chat, json.data.message, m);
            } else {
              client.reply(m.chat, data, m);
            }
          }
        
      } catch (e) {
        console.log(e);
        client.reply(m.chat, Func.jsonFormat(e), m);
      }
    },
  error: false,
  limit: true,
  group: true,
  cache: true,
  location: __filename
};