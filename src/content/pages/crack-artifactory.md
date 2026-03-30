---
title: "破解 Artifactory Pro 思路"
date: 2023-06-23T11:18:00+08:00
draft: false
tags: ["crack", "artifactory"]
---

因为一些原因我阴差阳错的将 7.9.2 认为是最新版，于是我最开始的破解都是基于 7.9.2 制作的。
直接在我的主力机部署一份 Artifactory 用于测试和实验。看到使用的是 SpringFramework 并且看上去似乎没有什么混淆，大概破解起来不会太费劲。
事实上确实不费劲。

我准备先输入一个错误的许可证看看有没有什么报错、输出，幸运的是，他有！多亏了 SpringFramework 的精美报错，让我立刻定位到了报错的位置 `ArtifactoryLicenseVerifier`

```
2023-06-21T14:34:17.254Z [jfrt ] [ERROR] [28c05688836a496f] [ArtifactoryLicenseVerifier:120] [http-nio-8081-exec-8] - Failed to decrypt license: last block incomplete in decrypti
```

接下来就是找到这个类，也很简单，一番搜索找到了 tomcat 和 artifactory.war 的位置，立刻用 jdgui 打开 artifactory.war 搜索这个类。
有些时候实在是找不到也可以写一个简单的 JavaAgent 然后输出这个类的位置即可，下面是我自用的小工具源码，最好不要用 Kotlin 写，因为可能会出现莫名的问题。
比如我就遇到了到死也没有任何类被 ClassFileTransformer 处理的怪问题。到处都 runCatching 也没发现任何异常，很是奇怪。因此最好用 Java 写。

```java
public static void premain(String args, Instrumentation ins) {
    if (args != null) {
        System.out.println("Lama Javaagent Test App :: is now LOADED with class filter: " + args);
    } else {
        System.out.println("Lama Javaagent Test App :: is now LOADED");
    }
    ins.addTransformer(new ClassFileTransformer() {
        
        @Override public byte[] transform(Module module, ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
            String moduleName = "<null>";
            if (module != null) {
                if (module.getName() != null) {
                    moduleName = module.getName();
                } else {
                    moduleName = "<No Name>";
                }
            }
            if (predict(className)) {
                System.out.println("Lama Javaagent Test App :: Module Transformation Triggered: className=" + className + ", module.getName=" + moduleName);
            }
            return classfileBuffer;
        }

        public boolean predict(String className) {
            if (args == null) {
                return true;
            }
            return Objects.equals(className.replace("/", "."), args);
        }
    });
}
```

不要忘记在 build.gralde 里同时加入：
```kotlin
tasks.withType<Jar> {
    manifest {
        attributes["Premain-Class"] = "icu.lama.AgentMain"
        attributes["Can-Redefine-Classes"] = true // 一定别忘了这个
        attributes["Can-Retransform-Classes"] = true // 一定别忘了这个
    }
}
```

一番查找后，最终定位到 `artifactory-addons-manager-7.9.2.jar` 里的 `org.artifactory.addon.ArtifactoryLicenseVerifier`。
幸运的是，整个文件内只有一处调用了 `Logger#error`，直接锁定目标方法是 `ArtifactoryLicenseVerifier#a(Ljava/lang/String)Lorg.jfrog.license.api.License`

```java
private static a d = new a();

private static License a(String paramString) {
  try {
    return d.a(paramString);
  } catch (LicenseException licenseException) {
    a.error(licenseException.getMessage());
    b.debug(licenseException.getMessage(), (Throwable)licenseException);
    return null;
  } 
}
```

这时候如果单看导入会发现他同时引入了两个 `a`，这时直接用 jdgui 跟一下类就行，如果出现了跟不了的情况，也可以通过分析两个类来进行确定具体是哪一个。
在这里很显然 `org.jfrog.license.api.a` 才是我们需要的。查看一下 `org.jfrog.license.a.a` 可以发现他是一个独立的类，看到内部有许多的位运算，再加上调用的地方均都是 String 类型变量
因此猜测这个类可能是解密字符串一类的东西，直接拿出来在jshell里运行一下

