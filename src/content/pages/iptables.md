---
title: "iptables 学习笔记"
date: 2024-10-25T10:48:24-07:00
draft: false
tags: ["notes"]
---


今天，我终于战胜了对 `iptables` 的恐惧，决定来仔细的学习一下。学完了之后惊人的发现，原来 `iptables` 并不可怕。
他和正则表达式一样，没学之前看到就害怕，但实际学下来也没有很难理解，还很实用。

所谓 `iptables`，其实就是一个用来对 `kernel` 里的一个叫做 `network filter` （后简称 `NF`） 的东西发指令的 `cli` 工具。
通过给 `NF` 发指令，既可实现对网络数据包的操作。
从简单的拒绝特定数据包，到根据条件对包转发等操作都是可行的。

只要理解了 `iptables` 的设计思路，这个工具就没什么难的。

本文是我一边学一边写的，若存在错误，请务必指证我。

基本结构
---

### Tables (表)

既然人家都叫 `iptables` 了，肯定是和 表 (`table`) 有关。最常用到的三个表为：`Filter` `NAT` `Mangle`。
除此之外还有：`Raw` 和 `Security` 两个表，前者适用于处理原始包，后者则是 `SELinux` 相关设置。
这两个表由于不常用（我用不到且不想碰 `SELinux`），将不会在本文覆盖。

- `Filter` 表，主要用于对数据包的筛选，即我们通常指代的 防火墙 的功能。
- `NAT` 表，所谓 `NAT` 指的是 `Network Address Translation`，通常用于转发网络数据包
    + 注意，`NAT` 表区分 `SNAT` 和 `DNAT`，具体区别和用途用法详见后文
- `Mangle` 表，用于对数据包的 Header 进行修改（有关 Header 定义详见文末额外资料）

### Chains（链）

`iptables` 中还有一个关键概念， 链 (`chain`)。所谓链，就是规则的集合。
默认共有五种集合: `PREROUTING` `INPUT` `FORWARD` `OUTPUT` `POSTROUTING`。

每一个表中有若干个链，每一个不同的表由于功能不同，拥有的链也不一样。
下面列出了每一个表中含有的链。

- `Filter`
    + `INPUT` 
    + `FORWARD` 
    + `OUTPUT`
- `NAT`
    + `DNAT`
        - `PREROUTING`
        - `OUTPUT`
    + `SNAT`
        - `INPUT`
        - `POSTROUTING`
- `Mangle`
    + `PREROUTING`
    + `INPUT` 
    + `FORWARD` 
    + `OUTPUT`
    + `POSTROUTING`

### Rules（规则）

一条链上可以存在多个规则，规则将按顺序进行并控制数据包最终的结局。
`iptables` 允许你创建各种各样的规则，每一条规则中包含了 条件 和 结局。
只要条件满足，就会达成相对应的结局。
下面的是一些规则的例子。
- 当来源 IP 为 `192.168.1.2` 时，拒绝数据包
- 当协议为 `TCP` 且来源 IP 为 `10.0.0.3` 时，接受数据包
- 当协议为 `UDP` 时，继续执行下一条规则

如果我们对数据包的结局进行分类，可以大体的分成 中止性 和 非中止性。
中止性代表着将中断执行剩余规则，非中止性代表着将继续执行后续规则。

有一些结局仅在特定的表中可用。

下方根据表列出了常见结局
- `Mangle`
    + `TOS` [非终止] 修改数据包中 `TOS` 字段内容
    + `TTL` [非终止] 修改数据包中 `TTS` 字段内容
    + `MARK` [非终止] 为数据包打上标记
- `NAT`
    + `DNAT` [非终止] 修改数据包的目标地址
    + `SNAT` [非终止] 修改数据包的来源地址
    + `MASQUERADE` [非终止] 动态 IP 兼容的 `SNAT`
- `FILTER`
    + `ACCEPT` [终止] 允许数据包通行
    + `DROP` [终止] 拒绝数据包通行

### Policy（不知道翻译成什么比较好）

即一条 `chain` 中的默认规则

数据包处理顺序
---

当 `NF` 系统处理一个数据包时，会按照如下表的顺序执行规则：（已移除不常用表）

`Mangle` => `DNAT` => `Filter` => `SNAT`

