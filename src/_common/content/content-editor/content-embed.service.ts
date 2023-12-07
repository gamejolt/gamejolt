import { ContentOwnerController } from '../content-owner';
import { EmbedSource } from './embeds/embed-source';
import { SketchfabModelEmbed } from './embeds/sketchfab-model';
import { SoundcloudSongEmbed } from './embeds/soundcloud-song';
import { YouTubeVideoEmbed } from './embeds/youtube-video';

export type EmbedType = 'youtube-video' | 'soundcloud-song' | 'sketchfab-model';

export type PreviewEmbed = {
	name: string;
	icon: string;
	color: string;
	link: string;
};

type EmbedData = {
	type: EmbedType;
	source: string;
};

class ContentEmbedServiceImpl {
	private _sources: EmbedSource[] | undefined = undefined;

	private get sources() {
		if (this._sources === undefined) {
			this._sources = [
				new YouTubeVideoEmbed(),
				new SoundcloudSongEmbed(),
				new SketchfabModelEmbed(),
			];
		}
		return this._sources;
	}

	public get previewSources() {
		const previews = [] as PreviewEmbed[];
		for (const source of this.sources) {
			const preview = source.getEmbedPreview();
			if (previews.every(i => i.name !== preview.name)) {
				previews.push(preview);
			}
		}
		return previews;
	}

	public async getEmbedData(
		owner: ContentOwnerController,
		input: string
	): Promise<EmbedData | undefined> {
		input = input.trim();
		const lines = input.split(/\r?\n/);

		// Figure out what kind of link/embed has been pasted
		// Go through all lines of pasted content individually
		// This also has to take capabilities into account

		const capabilities = owner.capabilities;
		const hydrator = owner.hydrator;
		for (const line of lines) {
			for (const source of this.sources) {
				const linkSource = await source.getLinkSource(capabilities, hydrator, line);
				if (linkSource !== false) {
					return { type: source.getEmbedType(), source: linkSource };
				}
			}
		}
	}
}

export const ContentEmbedService = /** @__PURE__ */ new ContentEmbedServiceImpl();
