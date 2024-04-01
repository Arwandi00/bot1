const fs = require('fs');

exports.run = {
    async: async (m, { client, body, Func, Scraper }) => {
        try {
            const botId = "6283893900755@s.whatsapp.net";
            const isQuotedFromUser = m.quoted && m.quoted.sender !== botId;
            const isMedia = m.msg.hasOwnProperty("imageMessage") || m.msg.hasOwnProperty("videoMessage");
            let prompt = fs.readFileSync('./media/personaerrin.txt', 'utf-8');
            let text = ""; 

            // Periksa apakah pesan mengandung kata kunci "Errin" atau "errin"
            const containsKeyword = /(Errin|errin)/i.test(body);

            // Bot hanya akan merespons jika ada kata kunci "Errin" atau "errin"
            // dan jika pesan tersebut merupakan balasan atau kutipan dari pengguna lain
            if (!containsKeyword || !isQuotedFromUser) {
                return;
            }

            // Ambil teks pesan yang dikutip dari pengguna lain
            let quotedMessage = m.quoted.text || "";
            text = prompt + quotedMessage;

            // Lanjutkan dengan proses lainnya
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
                client.sendReact(m.chat, "🤔", m.key);
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
