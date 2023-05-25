
const POST_REGEX = /\/(p|tv|reel|reels)\/([A-Za-z0-9_-]*)(\/?)/
const docID = "9419181298154937"
let token = document.querySelectorAll('script[type="application/json"]')
Array.from(token).every((item) => {
    if (item.textContent.includes("DTSGInitialData")) {
        const b = item.textContent.indexOf('{"token":"NA')
        const c = item.textContent.slice(b)
        const d = c.indexOf("}")
        const e = c.slice(0, d + 1)
        token = JSON.parse(e).token
        return false
    }
    return true
})

let check = true
let timeout;
const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><defs><style>.cls-1 {fill: none;}.cls-2 {fill: #1d1d1d;}</style></defs><g id="Group_1" data-name="Group 1" transform="translate(-397 -369)"><rect id="Rectangle_2" data-name="Rectangle 2" class="cls-1" width="21" height="21" transform="translate(397 369)"/><g id="download_copy" data-name="download copy" transform="translate(397 369.2)"><path id="Path_5" data-name="Path 5" class="cls-2" d="M20.3,13.8a1.136,1.136,0,0,0-.8-.3h0a1.11,1.11,0,0,0-1.1,1.1v3.8H2.2V14.6a1.11,1.11,0,0,0-1.1-1.1A1.11,1.11,0,0,0,0,14.6v4.9a1.135,1.135,0,0,0,.3.8,1.135,1.135,0,0,0,.8.3H19.6a1.11,1.11,0,0,0,1.1-1.1V14.6A1.506,1.506,0,0,0,20.3,13.8Z"/><path id="Path_6" data-name="Path 6" class="cls-2" d="M9.8,15l.2.2a1.09,1.09,0,0,0,1.1-.2L16,9.8a1.061,1.061,0,0,0-1.5-1.5l-3,3.2V1.1A1.11,1.11,0,0,0,10.4,0,1.135,1.135,0,0,0,9.2,1.1V11.4L6.3,8.2a2.01,2.01,0,0,0-.8-.4,1.08,1.08,0,0,0-.7.3,1.116,1.116,0,0,0-.1,1.6Z"/></g></g></svg>'
const ITEM_TEMPLATE = `<div id="downloadimage">${icon}</div>`
const itemDOM1 = new DOMParser().parseFromString(ITEM_TEMPLATE, 'text/html').body.firstElementChild
const POSTPAGEICON = itemDOM1.addEventListener("click", getdata("post"))
const itemDOM2 = new DOMParser().parseFromString(ITEM_TEMPLATE, 'text/html').body.firstElementChild
const HOMEPAGEICON = itemDOM2.addEventListener("click", getdata("home"))


const body = document.querySelector("body")
const callback = (mutationList, observe) => {
    if (check && window.location.pathname.match(POST_REGEX)) {
        clearTimeout(timeout)
        const b = document.querySelector("._aatk")
        const c = document.querySelector(".x1iyjqo2.x1tjbqro.x78zum5.x6s0dn4.xeud2gj")
        if (b && !document.querySelector("#downloadimage")) {
            check = false
            b.appendChild(itemDOM2)
            timeout = setTimeout(() => {
                check = true
            }, 1000)
        }
        else if (c && !document.querySelector("#downloadimage")) {
            check = false
            c.style.position = "relative"
            c.appendChild(itemDOM1)
            timeout = setTimeout(() => {
                check = true
            }, 1000)
        }
    }
};
const observer = new MutationObserver(callback);
const config = { attributes: true, childList: true, subtree: true };
observer.observe(body, config);


function getdata(type) {
    return (e) => {
        const a = window.location.pathname.match(POST_REGEX)
        if (a) {
            fetch("https://www.instagram.com/api/graphql", {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: `fb_dtsg=${token}&variables={"shortcode":"${a[2]}"}&doc_id=${docID}`,
                method: "POST",
            }).then((rs) => {
                return rs.json()
            }).then((rs) => {
                if (rs.data.xdt_api__v1__media__shortcode__web_info.items[0].carousel_media) {
                    let indeximage = 0
                    const itemindex = type === "home" ? Array.from(e.target.parentElement.children[0].children[1].children) : Array.from(document.querySelectorAll("._aamj._acvz._acnc._acng"))
                    if (itemindex) {
                        itemindex.every((item, index) => {
                            if (item.className.includes("_acnf")) {
                                indeximage = index
                                return false
                            }
                            return true
                        })
                    }
                    if (rs.data.xdt_api__v1__media__shortcode__web_info.items[0].carousel_media[indeximage].video_versions) {
                        return {
                            url: rs.data.xdt_api__v1__media__shortcode__web_info.items[0].carousel_media[indeximage].video_versions[0].url,
                            type: "video"
                        }
                    } else {
                        return {
                            url: rs.data.xdt_api__v1__media__shortcode__web_info.items[0].carousel_media[indeximage].image_versions2.candidates[0].url,
                            type: "image"
                        }
                    }
                } else if (rs.data.xdt_api__v1__media__shortcode__web_info.items[0].video_versions) {
                    return {
                        url: rs.data.xdt_api__v1__media__shortcode__web_info.items[0].video_versions[0].url,
                        type: "video"
                    }
                } else if (rs.data.xdt_api__v1__media__shortcode__web_info.items[0].image_versions2) {
                    return {
                        url: rs.data.xdt_api__v1__media__shortcode__web_info.items[0].image_versions2.candidates[0].url,
                        type: "image"
                    }
                } else return ""
            }).then(async (respont) => {
                if (respont === "") return
                fetch(respont.url)
                    .then((rs) => {
                        return rs.blob()
                    })
                    .then((rs) => {
                        const a = document.createElement("a")
                        a.download = respont.type === "image" ? "test.jpeg" : "video.mp4"
                        a.href = URL.createObjectURL(rs)
                        a.click()
                    })
            })
        }
    }
}