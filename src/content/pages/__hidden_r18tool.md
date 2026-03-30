---
title: "Common Tools"
draft: false
tags: ["hidden"]
---

## LCTO v1

Lama Clear Text Obfuscation Version 1

Encode: 
<input style="min-width: 20rem;" id="__r18_lcto_1_encode"></input>
<button onclick="__r18_lcto_1_onclick_encode()">Encode</button>

Decode: 
<input style="min-width: 20rem;" id="__r18_lcto_1_decode"></input>
<button onclick="__r18_lcto_1_onclick_decode()">Decode</button>

<script>

function __r18_lcto_1_onclick_encode() {
    const insertions = 'ghijklmnopqrstuvwxyz'


    const data = document.getElementById("__r18_lcto_1_encode")
    data.value = "lcto://" + data.value.split('')
        .map(it => it.charCodeAt(0).toString(16).padStart(2, "0")) // to hex string
        .map(it => it + insertions[Math.floor(Math.random() * 20)]).join('') + "/?version=1"

    data.focus()
    data.select()
}

function __r18_lcto_1_onclick_decode() {
    const data = document.getElementById("__r18_lcto_1_decode")
    try {
        const payload = new URL(data.value)
        if (payload.protocol !== "lcto:") {
            data.value = "error: unknown protocol"
            return
        }

        if (payload.searchParams.get("version") !== "1") {
            data.value = "error: only v1 is supported"
            return
        }

        const urlBody = isChromiumURLBugPresent() ? payload.pathname : payload.host
        data.value = urlBody.replace(/[g-zG-Z/]/g, "")
                        .match(/.{2}/g)
                        .map(it => String.fromCharCode(parseInt(it, 16)))
                        .reduce((accu, val) => accu += val, "")
        
    } catch(err) {
        data.value = "error"
        console.log(err)
    }
    
}

</script>

## LCTO v2 and v3
No public code available

## LCTO v4

Lama Clear Text Obfuscation Version 4

Encode: 
<input style="min-width: 20rem;" id="__r18_lcto_4_encode"></input>
<button onclick="__r18_lcto_4_onclick_encode()">Encode</button>

Decode: 
<input style="min-width: 20rem;" id="__r18_lcto_4_decode"></input>
<button onclick="__r18_lcto_4_onclick_decode()">Decode</button>

<script>

function isChromiumURLBugPresent() {
    const testURL = new URL("myscheme://body/?test=1")
    return !Boolean(testURL.host)
}

function __r18_lcto_4_onclick_encode() {
    const insertions = 'GHIJKLMNOPQRSTUVWXYZ'
    const replacement = {
        "0": "gq",
        "1": "hr",
        "2": "is",
        "3": "jt",
        "4": "ku",
        "5": "lv",
        "6": "mw",
        "7": "nx",
        "8": "oy",
        "9": "pz",
    }
    const isNumber = (it) => !Boolean(it.match(/[a-f]/))
    const randReplace = (it) => replacement[it][Math.floor(Math.random() * 2)]

    const data = document.getElementById("__r18_lcto_4_encode")
    data.value = "lcto://" + data.value.split('')
        .map(it => it.charCodeAt(0).toString(16).padStart(2, "0")) // to hex string
        .map(it => Array.from(it).map(num => isNumber(num) ? randReplace(num) : num).join("")) // remove number
        .map(it => it + insertions[Math.floor(Math.random() * 20)]).join('') + "/?version=4"

    data.focus()
    data.select()
}

function __r18_lcto_4_onclick_decode() {
    const replacement = {
        "g": "0",
        "q": "0",
        "h": "1",
        "r": "1",
        "i": "2",
        "s": "2",
        "j": "3",
        "t": "3",
        "k": "4",
        "u": "4",
        "l": "5",
        "v": "5",
        "m": "6",
        "w": "6",
        "n": "7",
        "x": "7",
        "o": "8",
        "y": "8",
        "p": "9",
        "z": "9",
    }
    const isNumber = (it) => Boolean(it.match(/[g-z]/))

    const data = document.getElementById("__r18_lcto_4_decode")
    try {
        const payload = new URL(data.value)
        if (payload.protocol !== "lcto:") {
            data.value = "error: unknown protocol"
            return
        }

        if (payload.searchParams.get("version") !== "4") {
            data.value = "error: only v4 is supported"
            return
        }

        const urlBody = isChromiumURLBugPresent() ? payload.pathname : payload.host
        data.value = urlBody.replace(/[G-Z/]/g, "")
                        .match(/.{2}/g)
                        .map(it => Array.from(it).map(num => isNumber(num) ? replacement[num] : num).join(""))
                        .map(it => String.fromCharCode(parseInt(it, 16)))
                        .reduce((accu, val) => accu += val, "")
        
    } catch(err) {
        data.value = "error"
        console.log(err)
    }
    
}
</script>