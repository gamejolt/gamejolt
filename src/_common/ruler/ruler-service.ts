// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
const DISPLAY_SWAP_REGEX = /^(none|table(?!-c[ea]).+)/;
const CSS_SHOW_STYLES: any = {
	position: 'absolute',
	visibility: 'hidden',
	display: 'block',
};

function getStyle(el: HTMLElement, prop: keyof CSSStyleDeclaration) {
	// IE
	if ((el as any).currentStyle) {
		return (el as any).currentStyle[prop];
	} else if (window.getComputedStyle) {
		return window.getComputedStyle(el)[prop];
	}

	// Finally try and get inline style.
	return el.style[prop];
}

function isStaticPositioned(el: HTMLElement) {
	return (getStyle(el, 'position') || 'static') === 'static';
}

function elementParentOffset(el: HTMLElement) {
	let offsetParent = (el.offsetParent as HTMLElement) || document;
	while (offsetParent && offsetParent !== (document as any) && isStaticPositioned(offsetParent)) {
		offsetParent = offsetParent.offsetParent as HTMLElement;
	}

	return offsetParent || document;
}

class RulerService {
	width(elem: HTMLElement | Document) {
		return this.dimensions('clientWidth', elem);
	}

	height(elem: HTMLElement | Document) {
		return this.dimensions('clientHeight', elem);
	}

	outerWidth(elem: HTMLElement | Document) {
		return this.dimensions('offsetWidth', elem);
	}

	outerHeight(elem: HTMLElement | Document) {
		return this.dimensions('offsetHeight', elem);
	}

	position(el: HTMLElement) {
		const elOffset = this.offset(el);
		let parentRect = { top: 0, left: 0 };
		const offsetParentEl = elementParentOffset(el);
		if (offsetParentEl !== (document as any)) {
			parentRect = this.offset(offsetParentEl);
			parentRect.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
			parentRect.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
		}

		const boundingClientRect = el.getBoundingClientRect();
		return {
			width: boundingClientRect.width || el.offsetWidth,
			height: boundingClientRect.height || el.offsetHeight,
			top: elOffset.top - parentRect.top,
			left: elOffset.left - parentRect.left,
		};
	}

	offset(el: HTMLElement) {
		const rect = el.getBoundingClientRect();
		return {
			width: rect.width || el.offsetWidth,
			height: rect.height || el.offsetHeight,
			top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
			left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
		};
	}

	private dimensions(
		baseProp: 'clientWidth' | 'clientHeight' | 'offsetWidth' | 'offsetHeight',
		_elem: HTMLElement | Document
	): number {
		let elem: HTMLElement;

		if (_elem === window.document) {
			elem = window.document.body;
		} else {
			elem = <HTMLElement>_elem;
		}

		const styles = window.getComputedStyle(elem);

		// Certain elements can have dimension info if we invisibly show them,
		// but it must have a current display style that would benefit.
		// This only matters for currently hidden elements that wouldn't return dimensions.
		let swappedStyles = false;
		const oldStyles: any = {};
		if (DISPLAY_SWAP_REGEX.test(styles.display || '') && elem.offsetWidth === 0) {
			swappedStyles = true;

			for (const name in CSS_SHOW_STYLES) {
				oldStyles[name] = (elem.style as any)[name];
				(elem.style as any)[name] = CSS_SHOW_STYLES[name];
			}
		}

		let val = elem[baseProp];
		if (baseProp === 'clientWidth') {
			val -= parseFloat(styles.paddingLeft || '') + parseFloat(styles.paddingRight || '');
		} else if (baseProp === 'clientHeight') {
			val -= parseFloat(styles.paddingTop || '') + parseFloat(styles.paddingBottom || '');
		} else if (baseProp === 'offsetWidth') {
			val += parseFloat(styles.marginLeft || '') + parseFloat(styles.marginRight || '');
		} else if (baseProp === 'offsetHeight') {
			val += parseFloat(styles.marginTop || '') + parseFloat(styles.marginBottom || '');
		}

		if (swappedStyles) {
			for (const name in CSS_SHOW_STYLES) {
				(elem.style as any)[name] = oldStyles[name];
			}
		}

		return val;
	}
}

export const Ruler = /** @__PURE__ */ new RulerService();