前文提到了，每一个表中有若干个 `chain`，当包在表中被处理时，会经过表中的 `chain`。
无论对于哪个表中的哪个 `chain`，执行顺序是固定的：

`PREROUTING` => `INPUT` => `FORWARD` => `OUTPUT` => `POSTROUTING`

**数据包并不一定按照顺序经过每一个表中的每一个 `chain`**。

我们按照数据包的传递目标位置来对数据包进行分类，可以分出三类：
- 外部包发送到本机的包（我们暂且称其为 `outside to local` 简称 `o2l`）
- 外部包通过本机转发给另一台机器（我们暂且称其为 `outside to outside` 简称 `o2o`）
- 本机向外发出包（我们暂且称其为 `local to outside` 简称 `l2o`）

对于这三种类型的包，经过的表中的 `chain` 不同：
- `o2l`：`PREROUTING` => `INPUT`
- `o2o`：`PREROUTING` => `FORWARD` => `POSTROUTING`
- `l2o`：`OUTPUT` => `POSTROUTING`

整体上的执行顺序应为，按照表执行顺序，从每一个表中的**第一个**应进行的 `chain` 开始执行。
当表中不存在该 `chain` 时，跳过该表。
当全部表的第一个 `chain` 执行完成后，将按照表执行顺序执行下一个 `chain`，并一直继续下去，
直到所有的 `chain` 全部执行完毕。

听起来还挺复杂，让我们来看个例子。

现在有一个数据包 A，从公网发送到了你的路由器上。这个数据包需要发送给路由器上运行的一个进程。

你知道这个数据包是从外界发送给当前机器上的一个进程，因此他是一个 `o2l` 包。
那么他所经过的 `chain` 为 `PREROUTING` 和 `INPUT`。

按照固定的 `chain` 执行顺序，根据表执行顺序应该先执行所有表中的 `PREROUTING`。

1. `Mangle.PREROUTING`
2. `DNAT.PREROUTING`
3. `Filter.PREROUTING`
4. `SNAT.PREROUTING`

聪明的你应该发现了，前面不是说了 `Filter` 和 `SNAT` 表中没有 `PREROUTING` 吗？

是的没错，因此这两个表将被忽略，`PREROUTING` 阶段的实际执行了的 `chain` 为

1. `Mangle.PREROUTING`
2. `DNAT.PREROUTING`

根据 `chain` 执行顺序，`PREROUTING` 的下一个 `chain` 是 `INPUT`，同理可得
实际执行顺序为

1. `Mangle.INPUT`
2. `Filter.INPUT`
3. `SNAT.INPUT`

执行完 `INPUT` 后，下一个 `chain` 是 `FORWARD`，但聪明的你又注意到了
对于 `o2l` 包而言，只经过 `PREROUTING` 和 `INPUT`。
因此后面的 `FORWARD` `OUTPUT` `POSTROUTING` 将一概不被执行。

### 执行顺序总结
当处理一个 `o2l` 包时，经过的所有 `chain` 为：

1. `Mangle.PREROUTING`
3. `DNAT.PREROUTING`
2. `Mangle.INPUT`
4. `Filter.INPUT`
5. `SNAT.INPUT`

当处理一个 `o2o` 包时，经过的所有 `chain` 为：

1. `Mangle.PREROUTING`
3. `DNAT.PREROUTING`
2. `Mangle.FORWARD`
4. `Filter.FORWARD`
5. `Mangle.POSTROUTING`
6. `DNAT.POSTROUTING`

当处理一个 `l2o` 包时，经过的所有 `chain` 为：

1. `Mangle.OUTPUT`
2. `DNAT.OUTPUT`
3. `Filter.OUTPUT`
4. `Mangle.POSTROUTING`
5. `SNAT.POSTROUTING`

**特别注意一点，上面给出的例子和总结中，均使用的 `DNAT` 和 `SNAT` ，看起来像是两个表，实则都是 `NAT` 表。只是出于区分 `DNAT` 和 `SNAT` 功能才将其写开。`NAT` 表中实际含有的链为 `PREROUTING` `INPUT` `OUTPUT` `POSTROUTING` 四个链。后面也将继续将其分开写，但实际使用指令操作 iptables 时，需要写 `NAT`**

操作
---

现在你已经了解了大部分常用的 `iptables` 概念了，现在我们可以来实际的来写规则了。
在一条 `iptables` 指令中，你需要做的第一步是使用 `-t <table>` 指定你要操作的表。
若不指定，则默认的表为 `filter`，但为了便于维护，建议即使是默认表，也使用 `-t filter` 进行指定。

