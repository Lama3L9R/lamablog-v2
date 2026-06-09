---
title: "妹居物语 Mod Loader"
date: 2026-06-09T00:00:00-08:00
draft: false
tags: ["crack", "modding"]
---

# sora-loader

做了一个简单的 Modloader，目前没有任何 framework、helper 函数，仅仅能做到注入游戏源代码，仅此而已。
写这个的目的其实是为了 debug 为什么我的 openai api 不能用，因为我看 deepseek 的 api 是和 openai 的兼容的。
于是开始了破解这玩意儿，为了干掉完整性校验并打开 devtools，虽说后面发现 `--dev` 就行了。

那么为什么你不写个完整一点的 modloader 呢？因为我至今还未实际进入游戏... 以后如果真的有人用这玩意儿我再补全吧。

总之无论如何，加载 Modloader 的办法也很简单，找到 `resources/install-hooks.js`，打开，复制里面所有内容，粘贴到下面的框里，
然后点一下按钮，就会出现 patch 好的入口文件，然后就可以自由注入游戏文件了。如果你想做 mod 看下面。
使用 mod 只需要在 resources/mods 文件夹里塞 js 文件即可，加载器会自动读取所有 js 文件。

<style>
  .patch-tool {
    padding: 16px;
    border: 3px solid #d0d7de;
    border-radius: 8px;
    font-family: Arial, sans-serif;
  }

  .patch-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .patch-input,
  .patch-output {
    box-sizing: border-box;
    padding: 8px 10px;
    width: 100%;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    font: inherit;
  }

  .patch-output-wrap {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transform: scaleY(0.96);
    transform-origin: top;
    transition: max-height 320ms ease, opacity 220ms ease, transform 320ms ease;
  }

  .patch-output-wrap.is-visible {
    max-height: 360px;
    opacity: 1;
    transform: scaleY(1);
  }

  .patch-output {
    min-height: 240px;
  }

  .patch-input,
  .patch-output {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .patch-input::-webkit-scrollbar,
  .patch-output::-webkit-scrollbar {
    display: none;
  }

  .patch-input:focus,
  .patch-output:focus {
    outline: none;
    border-color: #828282;
  }

  .patch-button {
    padding: 8px;
    border: 1px solid #fff;
    border-radius: 6px;
    color: #fff;
  }

  .patch-button:hover {
    background: #a9a9a9;
  }

  .hint {
    margin: 0.5em;
  }

  .gradient-title {
    display: inline-block;
    margin-left: 0.4em;
    background: linear-gradient(90deg, #33aaff, #bfeaff, #33aaff);
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    font-weight: bold;
    animation: gradient-shift 2s linear infinite;
  }

  @keyframes gradient-shift {
    to {
      background-position: 200% center;
    }
  }
</style>

<div class="patch-tool">
  <p class="hint">让我们狠狠注入妹妹！点 patch 会自动复制<span class="gradient-title">sora-loader 1.0</span></p>
  <div class="patch-row">
    <textarea class="patch-input" id="inputBox"></textarea>
    <button class="patch-button" type="button" onclick="convertInput()">patch</button>
  </div>

  <div class="patch-output-wrap" id="outputWrap">
    <textarea class="patch-output" id="outputBox" readonly></textarea>
  </div>
</div>

<script>
function patch(original) {
  // 之所以自动捕获参数1是为了万一以后作者终于决定不再 vibe coding，
  // 并正经的使用了 minifier 给 js 全都 minify 之后依旧可以用
  const insertions = `
    console.log("sora-loader 1.0 by @lamadaemon, captured cryptoModule var name:", "$1");
    const $1 = { ...__lamadaemon__crypto_module_original };
    { // 让我们防止变量外泄
      $1.__original_getDecryptedText = $1.getDecryptedText;
      $1.__original_getDecryptedFile = $1.getDecryptedFile;

      const fs = require("fs")
      const path = require("path")
      const Module = require("module")

      const eventHandlers = {
        onTextDecrypted: [],
        onFileDecrypted: [],
        onPreModuleLoad: [],
        onPostModuleLoad: [],
      }

      function callEventHandlers(handlers, params) {
        for (let i = 0; i < handlers.length; i ++) {
          const handler = handlers[i]
          const result = handler(params, __lamadaemon__crypto_module_original)

          if (!result || result.next) {
            continue
          }

          return result.value
        }
      }

      const base = path.resolve(__dirname, "./mods")

      if (!fs.existsSync(base)) {
        fs.mkdirSync(base)
      }

      for (const fileName of fs.readdirSync(base)) {
        const fullPath = path.join(base, fileName)

        if (fs.statSync(fullPath).isDirectory()) {
          continue
        }

        if (fileName.endsWith('.js')) {
          const script = require(fullPath)

          script(eventHandlers)
        }
      }

      $1.getDecryptedText = function(path) {
        const originalResult = $1.__original_getDecryptedText(path)

        const result = callEventHandlers(eventHandlers.onTextDecrypted, { args: [path], originalResult })

        if (result !== undefined) {
          return result
        }

        return originalResult
      }

      $1.getDecryptedFile = function(path) {
        const originalResult = $1.__original_getDecryptedFile(path)

        const result = callEventHandlers(eventHandlers.onFileDecrypted, { args: [path], originalResult })

        if (result !== undefined) {
          return result
        }

        return originalResult
      }

      const originalLoad = Module._load

      Module._load = function hookedLoad(request, parent, isMain) {
        let filename

        try {
          filename = Module._resolveFilename.call(this, request, parent, isMain)
        } catch {
          filename = request
        }

        const preResult = callEventHandlers(eventHandlers.onPreModuleLoad, { thiz: this, args: [request, parent, isMain], filename })

        if (preResult !== undefined) {
          return preResult
        }

        const exported = originalLoad.call(this, request, parent, isMain)
        
        const postResult = callEventHandlers(eventHandlers.onPostModuleLoad, { thiz: this, args: [request, parent, isMain], filename, originalResult: exported })

        if (postResult !== undefined) {
          return postResult
        }

        return exported
      }
    };
  `

  let patched = original
  let replaceCount = 0

  // AI 写的正则，懒得自己写了 :/，自己写还得查反斜杠转义（鬼记得住那一堆反斜杠都是啥），还得测试，太麻烦了
  // 凑合能用就得了（下面这个解释也是AI写的）
  // 正则匹配 bootstrapAll 函数头
  // \s* 用于完美兼容代码被压缩后没有空格、带换行等各种鬼畜排版
  // ([a-zA-Z0-9_$]+) 用于抓取第一个合法的 JS 变量名，也就是你说的 $1
  const funcRegex = /function\s+bootstrapAll\s*\(\s*([a-zA-Z0-9_$]+)\s*,\s*appDir\s*,\s*mainRelativePath\s*,\s*payloadRoot\s*\)\s*\{/g

  patched = patched.replace(funcRegex, (match, p1) => {
    replaceCount += 1

    const injectedCode = insertions.replace(/\$1/g, p1)
    return `function bootstrapAll(__lamadaemon__crypto_module_original, appDir, mainRelativePath, payloadRoot) {\n${injectedCode}\n`
  })

  if (replaceCount === 0) {
    return null
  }

  return patched
}

function convertInput() {
  const inputBox = document.getElementById('inputBox')
  const outputBox = document.getElementById('outputBox')
  const outputWrap = document.getElementById('outputWrap')

  if (!inputBox.value) {
    return
  }

  const patched = patch(inputBox.value)

  if (patched === null) {
    return
  }

  outputBox.value = patched
  outputWrap.classList.add('is-visible')

  outputBox.focus()
  outputBox.select()

  navigator.clipboard.writeText(outputBox.value)
}
</script>

爆炸了？[点我下载原始 install-hooks 文件](/data/sora-loader/install-hooks.original)
> depot_id `4027871`, build_id `23007293` 

> SHA1 `D095607828F46E7E75A507890180B48B213A4881`


## 做 mod

下面是一个 example mod，做完了扔 mods 文件夹里就行，会加载所有里面的 js 文件，注意 —— 不会加载文件夹！
设计不加载文件夹是为了，万一以后有人要做一个更好的框架，可以直接复用我这个 loader，直接加载他的框架，
然后框架专属的插件可以由框架自己控制，比如 mods/plugins/some-plugin.js 这样
```javascript
module.exports = function(handlers) {
  handlers.onTextDecrypted.push((ctx, cryptoModule) => {
    console.log("[Example Mod] Decrypted (text):", ctx.args[0])

    return { next: true }
  })

  handlers.onFileDecrypted.push((ctx, cryptoModule) => {
    console.log("[Example Mod] Decrypted (file):", ctx.args[0])

    return { next: true }
  })

  handlers.onPreModuleLoad.push((ctx, cryptoModule) => {
    console.log("[Example Mod] Module load (pre):", ctx.filename)

    return { next: true }
  })

  handlers.onPostModuleLoad.push((ctx, cryptoModule) => {
     console.log("[Example Mod] Module load (post):", ctx.filename)

     return { next: true }
  })
}
```

## footnote1

Technically speaking, 你可以用这个 modloader 来 dump 所有加密文件、也可以破解桌宠功能，但我可没指示你这么做。
神秘关键字提示：`window.TESystem`，我没破解，我也没试过，只是简单看了一下，发现 emit 了一个 event + TESystem 控制这东西。
剩下的自己研究吧，我还得研究这玩意儿为啥用不了我的中转站。

## footnote2

你可能会想问，开源仓库在哪里？根本没有，直接按F12就能看见了，一点混淆都没，我可懒得搞这种东西，凑合看吧。
看不懂的话你可以复制粘贴给 AI，让 AI 给你解释。假装他有个开源协议 Anti996 并宽松执行 —— 即不强制执行条款，但推荐执行。