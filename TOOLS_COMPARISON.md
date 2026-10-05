# DevKits 工具箱功能对照

本轮范围：补齐六个常用开发工具。参考上游公开功能目录，独立接入 DevKits；不是完整复刻任何一个项目，也未复制 GPL 工具源码。

参考来源：

- [DevToys](https://github.com/DevToys-app/DevToys)：HTML 编解码、Gzip、XML、进制、Markdown 等通用开发工具方向。
- [IT-Tools](https://github.com/CorentinTh/it-tools)：Web 开发、网络和运维类工具目录。
- [OmniTools](https://github.com/iib0011/omni-tools)：文本、JSON、CSV、XML 以及图像、PDF、媒体工具方向。
- [CyberChef](https://github.com/gchq/CyberChef)：编解码、压缩和连续数据处理的配方思路。

## 已落地

| 方向 | DevKits 实现 | 边界 |
| --- | --- | --- |
| XML | 格式化、压缩、语法检查 | 不支持 DTD/XSD；保留混合文本、CDATA |
| HTML 实体 | 完整命名实体与数字实体编解码 | 结果作为文本显示 |
| 进制 | 2–36 进制的大整数互转 | 最多 4096 位；不解释浮点数与补码 |
| Gzip | UTF-8 与 Gzip Base64 互转 | 各 16 MiB 限额；需要原生压缩流；取消与卸载清理 |
| JSON 对比 | 字段结构差异、JSON Pointer 路径 | 对象键顺序忽略，数组按下标；拒绝不安全整数 |
| Markdown | GFM 预览、净化 HTML 源码与复制 | 外部图片和链接导航关闭；无代码语法高亮 |

第一批已经提供文本批处理、JSONPath、Properties/YAML 与 Java 堆栈分析；已有工具继续覆盖 JSON、SQL、YAML/JSON、CSV/JSON、URL、Base64、JWT、二维码、哈希和加解密等需求。

## 后续候选（尚未实现）

- 通用开发：Lorem Ipsum、文本统计、颜色转换、JSON Schema、字符串转义、文件校验和。
- 网络运维：CIDR、IPv4/IPv6 转换、URL 结构解析、cURL 请求生成、证书解析。
- 图像：尺寸转换、压缩、格式转换、色盲模拟。
- 文档与媒体：PDF 合并拆分、图片转 PDF、音视频处理。
- 连续操作：保存并重复执行编解码/过滤/格式转换配方。

这些功能需要按实际需求选择；尤其图像、PDF 与媒体处理应按工具懒加载依赖，并考虑峰值内存和文件生命周期。

## 实现与验证

复用工具注册、`React.lazy`、分栏、复制、草稿保存和双语界面。工具由按钮触发处理，结果不额外持久化。

新增依赖来自 [he](https://github.com/mathiasbynens/he)、[marked](https://github.com/markedjs/marked)、[DOMPurify](https://github.com/cure53/DOMPurify)，分发时需保留对应许可和版权声明。

已补充逻辑回归用例，涵盖 XML 混合内容、实体 Unicode、进制大整数、JSON 键顺序和空值、Markdown 脚本与网络资源过滤、Gzip 标准互通、取消和输出限额。按工作区构建纪律，本轮仅做静态检查，未运行构建或测试，未测量运行时内存。