然后就可以跟上你想要的操作了，下面是常见的操作

- `-A <chain>`
    + 在末尾插入规则
    + 示例：`$ iptables -t filter -A INPUT -s 10.0.0.233 -j DROP`
    + 插入一条 拒绝来自 10.0.0.233 的数据包 的规则
- `-D <chain>`
    + 删除链中指定规则
    + 示例：`$ iptables -t filter -D INPUT 1`
    + 删除 `filer.INPUT` 链中第一条规则
- `-F <chain>`
    + 删除链中所有规则
    + 示例：`$ iptables -t filter -F INPUT`
    + 删除 `filer.INPUT` 链中所有规则
- `-L [chain]`
    + 列出链中所有规则，若链未指定则列出所有链中的所有规则
    + 示例：`$ iptables -t filter -L INPUT -n -v`
    + 列出 `filer.INPUT` 链中所有规则
    + `-n` 以 IP 形式显示设备地址
    + `-v` Verbose
- `-R <chain>`
    + 替换链中一条规则
    + 示例：`$ iptables -t filter -R INPUT 1 -s 10.0.0.233 -j ACCEPT`
    + 替换 `filer.INPUT` 链中第一条规则到 如果源地址为 10.0.0.233 则接受包
- `-I <chain>`
    + 向链中插入一条规则
    + 示例：`$ iptables -t filter -I INPUT 1 -s 10.0.0.233 -j DROP`
    + 在 `filer.INPUT` 链中插入新规则到第一条（不会替换原规则）
- `-Z <chain>`
    + 清空链中所有规则触发计数器
    + 示例：`$ iptables -t filter -Z INPUT 2`
    + 清空 `filer.INPUT` 链中第二条规则的触发计数器
- `-P <chain> <action>`
    + 修改该链默认行为
    + 示例：`$ iptables -t filter -P INPUT DROP`
    + `filer.INPUT` 链默认拒绝所有数据包
- `-E <chain> <newname>`
    + 重命名规则
    + 示例：`$ iptables -t filter -E MYCHAIN NEWCHAIN`
    + 修改自定义链 `MYCHAIN` 的名字到 `NEWCHAIN`
- `-N <chain>`
    + 创建新自定义链
    + 示例：`$ iptables -t filter -N MYCHAIN`
    + 创建一条名字为 `MYCHAIN` 的自定义链，
- `-X <chain>`
    + 删除自定义链
    + 示例：`$ iptables -t filter -X MYCHAIN`
    + 删除名字为 `MYCHAIN` 的自定义链

除了指定目标表，和操作以外，对于添加/修改规则类操作，你还需要编写规则。
前文提到，规则包含条件和结局，由于 `iptables` 过于强大，详细的条件列表可以查阅

