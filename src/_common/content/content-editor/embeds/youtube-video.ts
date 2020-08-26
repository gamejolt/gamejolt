import { REGEX_YOUTUBE } from '../../../../utils/regex';
import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { EmbedType } from '../content-embed.service';
import { EmbedSource } from './embed-source';

function getYoutubeVideoId(path: string) {
	const groupArray = REGEX_YOUTUBE.exec(path);

	if (groupArray) {
		return groupArray[groupArray.length - 1];
	}

	return null;
}

export class YouTubeVideoEmbed extends EmbedSource {
	getEmbedType(): EmbedType {
		return 'youtube-video';
	}

	getEmbedPreview() {
		return {
			name: 'YouTube',
			icon: 'youtube',
			color: 'cc0000',
			link: 'https://www.youtube.com/',
		};
	}

	// Support:
	// youtube.com/watch?v=id
	// m.youtube.com/watch?v=id
	// youtu.be/id

	async getLinkSource(
		capabilities: ContextCapabilities,
		_hydrator: ContentHydrator,
		link: string
	) {
		if (!capabilities.embedVideo) {
			return false;
		}

		return this.isValidLink(link);
	}

	isValidLink(link: string) {
		const results = getYoutubeVideoId(link) || false;

		if (results && results.length === 11) {
			return results;
		}

		return false;
	}
}
