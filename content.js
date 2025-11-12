// LaTeX公式复制助手 - 悬浮层版本
(function() {
  'use strict';

  let floatingButton = null;
  let currentFormula = null;

  function extractLatex(element) {
    console.log('提取LaTeX，元素:', element);
    const mathJaxScript = element.querySelector('script[type*="math/tex"]');
    if (mathJaxScript) return mathJaxScript.textContent.trim();

    const katexAnnotation = element.querySelector('annotation[encoding="application/x-tex"]');
    if (katexAnnotation) return katexAnnotation.textContent.trim();

    const latexAttrs = ['data-latex', 'data-tex', 'title'];
    for (const attr of latexAttrs) {
      if (element.hasAttribute && element.hasAttribute(attr)) {
        const value = element.getAttribute(attr);
        if (value && value.includes('\\')) return value.trim();
      }
    }

    if (element.hasAttribute && element.hasAttribute('aria-label')) {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes('\\')) return ariaLabel.trim();
    }

    const allScripts = element.querySelectorAll('script');
    for (const script of allScripts) {
      if (script.type && script.type.includes('math')) {
        return script.textContent.trim();
      }
    }

    const text = element.textContent.trim();
    if (text.startsWith('$$') && text.endsWith('$$')) return text.slice(2, -2).trim();
    if (text.startsWith('$') && text.endsWith('$') && text.length > 2) return text.slice(1, -1).trim();

    const convertedLatex = convertTextToLatex(text);
    if (convertedLatex !== text) return convertedLatex;

    return text;
  }

  function convertTextToLatex(text) {
    let latex = text;
    const conversions = [
      [/θ/g, '\\theta'], [/π/g, '\\pi'], [/α/g, '\\alpha'], [/β/g, '\\beta'], [/γ/g, '\\gamma'],
      [/δ/g, '\\delta'], [/ε/g, '\\varepsilon'], [/λ/g, '\\lambda'], [/μ/g, '\\mu'], [/σ/g, '\\sigma'],
      [/φ/g, '\\varphi'], [/ω/g, '\\omega'],
      [/∞/g, '\\infty'], [/∑/g, '\\sum'], [/∫/g, '\\int'], [/√/g, '\\sqrt'], [/±/g, '\\pm'],
      [/×/g, '\\times'], [/÷/g, '\\div'], [/≤/g, '\\leq'], [/≥/g, '\\geq'], [/≠/g, '\\neq'], [/≈/g, '\\approx'],
      [/(\w+)²/g, '$1^2'], [/(\w+)³/g, '$1^3'], [/e\^(\w+)/g, 'e^{$1}'], [/(\w+)\^(\w+)/g, '$1^{$2}'],
      [/ei\\pi/g, 'e^{i\\pi}'], [/ei\\theta/g, 'e^{i\\theta}'],
      [/e\s*i\s*\\pi/g, 'e^{i\\pi}'], [/e\s*i\s*\\theta/g, 'e^{i\\theta}'],
    ];
    for (const [pattern, replacement] of conversions) {
      latex = latex.replace(pattern, replacement);
    }
    return fixExponentNotation(latex);
  }

  function fixExponentNotation(latex) {
    latex = latex.replace(/\bei([a-zA-Z\\]+)/g, 'e^{i$1}');
    latex = latex.replace(/\be([a-zA-Z\\]+)(?![a-zA-Z])/g, (match, exp) => {
      if (exp.length > 1 || exp.includes('\\')) return `e^{${exp}}`;
      return match;
    });
    return latex;
  }

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

  function showFloatingButton(formula) {
    const button = createFloatingButton();
    currentFormula = formula;
    const rect = formula.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    let left = rect.right + scrollLeft + 5;
    let top = rect.top + scrollTop - 2;
    const buttonWidth = 50;
    if (left + buttonWidth > window.innerWidth + scrollLeft) {
      left = rect.left + scrollLeft - buttonWidth - 5;
    }
    if (top < scrollTop) {
      top = rect.bottom + scrollTop + 2;
    }
    button.style.left = left + 'px';
    button.style.top = top + 'px';
    button.style.display = 'block';
  }

  function hideFloatingButton() {
    if (floatingButton) floatingButton.style.display = 'none';
    currentFormula = null;
  }

  // 修复：更健壮的数学公式识别
  function isMathFormula(element) {
    // 只处理元素节点
    if (!element || element.nodeType !== 1) return false;

    // 可能的类名集合
    const mathClasses = ['katex', 'katex-display', 'MathJax', 'MathJax_Display', 'math-container'];

    // 优先使用 classList
    if (element.classList && element.classList.length) {
      for (const cls of mathClasses) {
        if (element.classList.contains(cls)) return true;
      }
    }

    // 归一化 className（处理 SVGAnimatedString）
    let rawClassName = '';
    if (typeof element.className === 'string') {
      rawClassName = element.className;
    } else if (element.className && typeof element.className.baseVal === 'string') {
      rawClassName = element.className.baseVal; // SVG
    }

    if (rawClassName) {
      // 直接匹配关键模式
      if (/(^|\s)(katex|katex-display|MathJax|MathJax_Display|math-container)(\s|$)/.test(rawClassName)) {
        return true;
      }
      if (/\b(math-|equation|formula)\b/.test(rawClassName)) {
        return true;
      }
    }

    // 标签名
    if (element.tagName && typeof element.tagName === 'string') {
      if (element.tagName.toLowerCase() === 'math') return true;
    }

    // 属性
    if (element.hasAttribute && (element.hasAttribute('data-latex') || element.hasAttribute('data-tex'))) {
      return true;
    }

    return false;
  }

  function findOutermostMathElement(element) {
    if (!element || element.nodeType !== 1) return null;
    let current = element;
    let outermost = null;
    let depth = 0;
    while (current && depth < 20) { // 增加一点深度限制
      if (isMathFormula(current)) outermost = current;
      current = current.parentElement;
      depth++;
    }
    return outermost;
  }

  function addEventListeners() {
    let lastMathElement = null;
    document.addEventListener('mouseover', (e) => {
      const element = e.target;
      const mathElement = findOutermostMathElement(element);
      if (mathElement && mathElement !== lastMathElement) {
        lastMathElement = mathElement;
        showFloatingButton(mathElement);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const element = e.target;
      const relatedTarget = e.relatedTarget;
      if (floatingButton && !floatingButton.contains(relatedTarget)) {
        const currentMathElement = findOutermostMathElement(element);
        const relatedMathElement = relatedTarget ? findOutermostMathElement(relatedTarget) : null;
        if (currentMathElement && currentMathElement !== relatedMathElement) {
          setTimeout(() => {
            if (floatingButton && !floatingButton.matches(':hover')) {
              hideFloatingButton();
              lastMathElement = null;
            }
          }, 100);
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (floatingButton && !floatingButton.contains(e.target)) {
        hideFloatingButton();
        lastMathElement = null;
      }
    });
  }

  function init() {
    addEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