[详细规则列表](https://www.frozentux.net/iptables-tutorial/chunkyhtml/c2264.html)

在这里介绍一些常用的规则

- `-s <ip>`: 匹配来源 IP
- `-d <ip>`: 匹配目标 IP
- `-i <if>`: 匹配网卡

同样，`iptables` 真的很强大，一个小小的数据包（也可以是大大的数据包），可以有许多种不同的结局。
在这里也只介绍一些常用的

- `ACCEPT`: 接受该数据包
- `DROP`: 拒绝该数据包
- `REJECT`: 拒绝该数据包并反馈给发送方
- `DNAT`: 仅在 `NAT.DNAT` 可用
- `SNAT`: 仅在 `NAT.SNAT` 可用
- `MASQUERADE`: 仅在 `NAT.SNAT` 可用


常见案例的操作方法
---

### 路由器 “开端口” (端口转发)
在处理一个实际问题时，要将 从外部进入的数据包 和 从内部出去的数据包 分开看待。

所谓开端口，通常指将外网数据包转发到内网的一台机器上，即端口转发，通过这一点我们可以判断出，
数据包类型为 `o2o`，介于我们要对数据包进行转发，因此需要使用 `NAT` 功能。

对于 从外部进入的数据包而言，他的目标 (destination) 是该路由器的外网地址，
但我们希望这个数据包落到一台内网的机器上，因此我们需要用 `DNAT` 来修改数据包最终的目标。

提到 `DNAT`，我们应该在 `NAT.PREROUTING` 中对数据包动手。这样我们就可以写出来第一部分指令了

```
$ iptables -t nat -A PREROUTING -j DNAT
```

但是规则还缺少条件和 `DNAT` 目标，我们先从条件开始。
由于我们需要将一个外网端口转发到一个内网机器的一个端口上，我们可以匹配目标端口

```
$ iptables -t nat -A PREROUTING --dport $PORT -j DNAT
```

当然，你可以选择性添加更多的辅助用条件，例如使用 `-d $PUBLIC_IP` 来指定公网 IP，
或者 `-p tcp` 来指定协议。

最后，我们只需要用 `--to-destination <ip[:port]>` 来指定目标即可完成操作。
最终的指令为

```
$ iptables -t nat -A PREROUTING \
    -d $PUBLIC_IP -p tcp --dport $PORT \
    -j DNAT --to-destination $MYIP:$MYPORT
```

这样，我们就成功的配置了端口转发...吗？

别忘了，我们还要在 从内部出去的数据包 这个角度看一下。
假设现在有一台内网机器 B，也希望通过外网访问刚刚我们“开”的端口，
你会惊人的发现这台机器会无法访问。

聪明的你很快就注意到，如果是内网 IP 从外网访问，被正常的 DNAT 转发后，
服务器返回数据包时，源请求数据包的 源地址（机器 B 的内网地址）会变成目标地址，
路由器发现这个目标地址是内网地址，于是就直接发给了内网对应的机器，
然而在机器 B 的眼中，他想要的包是从 “外网IP” 发回来的响应，而不是从一个内网地址发回来的东西。
于是 B 认为：假的！然后就把他 DROP 了。原来的 TCP 链接苦苦等待，直到 timeout 都没能等来心仪的那个包。

解决办法也很简单，我们只需要利用 `DNAT` 的好兄弟 `SNAT` 来修改一下来源 IP 即可，
指令几乎一样，我们只需要修改一下链和吧 `--to-destination` 改为 `--to-source` 即可

```
$ iptables -t nat -A POSTROUTING \
    -d $PUBLIC_IP -p tcp --dport $PORT \
    -j SNAT --to-source $B_IP:$B_IP
```

当然，通常我们都不会去配置 SNAT，如果需要访问内网服务，直接用内网地址就好了。
不排除某些你需要这么做的情况时，你就需要配置 SNAT 了。

### 真 · 开端口

没有任何其他意思，就是允许某个端口的流量进入本机，聪明的你立即就明白了。
“啊！我应该去操作 `filter.INPUT` 链，加一个条件为 `--dport $PORT` 结局为 `-j ACCEPT` 的规则就好了。”
于是你很快的编写出来了对应的指令

```
$ iptables -t filter -A INPUT --dport $PORT -j ACCEPT
```

~~虽然我承认你很聪明，但是还是不如我（不是~~

如果我们使用 `iptables -t filter -L INPUT` 查看规则，我们可以发现
在默认情况下，他的默认结局竟然是... `ACCEPT`!

```
root@very.important.server.lama.icu# iptables -t filter -L INPUT
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
```

也就是说我们开了个寂寞，无论开不来，默认都是通的。

这时候怎么办呢？简单，只需要把默认结局改为 `DROP` 即可

```
$ iptables -t filter -P INPUT DROP
```

当然啊，<span style="color: orangered;font-size: xx-large;">你可得谨慎操作</span>，万一你改完之后你的 `ssh` 突然炸了，连不上机器了，<span style="color: orangered;font-size: xx-large;">我可不负责啊</span>！
切记留好后路: `iptables -t filter -A INPUT --dport 22 -j ACCEPT`

## 额外资料


Header definitions

1. [IP Header definitions](https://www.frozentux.net/iptables-tutorial/chunkyhtml/x178.html)
2. [TCP Header definitions](https://www.frozentux.net/iptables-tutorial/chunkyhtml/x229.html)
3. [UDP Header definitions](https://www.frozentux.net/iptables-tutorial/chunkyhtml/x263.html)
4. [ICMP Header definitions](https://www.frozentux.net/iptables-tutorial/chunkyhtml/x281.html)

Tools

1. [rc.test-iptables.txt](https://www.frozentux.net/iptables-tutorial/chunkyhtml/x6002.html)