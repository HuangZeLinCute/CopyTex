// LaTeX公式复制助手 - 悬浮层版本
(function() {
  'use strict';

  let floatingButton = null;
  let currentFormula = null;

  // 从不同格式提取LaTeX
  function extractLatex(element) {
    console.log('提取LaTeX，元素:', element);
    
    // 1. MathJax格式 - 查找script标签
    const mathJaxScript = element.querySelector('script[type*="math/tex"]');
    if (mathJaxScript) {
      console.log('找到MathJax script:', mathJaxScript.textContent);
      return mathJaxScript.textContent.trim();
    }

    // 2. KaTeX格式 - 查找annotation标签
    const katexAnnotation = element.querySelector('annotation[encoding="application/x-tex"]');
    if (katexAnnotation) {
      console.log('找到KaTeX annotation:', katexAnnotation.textContent);
      return katexAnnotation.textContent.trim();
    }

    // 3. 检查常见的LaTeX属性
    const latexAttrs = ['data-latex', 'data-tex', 'title'];
    for (const attr of latexAttrs) {
      if (element.hasAttribute(attr)) {
        const value = element.getAttribute(attr);
        if (value && value.includes('\\')) {
          console.log('找到属性LaTeX:', attr, value);
          return value.trim();
        }
      }
    }

    // 4. 检查aria-label（可能包含LaTeX）
    if (element.hasAttribute('aria-label')) {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes('\\')) {
        console.log('找到aria-label LaTeX:', ariaLabel);
        return ariaLabel.trim();
      }
    }

    // 5. 查找所有script标签（可能在子元素中）
    const allScripts = element.querySelectorAll('script');
    for (const script of allScripts) {
      if (script.type && script.type.includes('math')) {
        console.log('找到数学script:', script.textContent);
        return script.textContent.trim();
      }
    }

    // 6. 纯文本LaTeX（以$或$$包围）
    const text = element.textContent.trim();
    if (text.startsWith('$$') && text.endsWith('$$')) {
      console.log('找到$$包围的LaTeX:', text);
      return text.slice(2, -2).trim();
    }
    if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
      console.log('找到$包围的LaTeX:', text);
      return text.slice(1, -1).trim();
    }

    // 7. 如果都没找到，返回纯文本（可能需要用户手动处理）
    console.log('未找到LaTeX，返回纯文本:', text);
    return text;
  }

  // 创建悬浮复制按钮
  function createFloatingButton() {
    if (floatingButton) return floatingButton;

    const button = document.createElement('button');
    button.className = 'latex-floating-copy-btn';
    button.innerHTML = '复制';
    button.title = '复制LaTeX代码';
    button.style.cssText = `
      position: fixed !important;
      padding: 6px 14px !important;
      background: rgba(0, 0, 0, 0.75) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 20px !important;
      cursor: pointer !important;
      font-size: 11px !important;
      font-weight: 500 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      z-index: 10000 !important;
      display: none !important;
      pointer-events: auto !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
      backdrop-filter: blur(8px) !important;
      transition: all 0.2s ease !important;
    `;
    
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!currentFormula) return;
      
      const latex = extractLatex(currentFormula);
      
      try {
        await navigator.clipboard.writeText(latex);
        button.innerHTML = '已复制';
        button.style.background = 'rgba(76, 175, 80, 0.8)';
        
        setTimeout(() => {
          button.innerHTML = '复制';
          button.style.background = 'rgba(0, 0, 0, 0.75)';
        }, 1500);
      } catch (err) {
        console.error('复制失败:', err);
        button.innerHTML = '失败';
        button.style.background = 'rgba(244, 67, 54, 0.8)';
        setTimeout(() => {
          button.innerHTML = '复制';
          button.style.background = 'rgba(0, 0, 0, 0.75)';
        }, 1500);
      }
    });
    
    document.body.appendChild(button);
    floatingButton = button;
    return button;
  }

  // 显示悬浮按钮
  function showFloatingButton(formula, event) {
    const button = createFloatingButton();
    currentFormula = formula;
    
    const rect = formula.getBoundingClientRect();
    button.style.left = (rect.right - 30) + 'px';
    button.style.top = (rect.top + 2) + 'px';
    button.style.display = 'block';
  }

  // 隐藏悬浮按钮
  function hideFloatingButton() {
    if (floatingButton) {
      floatingButton.style.display = 'none';
    }
    currentFormula = null;
  }

  // 检查元素是否为数学公式
  function isMathFormula(element) {
    const mathClasses = ['katex', 'katex-display', 'MathJax', 'MathJax_Display'];
    const mathTags = ['math'];
    
    // 检查类名
    if (mathClasses.some(cls => element.classList.contains(cls))) {
      return true;
    }
    
    // 检查标签名
    if (mathTags.includes(element.tagName.toLowerCase())) {
      return true;
    }
    
    // 检查属性
    if (element.hasAttribute('data-latex') || 
        element.className.includes('math') || 
        element.className.includes('equation')) {
      return true;
    }
    
    return false;
  }

  // 找到最外层的数学公式元素
  function findOutermostMathElement(element) {
    let current = element;
    let outermost = null;
    let depth = 0;
    
    // 向上查找，找到所有的数学公式元素，返回最外层的
    while (current && depth < 10) {
      if (isMathFormula(current)) {
        outermost = current;
      }
      current = current.parentElement;
      depth++;
    }
    
    return outermost;
  }

  // 添加事件监听
  function addEventListeners() {
    let lastMathElement = null;

    document.addEventListener('mouseover', (e) => {
      const element = e.target;
      
      // 找到最外层的数学公式元素
      const mathElement = findOutermostMathElement(element);
      
      if (mathElement && mathElement !== lastMathElement) {
        lastMathElement = mathElement;
        showFloatingButton(mathElement, e);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const element = e.target;
      const relatedTarget = e.relatedTarget;
      
      // 如果鼠标移出公式区域且不是移到按钮上，则隐藏按钮
      if (floatingButton && !floatingButton.contains(relatedTarget)) {
        const currentMathElement = findOutermostMathElement(element);
        const relatedMathElement = relatedTarget ? findOutermostMathElement(relatedTarget) : null;
        
        // 如果移出了当前公式且没有进入另一个公式
        if (currentMathElement && currentMathElement !== relatedMathElement) {
          setTimeout(() => {
            // 再次检查鼠标是否在按钮上
            if (floatingButton && !floatingButton.matches(':hover')) {
              hideFloatingButton();
              lastMathElement = null;
            }
          }, 100);
        }
      }
    });

    // 点击其他地方时隐藏按钮
    document.addEventListener('click', (e) => {
      if (floatingButton && !floatingButton.contains(e.target)) {
        hideFloatingButton();
        lastMathElement = null;
      }
    });
  }

  // 初始化
  function init() {
    addEventListeners();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