```java
(new a(new long[] { 2731559786009819271L, -1294798864979958372L, 493539018728922049L, -7676131744833282422L, 5840148757141871421L, -9166198372908531643L })).toString()
```
得到 `ArtifactoryLicenseVerifier`

查看库内有许多的类似调用，即 `(new a(new long[] { 许多神秘数字... })).toString()`，断定该类是用于字符串解密的类。

回到正题，查看 `org.jfrog.license.api.a#a(Ljava/lang/String)Lorg.jfrog.license.api.License`
```java
public License a(String paramString) throws LicenseException {
  try {
    return b(paramString, c);
  } catch (LicenseException licenseException) {
    try {
      return c(paramString, b);
    } catch (LicenseException licenseException1) {
      return a(paramString, licenseException1);
    } 
  } 
}
```

由于是有异常抛出，而且两个 catch 都是 LicenseException，猜测 `b` 和 `c` 都是用于解密 License 的方法，且 `c` 有可能是 `b` 的 Fallback，那么为何不从 `b` 入手呢。

```java
private License b(String paramString1, String paramString2) throws LicenseException {
  License license = (new org.jfrog.license.multiplatform.a()).a(paramString1, e(paramString2));
  HashMap<Object, Object> hashMap = new HashMap<>();
  for (Map.Entry entry : license.getProducts().entrySet())
    hashMap.put(entry.getKey(), ((SignedProduct)entry.getValue()).parseProduct()); 
  License license1 = new License();
  license1.setValidateOnline(license.getValidateOnline());
  license1.setProducts((Map)hashMap);
  license1.setVersion(license.getVersion());
  return license1;
}
```

可以看到第一行调用了 `org.jfrog.license.multiplatform.a#a` 来生成一个 License 对象，那么这个应该是真正的解密 License 的地方，那么就来看看参数吧。
这个方法接受两个参数，一个是 String，另一个是 PublicKey，那么可以很自然的推测出 `e(paramString2)` 是用来从 `paramString2 即 c` 生成公钥对象用的。
对 `c` 进行解密发现是一串 `Base64`，根据方法 `e` 可以判断出这个公钥是 `RSA` 格式的。

接下来深入看 `org.jfrog.license.multiplatform.a#a`，首先是对输入的 License 内容进行 Base64 解密。
然后使用 `this.a.<SignedLicense>a(arrayOfByte, SignedLicense.class)` 将解密结果转成了 SignedLicense。
这就很显然了，这个 100% 是某个库的反序列化代码，如果跟一下会发现其实就是使用 `SnakeYAML` 进行反序列化。
同一个类中的另一个方法正是序列化，因此为我省了不少事，只要我可以创建一个合法的 `SignedLicense`，调用这个代码即可完成序列化。

```java
public License a(String paramString, PublicKey paramPublicKey) throws LicenseException {
  byte[] arrayOfByte = Base64.decodeBase64(paramString);
  try {
    SignedLicense signedLicense = this.a.<SignedLicense>a(arrayOfByte, SignedLicense.class);
    signedLicense.verify(paramPublicKey, this.b);
    arrayOfByte = Base64.decodeBase64(signedLicense.getLicense().getBytes());
    return b(paramPublicKey, arrayOfByte);
  } catch (SignatureException|java.security.InvalidKeyException|LicenseException signatureException) {
    return a(paramPublicKey, arrayOfByte);
  } 
}
```

下一行使用了 `signedLicense.verify(paramPublicKey, this.b);` 很显然这是在验证许可证是否有效，`this.b` 是 `Signature`，也就是 Java 中对内容创建签名用的类。
结合前面的发现，签名算法应该是 RSA。签名如果验证失败了会抛出异常，那么我们假设验证成功，跟一下下一行，也就是另一个 Base64 解密。

