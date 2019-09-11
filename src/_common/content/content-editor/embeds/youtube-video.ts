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
	// youtube.com/watch -> v=id
	// m.youtube.com/watch -> v=id

	async getLinkSource(
		capabilities: ContextCapabilities,
		_hydrator: ContentHydrator,
		link: string
	) {
		if (!capabilities.embedVideo) {
			return false;
		}

		const url = this.isValidLink(link);
		if (url !== false && /(.+\.)?youtube\.com/i.test(url.hostname)) {
			const videoId = url.searchParams.get('v');
			if (videoId !== null && videoId.length === 11) {
				return videoId;
			}
		}

		return false;
	}

	isValidLink(link: string) {
		try {
			return new URL(link);
		} catch (error) {
			// Swallow error. new Url throws on invalid URLs, which can very well happen.
			return false;
		}
	}
}
