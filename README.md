# LaTeX公式复制助手

一个浏览器插件，用于一键复制AI输出的数学公式为LaTeX格式。

## 功能特点

- 自动检测页面中的数学公式
- 鼠标悬停显示复制按钮
- 一键复制LaTeX源码到剪贴板
- 支持动态加载的内容
- 适用于ChatGPT、Claude、Gemini等AI网站

## 安装方法

### Chrome/Edge浏览器

1. 下载或克隆此项目
2. 打开浏览器，进入扩展程序页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

### Firefox浏览器

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时加载附加组件"
3. 选择项目中的 `manifest.json` 文件

## 使用方法

1. 访问包含数学公式的网页（如ChatGPT、Deepseek等）
2. 将鼠标悬停在公式上
3. 点击出现的复制按钮
4. LaTeX代码已复制到剪贴板！

## 支持的格式

- KaTeX渲染的公式
- MathJax渲染的公式
- 带有`data-latex`属性的元素
- 用`$...$`或`$$...$$`包围的LaTeX代码
