import { $gettext } from '../translate/translate.service';

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
 * Reason object (`value => display`) of reasons to eject a post from a community.
 */
export function getCommunityEjectPostReasons() {
	return getReasons([REASON_SPAM, REASON_OFF_TOPIC, REASON_ABUSE, REASON_OTHER]);
}

/**
 * Reason object (`value => display`) of reasons to move a post to a different community channel.
 */
export function getCommunityMovePostReasons() {
	return getReasons([REASON_SPAM, REASON_OFF_TOPIC, REASON_OTHER]);
}

/**
 * Gets the translatable display text for a predefined reason, or returns the input
 * custom reason when none of the predefined ones match.
 */
export function getSingleReasonText(reason: string) {
	return getReasons([reason])[reason];
}

/**
 * Generates an object map of reason identifier strings to their translated display strings.
 */
function getReasons(reasons: string[]) {
	const reasonsMap = {} as { [reason: string]: string };

	for (const reason of reasons) {
		let reasonText = null;
		const reasonTest = reason.toLowerCase().replace('_', '-').replace(' ', '-');
		switch (reasonTest) {
			case REASON_SPAM:
				reasonText = $gettext(`Spam`);
				break;
			case REASON_OFF_TOPIC:
				reasonText = $gettext(`Off Topic`);
				break;
			case REASON_ABUSE:
				reasonText = $gettext(`Offensive or insulting`);
				break;
			case REASON_OTHER:
				reasonText = $gettext(`Other`);
				break;
		}

		if (reasonText === null) {
			reasonText = reason;
		}
		reasonsMap[reason] = reasonText;
	}

	return reasonsMap;
}
