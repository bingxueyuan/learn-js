/**
 * (?<tag><\w+[>|\s?].*[>]+[^\s]*).*
 * (?<=\s?{{2}\s?)[_A-z]+[A-z_0-9]+(?<symbol>\w+)(?=\s?)
 * (?<={{2}\s)(?<name>[\w\s|]*)(?=\s}+)
 */

class Template
{
    constructor()
    {
        this["loader"] = new Map()
    }

    header()
    {
        let header = new Headers();
        header.append("Content-Type", "text/plain");
        return header;
    }

    request(url)
    {
        return fetch(new Request(url), {
            method: 'POST',
            headers: this.header(),
            mode: 'same-origin',
            cache: 'default'
        });
    }

    /**
     * 加载模板
     * @param key
     * @param url
     * @returns {Promise<boolean|Template>}
     */
    async load(key, url)
    {
        if(this["loader"].has(key) === false)
        {
            this["loader"].set(key, await this.request(url).then(response => response.text()).then(response => response))
        }
        else
        {
            return false
        }
        return this;
    }

    /**
     * 解析模板
     * @param template
     * @param object
     * @returns {*}
     */
    parse(template, object)
    {
        return this["loader"].get(template).replace(/(?<=\s?)(?<name>[{]+[\s\w\u4E00-\u9FA5|]+[}]+)(?=\s?)/img, match => {
            return this.isRegular(match)? this.regular(match, object) : null
        })
    }

    /**
     * 判断常规匹配
     * @param match
     * @returns {boolean}
     */
    isRegular(match)
    {
        return match.search(/(if)/img) === -1
            && match.search(/(for)/img) === -1
            && match.search(/(each)/img) === -1
            && match.search(/(include)/img) === -1
            && match.search(/(end)/img) === -1;
    }

    /**
     * 常规匹配
     * @param match
     * @param object
     * @returns {*}
     */
    regular(match, object)
    {
        if (match.search(/\|/) === -1)
        {
            return object[match.replace(/[{}]+/img, '').trim()];
        }
        else
        {
            let [key, value] = match.replace(/[{}]+/img, '').split('||');
            return object[key] === undefined? value.trim() : object[key.trim()];
        }
    }

    begin(selector, dom)
    {
        document.querySelector(selector).insertAdjacentHTML("afterbegin", dom)
    }

}