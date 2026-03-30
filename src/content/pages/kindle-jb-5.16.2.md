---
title: "Kindle 5.16.2.1.1 或以下越狱方案"
date: 2023-09-25T00:00:00-07:00
draft: false
tags: ["kindle", "lifehack"]
---

## 前言

我大概几个月前购买了 PW4，买回来的时候系统是最新版本 5.15，无法越狱。尝试了从串口刷机、短接进 fastboot 都无法降级。串口无法进入 U-Boot 启动选择菜单，fastboot 无法识别设备。
于是就放弃了，直到前几天，伟大的群友在国外最有名的 kindle 论坛上发现了一个帖子，国外一名大佬对比了 5.16.2 和 5.16.3 系统版本差异的时候发现了 langpicker.so.1.0 的变更。
变更内容很简单，将删除字典的方法从使用 `system()` 函数调用 rm 指令删除改为了 `lab126_rmdir()`。
稍微懂一点的应该明白越狱是怎么实现的了，没错，就是使用奇怪的文件名，让其以最高权限执行一个我们自己的可执行文件！
于是越狱的关键点就从如何让 kindle 执行我们的文件，变成了如何让 kindle 调用这个不安全的代码。
但是这根本难不住大佬们，几天的时间就找到了通过奇技淫巧切换语言的方法，稳定触发这个安全漏洞。

```c
// 老版本相关代码
__sprintf_chk(acStack_238,1,0x206,"rm -rf %s/%s","/mnt/us/documents/dictionaries",pcVar2);
pcVar6 = (char *)system(acStack_238);
```

```c
// 新版本相关代码
__sprintf_chk(acStack_830,1,0x200,"%s/%s","/mnt/us/documents/dictionaries",pcVar2);
pcVar6 = (char *)lab126_rmdir(acStack_830);
```

所以你会在越狱文件里看到一个这样子的文件名
```shell
a; export SLASH=$(awk 'BEGIN {print substr(ARGV[1], 0, 1)}' ${PWD}); sh ${SLASH}mnt${SLASH}us${SLASH}jb
```

**给各位一个小提示，除非必要，否则不要以最高权限无任何安全检查的前提下执行 shell 指令！否则会有严重的安全问题！**

> 原帖链接：https://www.mobileread.com/forums/showthread.php?t=356766

## 开始越狱

> 越狱流程参考了原帖：https://www.mobileread.com/forums/showthread.php?t=356872

> 让我们给这位制作越狱工具的大佬点赞，有能力的可以捐赠

> https://ko-fi.com/notmarek

> 今日的便利都是由一个个无私的奉献者提供的，让我们将伟大的开源精神传播开来

**请注意，该越狱方法已在 5.16.3 以上版本修复，如果你的 Kindle 尚未更新到 5.16.3 或更高，请立即打开飞行模式防止更新**

