import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { EmbedType } from '../content-embed.service';
import { EmbedSource } from './embed-source';

export class SketchfabModelEmbed extends EmbedSource {
	getEmbedType(): EmbedType {
		return 'sketchfab-model';
	}

	getEmbedPreview() {
		return {
			name: 'Sketchfab',
			icon: 'sketchfab',
			color: '1caad9',
			link: 'https://sketchfab.com/',
		};
	}

	// URL format:
	// sketchfab.com/models/<id>
	// sketchfab.com/3d-models/description-<id>
	// sketchfab.com/3d-models/<id>
	// id is hexadec

	async getLinkSource(
		capabilities: ContextCapabilities,
		_hydrator: ContentHydrator,
		link: string
	) {
		if (!capabilities.embedModel) {
			return false;
		}

		const matches = this.isValidLink(link);
		if (matches !== false) {
			const modelId = matches[1];
			if (modelId.length === 32) {
				return modelId;
			}
		}

		return false;
	}

	isValidLink(link: string) {
		const results = /sketchfab.com\/(?:3d-)?models\/(?:[a-z0-9]+-)*([a-f0-9]{32})/i.exec(link);
		if (results !== null && results.length === 2) {
			return results;
		}
		return false;
	}
}
