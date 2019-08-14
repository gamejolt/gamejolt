import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { EmbedType } from '../content-embed.service';
import { EmbedSource } from './embed-source';

export class SoundcloudSongEmbed extends EmbedSource {
	getEmbedType(): EmbedType {
		return 'soundcloud-song';
	}

	getEmbedPreview() {
		return {
			name: 'SoundCloud',
			icon: 'soundcloud',
			color: 'fd5200',
			link: 'https://soundcloud.com/',
		};
	}

	async getLinkSource(
		capabilities: ContextCapabilities,
		hydrator: ContentHydrator,
		link: string
	): Promise<string | false> {
		if (!capabilities.embedMusic) {
			return false;
		}

		const matches = this.isValidLink(link);
		if (matches !== false) {
			const trackUrlPart = matches[1];
			const trackUrl = 'https://soundcloud.com/' + trackUrlPart;
			const data = await hydrator.getData('soundcloud-track-url', trackUrl);
			if (data !== null) {
				return data.toString();
			}
		}

		return false;
	}

	isValidLink(link: string) {
		const results = /soundcloud.com\/(.+?\/.+)/i.exec(link);
		if (results !== null && results.length === 2) {
			return results;
		}
		return false;
	}
}
