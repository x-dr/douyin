/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import page from './index.html';


export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        // console.log(url);
        if (url.pathname == "/") {

            return new Response(page, {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                }
            })
        } else if (url.pathname == "/douyin") {
            // console.log(request);
            const { rawUrl } = await request.json()
            const dd = processUserInput(rawUrl)
            const res = await getDate(dd);
            // const data = await getDate.json()
            const json = JSON.stringify(res.item_list[0]);
            console.log(json);
            return new Response(json, {
                headers: {
                    "content-type": "application/json;",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*"
                },
            })
        }
    },
};


async function getDate(videoIdOrLink) {
    let videoId
    if (isNumeric(videoIdOrLink)) {
        // 如果输入是纯数字，则认为它是videoId
        videoId = videoIdOrLink;
    } else if (videoIdOrLink.match(/v\.douyin\.com\/[a-zA-Z0-9]+/)) {
        // 从链接中提取视频ID
        // 
        videoId = await extractVideoId(videoIdOrLink);
    } else {
        return;
    }

    const opts = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"

        }
    }
    const apiUrl = "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?reflow_source=reflow_page&item_ids=" + videoId + "&a_bogus=64745b2b5bdc4e75b720a9a85b19867a";

    const response = await fetch(apiUrl, opts);
    const data = await response.json()
    // console.log(data);
    return data
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

async function extractVideoId(link) {
    var redirectLink = await getRedirectUrl(link);

    var idMatches = redirectLink.match(/\/video\/(\d+)\//);
    return idMatches && idMatches.length > 1 ? idMatches[1] : null;
}

async function getRedirectUrl(url) {
    try {
        const response = await fetch(`https://${url}`, { method: 'HEAD', redirect: 'manual' });
        const responseHeaders = response.headers.get('location');

        if (response.status === 302 && responseHeaders) {
            return responseHeaders.trim();
        } else {
            return null;
        }
    } catch (error) {
        console.error("请求发生错误:", error);
        return null;
    }
}



    function processUserInput(input) {
        var matches = input.match(/v\.douyin\.com\/[a-zA-Z0-9]+/);
        if (matches && matches.length > 0) {
            return matches[0];
        }

        matches = input.match(/\d{19}/);
        if (matches && matches.length > 0) {
            return matches[0];
        }

        return null;
    }
