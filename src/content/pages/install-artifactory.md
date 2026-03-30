---
title: "安装 & 破解 Artifactory Pro 指南，最新版可用"
date: 2023-06-23T11:18:00+08:00
draft: false
tags: ["crack", "artifactory"]
---

# 00 引言

众所周知，我正在开发 `tg-bote`，本来没准备搞 `Artifactory` 的，但因为 `NPM` 对 `CI` 自动构建支持实在是太差了！
是的没错，开了 `2FA` 就无法 `publish`，必须得输入两步验证码，即使你使用 `Token` 登录

于是无奈，我只能自建一个仓库了，顺路还可以镜像 `NPM` 让我的下载加速

立即去 `Google` 了一下，发现，最新的 `Artifactory Pro` 破解还是在 2020 年左右，破解的版本相当的远古了，还是在 `6.x`。
对于我这种追新党显然是无法忍受版本号低人一等的感受，于是从破解教程给的下载链接找到了“最新版”，着手进行破解。

> 有关具体破解流程、思路详见博客里另一篇文章。

直到我做完第一版补丁，才发现我下载的“最新版”并不是最新！
我是一直从 [JFrog release-docker](https://releases-docker.jfrog.io/) 下载的本体，但这里已经一万年没有更新过了。
还停留在 `7.9.2`，真正的最新版已经到了 `7.59.11`

经过简单的 `Google`，在 [这里](https://jfrog.com/download-jfrog-platform/) 找到了最新版下载入口。然后对补丁进行了小的修正。

现已经完美破解 `Artifactory Pro 最新版 7.59.11`

本教程将在 `Ubuntu 22.04.1 LTS, Linux 5.15.0-75-generic` 上部署  `Artifactory Pro`。
如果你有在 `Windows` 上运行的需求，破解补丁也是可以使用的，方法大同小异，遇到不懂的不会的请多 `Google`。
如果发现了破解补丁出现了 `Bug`，或者是在最新版无法使用了，请到破解补丁的 `Github` 仓库发 `Issue` 给我。
如果未来某天 `Github` 仓库被 `Takedown` 了，你仍可以在 `TG @lamadaemon` 找到我。

# 01 下载必须文件

你需要下载：

- 从 [这里](https://jfrog.com/download-jfrog-platform/) 下载 `Artifactory` 本体
  - 你亦可以从 `Docker` 安装，又可以从压缩包直接安装，我不太熟 `Docker`， 所以我选择从压缩包安装 
- 前往 [ArtifactoryKeygen Github](https://github.com/Lama3L9R/ArtifactoryKeygen) 的 `Releases` 页面下载
  - `ArtifactoryKeygen` 用于生成许可证
  - `ArtifactoryAgent` 用于破解 `Artifatcory`
- 安装 Java 17 或更高版本的运行时
  - `$ sudo apt install openjdk-17-jre`

将下载好的文件保存到你喜欢的地方

# 02 安装 `Artifactory`

安装过程仅供参考，请按照官方文档进行安装


## 02.1 解压

我选择将本体解压在 `/opt` 下，并修改权限

```shell
repo@lamaserver-repo:/opt$ tar -xzf artifactory-pro.tar.gz # 换成你的压缩包命名
repo@lamaserver-repo:/opt$ chown -R repo artifactory-pro # 换成你要跑 Artifactory 的用户名
```

## 02.2 安装成 `systemd` 服务

切换到安装根目录，以 `root` 权限执行 `app/bin/installService.sh `

```shell
repo@lamaserver-repo:/opt/artifactory-pro$ sudo app/bin/installService.sh repo # 记得换成你要跑 Artifactory 的用户名
```

> 我在使用 `installService.sh` 的时候发现 `service` 并不能正常使用，我也懒得查问题了，因为直接运行 `artifactory.sh` 是正常运行的，于是直接手写个 `service`

```systemd-service
[Unit]
Description=Artifactory service
After=network.target

[Service]
Type=simple
ExecStart=/opt/artifactory-pro/app/bin/artifactory.sh

[Install]
WantedBy=multi-user.target
Alias=artifactory.service
```

> 如果在启动的时候遇到莫名的问题，请尝试关闭所有 `Java` 进程，`lsof` 和 `ps` 永远是你的好朋友
> `$ lsof -i:<端口>` 和 `$ ps -u <用户名(如果不是root用户启动记得也看看root，防止以错误的用户启动)> | grep java`

至此已安装完毕，接下来是对其进行破解

# 03 破解

将下载好的 `ArtifactoryAgent` 移动到一个你喜欢的地方，我将她放在了安装根目录，也就是 `/opt/artifactory-pro/` 下。
并重命名为 `ArtifactoryAgent.jar`

我的目录结构如下：
```shell
repo@lamarepo:/opt/artifactory-pro$ ll
total 824
drwxr-xr-x  4 repo root   4096 Jun 23 04:12 ./
drwxr-xr-x  3 root root   4096 Jun 23 04:08 ../
drwxr-xr-x 16 repo repo   4096 Jun 23 04:09 app/
-rw-rw-r--  1 repo repo 825111 Jun 22 17:52 ArtifactoryAgent.jar
drwxr-xr-x  6 repo repo   4096 Jun 23 04:09 var/
```

接下来，用你喜欢的编辑器打开 `var/etc/system.yaml`，添加下方的参数到 `shared.extraJavaOpts` 

```
-javaagent:/path/to/ArtifactoryAgent.jar
```

当然，你需要将 `/path/to/ArtifactoryAgent.jar` 换成你对应的 `ArtifactoryAgent.jar` 路径，下方是我的配置文件的片段，**仅供参考**

```
shared:
    ## Extra Java options to pass to the JVM. These values add to or override the defaults.
    extraJavaOpts: "-javaagent:/opt/artifactory-pro/ArtifactoryAgent.jar"
```

然后使用 `app/bin/artifactory.sh` 直接启动应用来测试破解是否生效，当你在超多的日志中看到了

```
Artifactory Agent :: =====================================
Artifactory Agent ::   Artifactory Agent | by lamadaemon
Artifactory Agent ::   Is now LOADED!
Artifactory Agent ::
Artifactory Agent ::   ALERT! NONE-COMMERCIAL USAGE ONLY!
Artifactory Agent ::   ALERT! USE AT YOUR OWN RISK!
Artifactory Agent :: =====================================
Artifactory Agent :: Patching Class: org.jfrog.license.api.LicenseParser
Artifactory Agent :: Patching Class: org.jfrog.license.api.LicenseManager
```

> **请注意，日志可能并不是挨着的，需要你仔细观察，实在不行搜索一下吧**

当然，出现了以上日志不代表破解 100% 能用，未来如若更新了关键节点位置则破解将不会生效，出现日志仅仅代表破解程序已经成功修改了目标（$修改成功 \ne 破解成功$）。

看到了日志之后就可以使用 `Ctrl + C` 关闭，并用 `Service` 启动也好，`Docker` 也好，总之是按照正常启动的方法启动。

接下来可以使用 `Keygen` 生成一个许可证了，方法同样很简单。
我下载好的 `Keygen` 已经重命名为 `ArtifactoryAgent.jar`，和 `Agent` 存放目录相同。
确保你的 `Java` 运行时版本大于 17，你可以使用下方指令查看
```
repo@lamarepo:/opt/artifactory-pro$ java -version
openjdk version "17.0.7" 2023-04-18  <==================== 版本必须大于等于 17
OpenJDK Runtime Environment (build 17.0.7+7-Ubuntu-0ubuntu122.04.2)
OpenJDK 64-Bit Server VM (build 17.0.7+7-Ubuntu-0ubuntu122.04.2, mixed mode, sharing)
```
> 其实这个程序本体是编译到 `Java 11` 的，但由于 `Artifactory` 跟个啥比一样更新到了 `Java 17`，导致我引入的 `Artifactory` 的库也是 `Java 17` 版本的
> 于是就需要 `Java 17` 或以上的版本才能运行，当然如果你就是想要在 `Java 11` 上运行，请从 `7.9.2` 版本提取库文件，自行编译，详情请见项目 `Github`

> 是的没错，别说我为什么这时候不追新了，`Java 9` 引入的模块系统就是纯纯的垃圾，我就是 `J8` 狂热粉

使用下方指令来生成一个许可证
```shell
repo@lamarepo:/opt/artifactory-pro$ java -jar ArtifactoryKeygen.jar gen
ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL
ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL
ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL

THIS PROJECT IS FOR EDUCATIONAL PURPOSES! YOU SHOULD DELETE ALL THE DOWNLOADED FILES WITHIN 24HOURS
        THE CONSEQUENCES CAUSED BY THE USE OF THIS SOFTWARE SHALL BE BORNE BY THE USER

ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL
ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL
ALERT!! YOU ARE NOT ALLOWED TO CRACK / ILLEGALLY USE ANY COMMERCIAL SOFTWARE BY JFROG WITH THIS TOOL

< Artifactory Keygen By lamadaemon | For help please use 'help' sub-command >

Enter product id(artifactory): # 留空默认为 `artifactory`，直接留空即可
Owner(lamadaemon): # 名字，随便填，也可以空着，默认为 `lamadaemon`

Do you want add more products into this license(yes/no, default=no): no # 是否添加更多许可证，留空、写 `no` 都行
Your license: (DON'T COPY THIS LINE)

<... 省略非常长的许可证 ...>
```

接下来，浏览器进入后台，使用默认账号 `admin` 和默认密码 `password` 登录，填入许可证，破解完成！
