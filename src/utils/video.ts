import { REGEX_YOUTUBE } from '~utils/regex';

export function getYoutubeVideoId(path: string) {
	const groupArray = REGEX_YOUTUBE.exec(path);

	if (groupArray) {
		return groupArray[groupArray.length - 1];
	}

	return null;
}
