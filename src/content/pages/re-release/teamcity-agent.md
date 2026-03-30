---
title: "TeamCity 企业版破解 | TeamCityAgent"
date: 2025-04-08T00:00:00-08:00
draft: false
tags: ["crack", "teamcity"]
---

# TeamCity Agent

最近制作了 TeamCity 的破解，本来没考虑发到 GitHub，因为确实容易被Take Down，但是我还是发了。
因为什么呢？因为我想整活，我把这个项目提交到 Jetbrains 免费开源授权申请了。
我是在 4 月 8 日提交的申请，截止到目前（ 4 月 14 日），我还未收到任何回复。
我的 GitHub 仓库也还健在。

## **__使用方法__**

1. 正常安装 TeamCity
2. 前往 [Github Releases](https://github.com/Lama3L9R/TeamCityAgent/releases/latest) 下载 TeamCity Agent。
3. 在 catalina.sh (catalina.bat) 添加以下内容

Linux
```
export JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/TeamCityAgent/TeamCityAgent.jar"
```

Windows 
```
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:/path/to/TeamCityAgent/TeamCityAgent.jar"
```

Build Agent **不需要** 使用 TeamCity Agent

## **__注意事项__**

- 未做 Generic Hook，一旦 JB 改了他们的混淆，这个就不好使了
- 因此请确保你的版本号是 2025.03
- 未来会考虑兼容 Generic Hooking
