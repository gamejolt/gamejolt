import { ContextCapabilities } from '~common/content/content-context';
import { EmbedType } from '~common/content/content-editor/content-embed.service';
import { EmbedSource } from '~common/content/content-editor/embeds/embed-source';
import { ContentHydrator } from '~common/content/content-hydrator';

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
