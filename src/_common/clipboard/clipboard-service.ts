import { Growls } from '../growls/growls.service';
import { Translate } from '../translate/translate.service';

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
			Growls.success(
				message || Translate.$gettext('Copied to your clipboard.'),
				Translate.$gettext('Copied!')
			);
		} else {
			Growls.error(
				Translate.$gettext('Could not copy to your clipboard. Dunno why. Sorry.'),
				Translate.$gettext('Copy Failed')
			);
		}

		clipboardElem.parentNode!.removeChild(clipboardElem);
	}
}
