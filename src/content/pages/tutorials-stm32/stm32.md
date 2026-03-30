---
title: "STM32 | VSCode + WSL + JLink + Make 工具链环境配置"
date: 2023-05-17T23:37:53+08:00
draft: false
tags: ["tutorial"]
---

## 为什么不用某希腊字母或者某立方体呢？ 或者一些在 `Windows` 上的 `gcc` 链呢？

既然你都看到这篇文章了，说明你应该大概是需要和我一样的这一套工具链的，但我还是想扯一点理由，这些理由对于你来说可能不是很充分，但对我来说是致命的。

1. 某希腊字母不支持高分屏
2. 某立方体自动补全只有补全，没有自动（实现自动的唯一办法是去重新编译补全插件）
3. 自从 `WSL` 发布之后我就开始不喜欢甚至讨厌 `mingw` 了，我认为 `mingw` 是一种很扭曲的东西，仅仅是在没有 `WSL` 的时代下的 `linux` 环境替代品罢了

## 0. 配置系统环境

首先这篇文章针对的是 `Windows` 平台，~~所以其他平台可以退了（~~

既然是基于 `WSL` 的工具链，那么你必须先安装 `WSL 2`，以管理员模式打开 `Powershell` 并执行下面的代码以启用 `WSL` 功能

```powershell
$ Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform, Microsoft-Windows-Subsystem-Linux
```

>这时候肯定会有人说：我听说 `WSL 1` 的 `USB` 是直通的，因此用 `WSL 1` 应该会更好

虽然确实 `WSL 1` 的 `USB` 是直通的，但是这不代表 `WSL 2` 没有办法使用 `USB`，而且相信我，我最开始也是这样认为的，然后折腾了很久最终还是选择了 `WSL 2`

>对于一些 `PTC Creo` 用户可以放心安装 `VirtualMachinePlatform`，虽然它和 `Hyper-V` 有不少联系，但是不用担心，实测 `Creo 9` 一切正常。

