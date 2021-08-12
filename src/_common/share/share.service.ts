import { trackShareLink } from '../analytics/analytics.service';
import { Clipboard } from '../clipboard/clipboard-service';
import { Community } from '../community/community.model';
import { Fireside } from '../fireside/fireside.model';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

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
export function copyShareLink(url: string, model: Model) {
	Clipboard.copy(url);
	trackShareLink(url, { model });
}

export function getShareResourceForModel(model: Model) {
	if (model instanceof FiresidePost) {
		return 'post';
	} else if (model instanceof Community) {
		return 'community';
	} else if (model instanceof User) {
		return 'user';
	} else if (model instanceof Game) {
		return 'game';
	} else if (model instanceof Fireside) {
		return 'fireside';
	}
}
