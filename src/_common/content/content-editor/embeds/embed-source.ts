import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { EmbedType, PreviewEmbed } from '../content-embed.service';

export abstract class EmbedSource {
	abstract getEmbedType(): EmbedType;
	abstract getEmbedPreview(): PreviewEmbed;

	/**
	 * Returns the source from a link.
	 * example: returns the YouTube video id from a YouTube video link.
	 * Returns `false` if the link does not match the source or is invalid.
	 */
	abstract async getLinkSource(
		capabilities: ContextCapabilities,
		hydrator: ContentHydrator,
		link: string
	): Promise<string | false>;

	/**
	 * Returns if the incoming link is valid for this source.
	 * The returned value should be truthy and can return things like a regex array, to not perform it twice.
	 */
	protected abstract isValidLink(link: string): false | any;
}