执行完上面的步骤后，你需要重启你的电脑来完成新功能的安装，这时候你可以顺路去 `BIOS` 中启用虚拟化，至于如何启用，请自行 [`Google`](https://google.com)

重启完成后，你还需要再额外安装一个程序，用于连接 `USB` 设备

`usbipd-win`: [官方 Github](https://github.com/dorssel/usbipd-win)

## 1. 配置 WSL 环境

首先你需要选择一个你喜欢的发行版，这里我选择 `Archlinux`，理由很简单，需要操作的步骤少，开箱即用

`Archlinux WSL`: [官方中文文档](https://github.com/yuk7/ArchWSL/blob/master/i18n/README_zh-cn.md)

当然如果你执意想用 `Ubuntu` 我也拦不住你，但是后面别忘了 `update-alternitive`

首先你需要安装超多的包，因为我本人使用 `paru` 作为 `AUR Helper` 因此后面的指令均基于 `paru`，配置软件源和更新`keyring`的过程已忽略，请自行 [`Google`](https://google.com)

1. 安装 `arm gcc`: `$ paru -S arm-none-eabi-gcc arm-none-eabi-newlib arm-none-eabi-gdb`
2. 安装用于生成 `c_cpp_properties.json` 的工具: `paru -S nodejs-lts-hydrogen git && npm install -g yarn`
3. 安装 `JLink`: `paru -S jlink-software-and-documentation usbip`
4. 其余工具：`paru -S wget base-devel`

有一些包可能看起来很陌生，下面会进行解释

1. `usbip`: 用于连接主机 `USB` 设备
2. `nodejs`: 用于执行 [`STM32Helper`](https://github.com/Lama3L9R/stm32helper)

## 2. 配置 VSCode 环境

当然在这之前你可能需要先从`STM32CubeMX`生成一个项目，构建系统选择 `Makefile`，然后直接在 `WSL` 中切换到项目根目录，运行 `code .` 即可打开 `VSCode`

然后你需要在插件市场中下载安装以下几个插件：

1. `C/C++`: 用于自动补全
2. `WSL`: 最好有，可以方便很多
3. `Cortex-Debug`: 用于调试（打断点等）

接下来在你的项目根目录创建 `.vscode` 文件夹（如果不存在），并在其他一个你喜欢的地方克隆 [`STM32Helper`](https://github.com/Lama3L9R/stm32helper) 这个仓库

> **切记，本项目是针对于 `STM32CubeMX` 并选择 `Make` 作为构建系统生成的项目！其他环境无法使用本项目，请参考该项目手动配置！**

```
$ git clone https://github.com/Lama3L9R/stm32helper.git
```

~~切换到该目录，执行 `$ yarn install` 安装依赖库。等待安装完成后就可以生成 `c_cpp_properties.json` 了，这个小工具使用方法很简单，只需要执行 `index.js` 并附带两个参数，就可以将生成好的文件输出在 STDOUT~~

**2023/5/21 更新: 现在已无需那么麻烦，只需要执行 `$ yarn install` 后执行下方的指令即可一键设置 `c_cpp_properties.json`、`Cortex-Debug` 配置文件和构建配置文件（也就是 `Ctrl+Shift+B`）**

**2023/5/21 更新第二次: 现在已无需那么麻烦，只需要执行 `$ yarn install && npm install -g .` 后在项目根目录下执行下方的指令即可一键设置 `c_cpp_properties.json`、`Cortex-Debug` 配置文件和构建配置文件（也就是 `Ctrl+Shift+B`），主要是添加了可以全局安装的功能，如果你不喜欢全局安装，可以手动调用 index.js 就是麻烦些**

```
$ stm32helper vscode .
```

一份正常的 `c_cpp_properties.json` 大概长这个样子

```
{
    "configurations": [
        {
            "name": "STM32Helper",
            "includePath": [
                "Inc",
                "Drivers/STM32F1xx_HAL_Driver/Inc",
                "Drivers/STM32F1xx_HAL_Driver/Inc/Legacy",
                "Drivers/CMSIS/Device/ST/STM32F1xx/Include",
                "Drivers/CMSIS/Include",
                "Middlewares/ST/STM32_USB_Device_Library/Core/Inc",
                "Middlewares/ST/STM32_USB_Device_Library/Class/CDC/Inc",
                "/usr/lib/gcc/arm-none-eabi/13.1.0/include",
                "/usr/lib/gcc/arm-none-eabi/13.1.0/include-fixed"
            ],
            "browse": {
                "path": [
                    "Inc",
                    "Drivers/STM32F1xx_HAL_Driver/Inc",
                    "Drivers/STM32F1xx_HAL_Driver/Inc/Legacy",
                    "Drivers/CMSIS/Device/ST/STM32F1xx/Include",
                    "Drivers/CMSIS/Include",
                    "Middlewares/ST/STM32_USB_Device_Library/Core/Inc",
                    "Middlewares/ST/STM32_USB_Device_Library/Class/CDC/Inc",
                    "/usr/lib/gcc/arm-none-eabi/13.1.0/include",
                    "/usr/lib/gcc/arm-none-eabi/13.1.0/include-fixed"
                ],
                "limitSymbolsToIncludedHeaders": true,
                "databaseFilename": ""
            },
            "defines": [
                "__ACCUM_EPSILON__=0x1P-15K",
                "__ACCUM_FBIT__=15",
                "__ACCUM_IBIT__=16",
                省略400多行...
                "__WINT_TYPE__=unsigned int",
                "__WINT_WIDTH__=32",
                null,
                "USE_HAL_DRIVER",
                "STM32F103xB"
            ],
            "intelliSenseMode": "clang-x64",
            "compilerPath": "/usr/bin/arm-none-eabi-gcc -mcpu=cortex-m3 -mthumb  ",
            "cStandard": "c17"
        }
    ]
}

```

**请注意，本项目刚刚写完不久，因此脚本可能并不能处理任意环境，推荐使用 `Archlinux` 来避免出现奇怪的错误，如果出现了，请务必开一个 `issue` 来帮助这个项目更上一层楼**

至此，你的环境已经配置好了一半了

## 3. `USB` 转发

其实关于这部分，在 `usbipd-win` 的文档中写的相当详细了，推荐去查看

首先回到 `Windows` 并以管理员身份打开一个 `Powershell`，接下来你需要获取 `JLink` 设备所在的 `USB ID`

```
$ usbipd wsl list
```

输出大概长这个样子

```
BUSID  VID:PID    DEVICE                                                        STATE
1-1    be57:020f  Best Audio, USB 输入设备                                      Not attached
1-2    0b05:19af  AURA LED Controller, USB 输入设备                             Not attached
1-5    046d:c539  USB 输入设备                                                  Not attached
4-4    1a81:203b  USB 输入设备                                                  Not attached
5-3    1366:0105  JLink CDC UART Port (COM3), J-Link driver                     Not attached
```

你需要关注的是 `JLink` 设备的 `BUSID`，在我的实例中即为 `5-3`。然后你就可以通过下面的指令将 `JLink` 连接到 `WSL`

```
$ usbipd wsl attach -b <BUSID>
```

如果你想断开与 `WSL` 的连接，你可以将上面指令中的 `attach` 换成 `detach` 即可断开连接

现在如果你回到 `WSL` 中且安装了 `usbutils` 你就可以查询到 `JLink` 已经被识别到了

```
$ lsusb
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 002: ID 1366:0105 SEGGER J-Link             <<< 成功的识别到了
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

这时候，如果你执行 `JLinkExe` 会发现他根本连不上这个设备，造成这个问题的主要原因是因为权限不够，只需要用 `root` 用户或者给予相应权限即可解决问题

## 4. Cortex-Debug

若想正常使用 `Cortex-Debug` 还需要一些额外的配置

在 `VSCode` 中按下 _Command Palette_ 的快捷键（默认为 `Ctrl` + `Shift` + `P`）后输入下面的指令

```
> Open user settings (JSON)
```

即可打开用户设置，并在里面添加两个值，一个为：`cortex-debug.JLinkGDBServerPath`，另一个是：`cortex-debug.gdbPath`

1. `cortex-debug.JLinkGDBServerPath`: 您需要填写 `JLinkGDBServer` 的可执行文件完整路径，可以通过 `$ which JLinkGDBServer` 查询位置
2. `cortex-debug.gdbPath`: 您需要填写 `arm-none-eabi-gdb` 的可执行文件完整路径，可以通过 `$ which arm-none-eabi-gdb` 查询位置

保存这个文件，至此你的开发环境已经设置完毕，一切功能都基本可以正常使用