```java
private License b(PublicKey paramPublicKey, byte[] paramArrayOfbyte) throws LicenseException {
  License license = this.a.<License>a(paramArrayOfbyte, License.class);
  if (license.getProducts() == null || license.getProducts().size() == 0)
    throw new LicenseException("Failed to verify license, no products"); 
  try {
    for (SignedProduct signedProduct : license.getProducts().values())
      signedProduct.verify(paramPublicKey, this.b); 
  } catch (SignatureException|java.security.InvalidKeyException signatureException) {
    throw new LicenseException("Failed to verify license", signatureException);
  } 
  return license;
}
```

其实已经很显然了，将解密出来的 License 又调用了一次一摸一样的反序列化方法，然后就是对真正的 License 内所有 `SignedProduct` 进行公钥签名验证。
最关键的是 **全程都在使用同一个公钥，也就是 `org.jfrog.license.api.a#a.c`**。我们的破解思路已经很明确了：

1. 创建 SignedProduct 对象
2. 将 SignedProduct 对象加入到 License 中
3. 序列化 License 并 Base64 加密 
4. 创建 SignedLicense
5. 序列化 SignedLicense 并 Base64 加密

幸运的是，提及的所有类均都包含了创建 License 所需要的方法，于是编写了下面的 Keygen。

```kotlin
val private = KeyFactory.getInstance("RSA", BCProviderFactory.getProvider()).generatePrivate(PKCS8EncodedKeySpec(Base64.getDecoder().decode(Constants.PRIVATE_KEY)))
val sign = Signature.getInstance("SHA256withRSA", BCProviderFactory.getProvider())
            
val products = mutableMapOf<String, SignedProduct>()

while (true) {
    val product = Product()
    product.id = prompt("Enter product id(artifactory): ", "artifactory")
    product.expires = date(2099, 12, 31)
    product.isTrial = false
    product.owner = prompt("Owner(lamadaemon): ", "lamadaemon")
    product.validFrom = Date()
    product.type = Product.Type.ENTERPRISE_PLUS
    products += product.id to SignedProduct(product, private, sign) // 使用私钥对 Product 进行签名获得 SignedProduct
    if (prompt("\nDo you want add more products into this license(yes/no, default=no): ", listOf("yes", "no"), "no") == "no") {
        break
    }
}

val license = License()
license.version = 2
license.validateOnline = false
license.products = products

val sLicense = SignedLicense(license, private, sign) // 使用私钥对 License 进行签名 获得 SignedLicense

println(createFinalLicense(sLicense)) // 这里就是戳其进行序列化 + 转换 Base64，详情可见我的 Github，有完整的 Keygen 代码

```

至此，我们已经成功使用**我们自己的私钥**创建了许可证，直接丢上去用肯定是不行的，所以我们需要想办法替换掉用于验证的公钥。
由于我们已经知道公钥的位置了，而且全程都在使用这个公钥，没有第二个地方了，因此编写一个 Javaagent 替换掉公钥即可。

> 这时，悲剧发生了，我在 Keygen 里用 Kotlin 写了这个 agent，然后我 debug 了整整两天！整整两天！！
> 最终用 Java 重写了一下，代码逻辑一模一样，他就可以正常工作。
> 这也就是为什么我不建议使用 Kotlin 编写 JavaAgent，是真的会遇到莫名其妙的问题。

在这里，我使用我比较熟悉的 `javassist`

