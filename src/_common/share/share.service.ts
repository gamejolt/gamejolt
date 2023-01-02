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

export type ShareResource = 'post' | 'community' | 'user' | 'game' | 'fireside' | 'realm';

/**
 * Copies a link to the clipboard and tracks that it was from a share.
 */
export function copyShareLink(url: string, resource: ShareResource) {
	Clipboard.copy(url);
	trackShareLink(url, { resource });
}
