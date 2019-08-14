export function isChildElement(root: HTMLElement, e: HTMLElement): boolean {
	do {
		if (e === root) {
			return true;
		}
		if (e.parentElement !== null) {
			e = e.parentElement;
		}
	} while (e.parentElement !== null);
	return false;
}
