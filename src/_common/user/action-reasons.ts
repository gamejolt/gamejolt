import { Translate } from '../translate/translate.service';

export const REASON_SPAM = 'spam';
export const REASON_OFF_TOPIC = 'off-topic';
export const REASON_ABUSE = 'abuse';
export const REASON_OTHER = 'other';

/**
 * Reason object (`value => display`) of reasons to block a user from a community.
 */
export function getCommunityBlockReasons() {
	return getReasons([REASON_SPAM, REASON_OFF_TOPIC, REASON_ABUSE, REASON_OTHER]);
}

/**
 * Reason object (`value => display`) of reasons to move a post to a different community channel.
 */
export function getCommunityMovePostReasons() {
	return getReasons([REASON_SPAM, REASON_OFF_TOPIC, REASON_OTHER]);
}

/**
 * Generates an object map of reason identifier strings to their translated display strings.
 */
function getReasons(reasons: string[]) {
	const reasonsMap = {} as { [reason: string]: string };

	for (const reason of reasons) {
		let reasonText = null;
		switch (reason) {
			case REASON_SPAM:
				reasonText = Translate.$gettext(`Spam`);
				break;
			case REASON_OFF_TOPIC:
				reasonText = Translate.$gettext(`Off Topic`);
				break;
			case REASON_ABUSE:
				reasonText = Translate.$gettext(`Offensive or insulting`);
				break;
			case REASON_OTHER:
				reasonText = Translate.$gettext(`Other`);
				break;
		}

		if (reasonText === null) {
			reasonText = reason;
		}
		reasonsMap[reason] = reasonText;
	}

	return reasonsMap;
}
