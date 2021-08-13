import { trackShareLink } from '../analytics/analytics.service';
import { Clipboard } from '../clipboard/clipboard-service';

export type ShareProvider =
	| 'facebook'
	| 'twitter'
	| 'email'
	| 'sms'
	| 'fb_messenger'
	| 'whatsapp'
	| 'reddit';

/**
 * Copies a link to the clipboard and tracks that it was from a share.
 */
export function copyShareLink(url: string) {
	Clipboard.copy(url);
	trackShareLink(url);
}
