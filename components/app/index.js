import 'dom4'
import 'svgxuse'
import domready from 'domready'
import {Tree, Branch, Leaf} from '../tree'

domready(() => {
  let tree = new Tree({element: document.querySelector('[data-component=tree]')})
})
