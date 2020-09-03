import { REGEX_YOUTUBE } from '../../../../utils/regex';
import { getYoutubeVideoId } from '../../../../utils/video';
import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { EmbedType } from '../content-embed.service';
import { EmbedSource } from './embed-source';

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
		if (!capabilities.embedVideo || !this.isValidLink(link)) {
			return false;
		}

		return getYoutubeVideoId(link) || false;
	}

	isValidLink(link: string) {
		return REGEX_YOUTUBE.test(link);
	}
}
