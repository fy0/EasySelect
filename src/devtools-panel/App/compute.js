import { jsQuote, pyQuote } from './utils'

export function computeCssSelector (expr, layerLimit = 1e50) {
  let layer = 0
  let solve = (expr) => {
    let sel = {
      base: `${expr.tag}`,
      class: '',
      attrs: '',
      nthChild: '',
      index: null
    }

    // 将 class 填入
    for (let i of expr.classes) {
      sel.class += `.${i}`
    }

    // 将属性填入
    for (const [k, v] of expr.attrs) {
      if (k === 'id' && (!/\s/g.test(v))) {
        sel.base += `#${v}`
      } else {
        // 此处当一个字符串中存在'"`三个字符的时候会出问题
        sel.attrs += `[${k}=${jsQuote(CSS.escape(v))}]`
      }
      // ext += `[${k}]`
    }

    if (expr.useNthChild && expr.parentNodesLength >= 1) {
      // 这个需要算到上一级去
      sel.nthChild = `:nth-child(${expr.parentNodesIndex + 1})`
    }

    layer += 1
    let ret = `${sel.base}${sel.class}${sel.attrs}${sel.nthChild}`
    if ((layer <= layerLimit) && expr.parent) {
      ret = solve(expr.parent) + ' > ' + ret
    }
    return ret
  }

  let selector = solve(expr)
  let jselector = JSON.stringify(selector)
  let jsConsoleExpr = 'document.querySelectorAll(' + jselector + ')'
  let pyLxmlExpr = `page.cssselect(${jselector})`
  let jsPuppeteerExpr = ''

  return {
    selector,
    jsConsoleExpr,
    pyLxmlExpr,
    jsPuppeteerExpr
  }
}

export function computeXpath (expr, layerLimit = 1e50) {
  let index = 0
  let solve = (expr) => {
    let base = `${expr.tag}`

    for (let i of expr.classes) {
      base += `[contains(@class, ${jsQuote(i)})]`
    }
    for (let i of expr.attrs) {
      // 暂不支持又有单引号又有双引号的xpath生成
      if ((i[1].indexOf('"') !== -1) && (i[1].indexOf("'") !== -1)) {
        continue
      }
      base += `[contains(@${i[0]}, ${jsQuote(i[1])})]`
    }
    index += 1
    if ((index <= layerLimit) && expr.parent) {
      base = solve(expr.parent) + '/' + base
    }
    return base
  }

  // let cmd = `document.evaluate(\`count(${this.resultXPath})\`, document, null, XPathResult.ANY_TYPE, null).numberValue`
  // let ret = await browser.devtools.inspectedWindow.eval('$x(`' + this.xpath + '`).length')

  let selector = '//' + solve(expr)
  let jselector = JSON.stringify(selector)
  let jsConsoleExpr = `(function () {
    let r = document.evaluate(\`${selector}\`, document, null, XPathResult.ANY_TYPE, null);
    let lst = [];
    let el = null;
    while (el = r.iterateNext()) {
      lst.push(el);
    }
    return lst;
  })()`
  // return '$x(`' + this.resultXPath + '`)'
  let pyLxmlExpr = `page.xpath(${jselector})`
  // return `page.xpath(${pyQuote(this.resultXPath)})`
  let jsPuppeteerExpr = ''

  return {
    selector,
    jsConsoleExpr,
    pyLxmlExpr,
    jsPuppeteerExpr
  }
}
