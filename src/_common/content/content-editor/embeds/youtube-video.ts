import { ContextCapabilities } from '~common/content/content-context';
import { EmbedType } from '~common/content/content-editor/content-embed.service';
import { EmbedSource } from '~common/content/content-editor/embeds/embed-source';
import { ContentHydrator } from '~common/content/content-hydrator';
import { REGEX_YOUTUBE } from '~utils/regex';
import { getYoutubeVideoId } from '~utils/video';

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