```java
package icu.lama.artifactory.agent.patches;

import javassist.CtClass;
import javassist.CtField;
import javassist.Modifier;
import javassist.NotFoundException;
import org.jetbrains.annotations.Nullable;

import java.util.Arrays;

public class PatcherLicenseParser extends ClassPatch { // 这是我的工具类，详情可以看我的 Github，有完整的代码
    public PatcherLicenseParser() {
        super("org.jfrog.license.api.LicenseParser"); // 类名不一样因为有 Rename 机制，便于反混淆，实际因该是 "org.jfrog.license.api.a"
    }                                                 // 在这里只是我人为的将其重命名为 LicenseParser 实际上他混淆前名字应该是 LicenseManager，后面会说我怎么知道的

    @Override
    byte[] onTransform(String className, CtClass clazz, byte[] classBuf) throws Throwable {

        var publicKeyFieldC = clazz.getDeclaredField("c"); // 7.9.2 using c
        publicKeyFieldC.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        var override = "c = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";

        // 关于这里为什么不用 getMethod，经过我实测似乎 getMethod 无法获取到 <clinit>
        var clinitMethod = Arrays.stream(clazz.getDeclaredBehaviors()).filter((it) -> "<clinit>".equals(it.getMethodInfo().getName())).findAny();
        if (!clinitMethod.isPresent()) {
            throw new Throwable("Corrupted class!");
        }

        clinitMethod.get().insertAfter(overrids);

        clazz.detach();
        return clazz.toBytecode();
    }
}
```

首先我先将公钥变量的 FINAL 修饰删去，这样就可以对其进行修改，然后在 `<clinit>`方法，也就是 `static {}`，的末尾加入一行覆盖公钥的代码。

> 事实上我在重写之前为了测试方案可行性，先手动用 recaf 修改了 `org.jfrog.license.api.a#a(Ljava/lang/String;)Lorg/jfrog/license/api/License` 的字节码，因为这里是唯一引用公钥的地方。

```recaf
EX_START_1:
LINE EX_START_1 75
ALOAD this
ALOAD 1
GETSTATIC org/jfrog/license/api/a.c Ljava/lang/String; // 懒狗做法：将这个修改为 LDC "我的公钥内容"
// 这时候的 Stack 应该是
// 0: this
// 1: 输入的 License
// 2: 公钥
INVOKEVIRTUAL org/jfrog/license/api/a.b(Ljava/lang/String;Ljava/lang/String;)Lorg/jfrog/license/api/License;
EX_END_1:
ARETURN
```

修复 Javaagent 问题后成功的跑了起来，破解一切都正常，刚在群里宣布完破解结果，准备在服务器上部署的时候，突然发现，我下载的竟然不是最新版！

