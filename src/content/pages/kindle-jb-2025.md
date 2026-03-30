---
title: "Kindle 2025 新年越狱方案（目前为止任意版本任意 Kindle）"
date: 2025-01-01T00:00:00-07:00
draft: true
tags: ["kindle", "lifehack"]
---

## 前言

自从我上次越狱完了之后意外更新系统 hotfix 失效后，就再也没有机会再次越狱。
直到今年早些时候（4月）在 Kindle Modding Community 的 discord 频道中
发布了一条公告关于新的 Exploit `MountSus` 将会在年底发布新的 JB。
发布时间从原定的感恩节一直等到圣诞节，但因为亚马逊发布了新的设备和固件导致 JB 需要调整
于是就一直等到了今天，2025年 1 月 1 日，他终于来了

$\big{WinterBreak a.k.a. MountSus}$

还记得我在上一篇博文写的：
> 给各位一个小提示，除非必要，否则不要以最高权限无任何安全检查的前提下执行 shell 指令！
> 否则会有严重的安全问题！

是的没错，这次又是同样的问题！不过并不是上次的用 `system()` 进行基础操作了。
而是通过 `lab126` 为浏览器商店和其他应用提供的 Lipc 非公开 API 执行 shell 脚本。
利用浏览器商店离线缓存机制，可以启动一个社区制作的开发框架 `mesquito`。
`mesquito` 提供了访问该 API 的方式和在 Kindle 上启动自定义网页的方法。
其中的一个 API 提供了执行指令的途径，并且是以最高权限执行。

```javascript
nativeBridge.accessHasharrayProperty("com.lab126.transfer", "request_upload", {
    url: "http://127.0.0.1",
    source_command: "sh /mnt/us/jb.sh", // Laughs in freedom
    unique_id: "winterbreak",
    
    netid: 1, // Force WiFi (idk why sometimes it uses WAN if you don't set this and fails???) (I don't even know if this is the right key I sure HOPE it is)
    priority: 2000,
    notify_progress_interval: 20,
    notify_pub: "com.lab126.archive",
    notify_prop: "transferProgressNotification",
});
```

当然该 API 本是非公开的，通过 `mesquito` 的黑魔法实现了公开调用。

## 越狱流程

需要的文件下载链接：~~关注微信公众号辣妈之旅获取（开个玩笑）~~ 

你可以在作者的 Github Releases 下载：https://github.com/KindleModding/WinterBreak/releases

相比上次的 `LanguageBreak`，`WinterBreak` 相当简单，首先你需要先进入飞行模式。
用 USB 连接电脑后，直接在设备根目录直接解压所有文件即可安装 `mesquito` 和 `WinterBreak`。

[pic1]

接下来，保持飞行模式，长按电源键重启你的设备后点击右上角商店图标

[pic2]

然后你会看到问你是否关闭飞行模式，点击 `是`

[pic3]

然后你就可以看到 `mesquito` 的主界面了，然后你只需要点击 `WinterBreak` 即可越狱

[pic4]
[pic5]

你大概会需要等待很久，5-10分钟后仍无动静你可以考虑重启重试一下。

[pic6]

## 越狱后

当越狱成功后，你需要安装 `hotfix` 和 `renameotabin` 来确保更新后越狱不会丢失和阻止自动更新。
请注意 `hotfix` 不代表 100% 更新后不会丢失越狱，请谨慎更新系统！

## 一些你可能遇到的问题

### 我按照你的操作后，在关闭飞行模式后，提示连接到 Wi-Fi

这有可能是因为你没有链接过任何 Wi-Fi。
你可以尝试先链接一个 Wi-Fi，然后进入飞行模式，再执行后续操作。
如果你担心出现差错，你可以选择用手机热点作为 Wi-Fi，然后手机断网。