![Version.jpg](https://img.imgtu.org/i/2023/10/30/653f1f694447e.jpg)

流程很简单，大概可以总结为：

1. 进入 demo 模式
2. 加载我们的越狱脚本
3. 使用奇技淫巧让 Kindle 调用我们的脚本
4. 越狱成功

### 进入 demo 模式

方法很简单，在你的 Kindle 搜索栏搜索：`;enter_demo`，然后重启系统。

![EnterDemo.jpg](https://img.imgtu.org/i/2023/10/30/653f1ebbc85c9.jpg)

然后在设置里重启 Kindle，就可以进入 demo 模式了。

![HowToRestart.jpg](https://img.imgtu.org/i/2023/10/30/653f1ebbbf080.jpg)

然后开始进入 demo 模式设置，不要联网，直接跳过联网，然后在 Register This Demo 页面随便填，然后点 CONTINUE

![RegisterDemo.jpg](https://img.imgtu.org/i/2023/10/30/653f210fea300.jpg)

然后他会显示 Fetching Demo Types 直接点 skip 即可。
然后会提示你选择 Demo Type，应该只有一个 Standard，如果还有别的则不用管直接选 Standard。

> 图片 4 （忘了拍了）

此时会提示你添加内容，什么也不用管，也不用连电脑，直接点 Done。

> 图片 5 （忘了拍了）

此时会显示怪东西，使用神秘小手势来进入 Kindle 主界面。

1. 首先双指点击屏幕右下角
2. 立刻使用单指从屏幕右下角向左滑动

![DoGestureNow.jpg](https://img.imgtu.org/i/2023/10/30/653f1eafbc5f1.jpg)

### 加载蜜汁小脚本

> 首先你需要下载我们的蜜汁小脚本：https://github.com/notmarek/LanguageBreak/releases
> 随便保存到一个地方，等下会用到

首先在搜索框搜索：`;demo`，即可进入 Demo 模式的设置界面，点击 `Sideload Content`。
将 Kindle 和电脑连接，吧下载到的 LanguageBreak 文件夹里的东西丢到根目录。如果有冲突，全部选择替换即可。

![DemoMenu-Sideload.jpg](https://img.imgtu.org/i/2023/10/30/653f1eafc970f.jpg)
![UploadToKindle.jpg](https://img.imgtu.org/i/2023/10/30/653f1fdb3bf34.jpg)

当复制完成后，拔出 USB，点击 Done 返回上级菜单。选择 Resell Device，在随后出现的菜单里选择 Resell。

![DemoMenu-Resell.jpg](https://img.imgtu.org/i/2023/10/30/653f1eaf9202f.jpg)
![Resell.jpg](https://img.imgtu.org/i/2023/10/30/653f1fd9cd80b.jpg)

当出现让你按下电源键的提示的时候，再次连接电脑，将文件拷贝进去，冲突的文件替换即可，然后短按一下电源键。

**一定不要忘记再次把文件拷贝进去，否则不会工作的！**

![PowerHint.jpg](https://img.imgtu.org/i/2023/10/30/653f1fd9f25bf.jpg)

**接下来会让你选择语言，选择中文，这很重要，如果你想要英语 UI 在这一步，也要选择中文**
**如果你*没有*在这一步看到一个奇怪的 `P s e u d o t ...`的语言，说明你失败了，尝试重新刷一下当前版本的系统，或者重来一次**

**下图是失败截图，成功的我忘了拍了**

![LangSelectFail.jpg](https://img.imgtu.org/i/2023/10/30/653f1f6973739.jpg)

等待开机即可。开机界面应该会跑代码，如果没有跑代码，大概你失败了，你可能需要重新安装你当前系统的版本，再试一次。

**出现设置页面之后不要启用 WIFI。不要联网！这很重要！**

> 第一张图是失败了，第二张图是成功了

![LoadingFail.jpg](https://img.imgtu.org/i/2023/10/30/653f1f6a0090c.jpg)
![LoadingSuccess.jpg](https://img.imgtu.org/i/2023/10/30/653f1f6a324f8.jpg)

参考前面的步骤，完成 Demo 模式设置，我这里提示了 Core dump，不用理会直确定即可，会白屏一阵子然后进入 Demo 模式

### 更新到 JailBreak 系统

刚刚下载到的压缩包里，根目录下应该有很多 .bin 文件，在众多文件名里找到你想要的 Kindle 语言。

比如我想要简体中文，那么我应该选择 `update_hotfix_languagebreak-zh-Hans-CN.bin`

比如我想要英文，那么我应该选择 `update_hotfix_languagebreak-en-US.bin`

选好之后其余的文件没用了，留下你选好的文件即可。**你应该只选一个**

接下来在搜索栏搜索 `;uzb` 后将 `.bin` 文件放入 Kindle 根目录后，断开与电脑的连接，再次在搜索栏中搜索 `;dsts`

![GoUZB.jpg](https://img.imgtu.org/i/2023/10/30/653f1f697e1c6.jpg)
![USBMode.jpg](https://img.imgtu.org/i/2023/10/30/653f1fd9f40af.jpg)

> 这时候你的系统语言应该是中文，因为我误操作了，导致我的系统语言变成了英文，然后出现了奇怪的bug

> 比如前面提到的 Core Dump，还有我 `;uzb` 和 `;dsts` 没反应，无法连接电脑等问题

> 此时长按电源键强制重启即可。你的系统语言应该还会保持在英语，然后重复上面的操作，即可退出 Demo 模式。

> 图片 12 （假装有）

> 图片 13 （假装有）

如果你不确定是否真的成功了，在搜索框输入 `;log` 如果有提示，说明正常了。

### 越狱之后的步骤

首先，如果你的语言没有正常修改，或者飞行模式无法点击、设置里部分选项（比如语言）提示联系管理员，请执行下面的操作：

1. 在搜索框输入 `;demo`
2. 点击确认
3. 等待系统重启并跳过Wifi设置

如上操作会完全的退出 Demo 模式，然后检查是否可以点击飞行模式等操作。

建议当安装了禁止自动更新插件后再联网，防止意外更新导致丢失 JailBreak 或者变砖

后面的步骤就去参考书伴把，基本上就是安装 MRPI 和 KUAL，然后装其他的你喜欢的插件了。

> 书伴教程 https://bookfere.com/post/311.html

> 插件合集 https://www.mobileread.com/forums/showthread.php?t=225030

但是我要是要啰嗦一下，一句话简单描述如何安装。

MRIP 解压俩文件夹丢根目录，KUAL 下 coplate 版本解压带 install 的 .bin 文件丢 mrpackages。
输入指令 `;log mrpi` 安装即可

### 注意，现阶段大部分插件无法安装

```
[2023-10-30 @ 02:21:35 +0000] :: [MRPI r18983] - Beginning the processing of package 'Update_KUALBooklet_ff4134d_install.bin' (KUALBooklet ff4134d I) . . .


Package 'Update_KUALBooklet_ff4134d_install.bin' (KUALBooklet ff4134d I) is not targeting your FW version [!(1679530004 <  < 18446744073709551615)] skipping . . . :(

```

2023/10/30 更新： 如果你遇到了和我一样的问题，即向上面一样，无法读取版本号，可以试试我的修复。

***下面的修复方法由于我只有 PW4，所以未在除了 PW4 以外的机器上测试，砖了我不负责***

1. 首先把 Kindle 连上电脑，确保已经安装 MRPI，然后打开 `extensions/MRInstaller/bin/mrinstaller.sh` 这个文件
2. CTRL + F 搜索 `compute_current_ota_version()` 将

```shell
fw_build_maj="$(awk '/Version:/ { print $NF }' /etc/version.txt | awk -F- '{ print $NF }')"
fw_build_min="$(awk '/Version:/ { print $NF }' /etc/version.txt | awk -F- '{ print $1 }')"
```

替换为

```shell
fw_build_maj="$(cat /etc/version.txt | sed -n '/Version/p' | sed 's/System Software Version: \?//g' | sed 's/-.*-/\n/g' | tail -n 1)"
fw_build_min="$(cat /etc/version.txt | sed -n '/Version/p' | sed 's/System Software Version: \?//g' | sed 's/-.*-/\n/g' | head -n 1)"
```

即可修复，原因是因为 `awk` 似乎炸了，连获取版本号都获取不到，使用 `gawk` 也不行，所以换 `sed`。

下方帖子给出了一个去除了版本号检查的方案，但是不推荐使用，因为总会有操作失误的时候。

> 帖子链接：https://www.mobileread.com/forums/showpost.php?p=4367397&postcount=72

> Make sure you are using coplates KUAL and that you have already copied mrinstaller before copying this extensions folder, don't install dumb shit or you WILL brick your kindle

> 确保你在使用 coplate 版本 KUAL 且你已经安装了 mrinstaller，然后再将附件中的 extensions 文件夹丢进去，不要安装一些垃圾不然你的 Kindle 会变砖的。

**如果您遇到的问题和我的不一样，请耐心等待插件作者修复**