> 我是一直从 [JFrog release-docker](https://releases-docker.jfrog.io/) 下载的本体，但这里已经一万年没有更新过了。
> 还停留在 `7.9.2`，真正的最新版已经到了 `7.59.11`

更新到 7.59.11 后果然我的破解不好使了，同样的思路，先输入错误的证书，看一下报错一模一样，再次定位到这个类，然后查看。
原来是 "c" 变成了 "d"，对 agent 稍作修改
```java
@Override byte[] onTransform(String className, CtClass clazz, byte[] classBuf) throws Throwable {
    var overrides = "";

    var publicKeyFieldC = tryGetDeclaredField(clazz, "c"); // 7.9.2 using c
    if (publicKeyFieldC != null) {
        publicKeyFieldC.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        overrides += "c = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";
    }

    var publicKeyFieldD = tryGetDeclaredField(clazz, "d"); // 7.59 changed to d
    if (publicKeyFieldD != null) {
        publicKeyFieldD.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        overrides += "d = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";
    }

    var clinitMethod = Arrays.stream(clazz.getDeclaredBehaviors()).filter((it) -> "<clinit>".equals(it.getMethodInfo().getName())).findAny();
    if (!clinitMethod.isPresent()) {
        throw new Throwable("Corrupted class!");
    }

    clinitMethod.get().insertAfter(overrides);
    clazz.detach();
    return clazz.toBytecode();
}

private @Nullable CtField tryGetDeclaredField(CtClass clazz, String field) {
    try {
        return clazz.getDeclaredField(field);
    } catch (NotFoundException e) {
        return null;
    }
 
}
```

直接进行测试，发现竟然还是不行，报错位置变成了 `LicenseManager`，同样的方法找到这个类，在 license-manager 这个 jar 包内，打开一看立即就给了我一些似曾相识的感觉。

```java
// 部分代码
private static final String publicKey = (new ObfuscatedString(new long[] { <省略> })).toString();

private static final String jfrogPublicKey = (new ObfuscatedString(new long[] { <省略> })).toString();

private static final String jfrogPublicKeyTest = (new ObfuscatedString(new long[] { <省略> })).toString();

private static final String publicKeyTest = (new ObfuscatedString(new long[] { <省略> })).toString();

public License loadLicense(String licenseKey) throws LicenseException {
  try {
    return loadJFrogLicense(licenseKey, jfrogPublicKey);
  } catch (LicenseException e) {
    try {
      return loadLegacyLicense(licenseKey, publicKey);
    } catch (LicenseException e1) {
      return loadTestKey(licenseKey, e1);
    } 
  } 
}
```

对比一下 artifactory-addons-manager 也就是之前注入的类的 jar 包名字

```java
private static final String b;

private static final String c;

private static final String d;

private static final String e;

static {
  b = (new org.jfrog.license.a.a(new long[] { <省略> })).toString();
  c = (new org.jfrog.license.a.a(new long[] { <省略> })).toString();
  d = (new org.jfrog.license.a.a(new long[] { <省略> })).toString();
  e = (new org.jfrog.license.a.a(new long[] { <省略> })).toString();
}

public License a(String paramString) throws LicenseException {
  try {
    return b(paramString, c);
  } catch (LicenseException licenseException) {
    try {
      return c(paramString, b);
    } catch (LicenseException licenseException1) {
      return a(paramString, licenseException1);
    } 
  } 
}
```

**不能说很像，只能说一模一样！**
**这不就是解密版本的 artifactory-addons-manage r吗？！**

无脑添加最终的破解点，又对 agent 进行小小的修正，报错消失了，当然，License也成功的被识别了，也成功的激活了 Artifactory
```java
@Override byte[] onTransform(String className, CtClass clazz, byte[] classBuf) throws Throwable {
    var overrides = "";

    var publicKeyFieldC = tryGetDeclaredField(clazz, "c"); // 7.9.2 using c
    if (publicKeyFieldC != null) {
        publicKeyFieldC.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        overrides += "c = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";
    }

    var publicKeyFieldD = tryGetDeclaredField(clazz, "d"); // 7.59 changed to d
    if (publicKeyFieldD != null) {
        publicKeyFieldD.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        overrides += "d = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";
    }

    var publicKeyFieldNObf = tryGetDeclaredField(clazz, "jfrogPublicKey"); // 7.59 in license-manager-7.63.3.jar, no obfuscation version of artifactory-addons-manager
    if (publicKeyFieldNObf != null) {
        publicKeyFieldNObf.setModifiers(Modifier.PRIVATE + Modifier.STATIC);
        overrides += "jfrogPublicKey = icu.lama.artifactory.agent.AgentMain.PUBLIC_KEY;";
    }

    var clinitMethod = Arrays.stream(clazz.getDeclaredBehaviors()).filter((it) -> "<clinit>".equals(it.getMethodInfo().getName())).findAny();
    if (!clinitMethod.isPresent()) {
        throw new Throwable("Corrupted class!");
    }
    clinitMethod.get().insertAfter(overrides);
    
    clazz.detach();
    return clazz.toBytecode();
}
```

至此，破解已经完成，后续的就是对 Keygen 和 Agent 进行功能上的完善，所有的代码已经发布在 Github 上，如果遇到新版本无法使用，请提交 Issue 或者在 [Telegram](https://t.me/lamadaemon) 上向我寻求帮助

[项目 Github: Lama3L9R/ArtifactoryKeygen 内含 Keygen 和 Agent 的完整代码](https://github.com/Lama3L9R/ArtifactoryKeygen)