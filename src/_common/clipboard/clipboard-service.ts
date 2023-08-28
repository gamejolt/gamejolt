import { showErrorGrowl, showSuccessGrowl } from '../growls/growls.service';
import { $gettext } from '../translate/translate.service';

export class Clipboard {
	static copy(url: string, message?: string) {
		// We have to add it into view, select, copy, then remove. Yeesh.
		const rand = Math.random();
		const clipboardElem = document.createElement('input');
		clipboardElem.type = 'text';
		clipboardElem.value = url;
		clipboardElem.id = `clipboard-${rand}`;
		document.body.appendChild(clipboardElem);
		clipboardElem.select();

		const result = window.document.execCommand('copy');

		if (result) {
			showSuccessGrowl(message || $gettext('Copied to your clipboard.'), $gettext('Copied!'));
		} else {
			showErrorGrowl(
				$gettext('Could not copy to your clipboard. Dunno why. Sorry.'),
				$gettext('Copy Failed')
			);
		}

		clipboardElem.parentNode!.removeChild(clipboardElem);
	}
}
