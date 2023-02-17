import { arrayRemove, stringSort } from '../../utils/array';
import { MediaItem } from '../media-item/media-item-model';

export const GJ_FORMAT_VERSION = '1';

export type ContentContext =
	| 'fireside-post-lead'
	| 'fireside-post-article'
	| 'fireside-post-comment'
	| 'game-description'
	| 'game-comment'
	| 'user-comment'
	| 'user-bio'
	| 'forum-post'
	| 'community-description'
	| 'community-channel-description'
	| 'chat-message'
	| 'fireside-chat-message'
	| 'chat-command'
	| 'quest-stage-description'
	| 'supporter-message'
	| 'help-page';

export enum ContextCapabilityType {
	TextBold = 'text-bold',
	TextItalic = 'text-italics',
	TextLink = 'text-link',
	TextCode = 'text-code',
	TextStrike = 'text-strike',

	CustomLink = 'custom-link',
	Emoji = 'emoji',
	Tag = 'tag',
	Mention = 'mention',

	Media = 'media',
	Gif = 'gif',

	EmbedVideo = 'embed-video',
	EmbedMusic = 'embed-music',
	EmbedModel = 'embed-model',

	CodeBlock = 'code-block',
	Blockquote = 'blockquote',
	List = 'list',
	HorizontalRule = 'hr',
	Spoiler = 'spoiler',
	Heading = 'heading',
	Sticker = 'sticker',
}

const contextCapabilityTypes = Object.entries(ContextCapabilityType);

export class ContextCapabilities {
	public capabilities: ContextCapabilityType[];

	get hasAnyBlock() {
		if (this.isPlaceholder) {
			return true;
		}

		return (
			this.hasAnyEmbed ||
			this.media ||
			this.codeBlock ||
			this.blockquote ||
			this.list ||
			this.hr ||
			this.spoiler ||
			this.sticker
		);
	}
	get hasAnyText() {
		if (this.isPlaceholder) {
			return true;
		}

		return (
			this.textBold ||
			this.textItalic ||
			(this.textLink && this.customLink) ||
			this.textCode ||
			this.textStrike
		);
	}
	get hasAnyEmbed() {
		return this.embedMusic || this.embedVideo || this.embedModel;
	}
	get textBold() {
		return this._hasCapability(ContextCapabilityType.TextBold);
	}
	get textItalic() {
		return this._hasCapability(ContextCapabilityType.TextItalic);
	}
	get textLink() {
		return this._hasCapability(ContextCapabilityType.TextLink);
	}
	get textCode() {
		return this._hasCapability(ContextCapabilityType.TextCode);
	}
	get textStrike() {
		return this._hasCapability(ContextCapabilityType.TextStrike);
	}
	get customLink() {
		return this._hasCapability(ContextCapabilityType.CustomLink);
	}
	get media() {
		// for media items, also allows uploading through the media upload component
		return this._hasCapability(ContextCapabilityType.Media);
	}
	get embedVideo() {
		return this._hasCapability(ContextCapabilityType.EmbedVideo);
	}
	get embedMusic() {
		return this._hasCapability(ContextCapabilityType.EmbedMusic);
	}
	get embedModel() {
		return this._hasCapability(ContextCapabilityType.EmbedModel);
	}
	get codeBlock() {
		return this._hasCapability(ContextCapabilityType.CodeBlock);
	}
	get blockquote() {
		return this._hasCapability(ContextCapabilityType.Blockquote);
	}
	get emoji() {
		return this._hasCapability(ContextCapabilityType.Emoji);
	}
	get list() {
		return this._hasCapability(ContextCapabilityType.List);
	}
	get hr() {
		return this._hasCapability(ContextCapabilityType.HorizontalRule);
	}
	get spoiler() {
		return this._hasCapability(ContextCapabilityType.Spoiler);
	}
	get tag() {
		return this._hasCapability(ContextCapabilityType.Tag);
	}
	get heading() {
		return this._hasCapability(ContextCapabilityType.Heading);
	}
	get mention() {
		return this._hasCapability(ContextCapabilityType.Mention);
	}
	get gif() {
		return this._hasCapability(ContextCapabilityType.Gif);
	}
	get sticker() {
		return this._hasCapability(ContextCapabilityType.Sticker);
	}

	private constructor(
		capabilities: ContextCapabilityType[],
		public readonly isPlaceholder = false
	) {
		this.capabilities = [...capabilities];
	}

	_hasCapability(capability: ContextCapabilityType) {
		if (this.isPlaceholder) {
			return true;
		}
		return this.capabilities.includes(capability);
	}

	removeCapability(capability: ContextCapabilityType) {
		arrayRemove(this.capabilities, i => i === capability);
	}

	toStringList() {
		return [...this.capabilities].sort((a, b) => stringSort(b, a));
	}

	/**
	 * Returns capabilities that allow everything.
	 *
	 * Content editors should check the
	 * {@link ContextCapabilities.isPlaceholder} field and build themselves in a
	 * readonly state.
	 */
	public static getPlaceholder() {
		return new ContextCapabilities([], true);
	}

	/**
	 * Expects a array of strings. Returns empty capabilities if the provided
	 * data is invalid.
	 */
	public static fromPayloadList(data: any) {
		if (!Array.isArray(data)) {
			return new ContextCapabilities([]);
		}

		const capabilities: ContextCapabilityType[] = [];
		for (const item of data) {
			const validItemData = contextCapabilityTypes.find(
				([value, name]) => item === value || item === name
			);

			const capability = validItemData?.[1];
			if (capability) {
				capabilities.push(capability);
			}
		}
		return new ContextCapabilities(capabilities);
	}
}

export function getMediaItemTypeForContext(context: ContentContext) {
	switch (context) {
		case 'fireside-post-article':
			return MediaItem.TYPE_FIRESIDE_POST_ARTICLE_IMAGE;
		case 'game-description':
			return MediaItem.TYPE_GAME_DESCRIPTION;
		case 'fireside-post-comment':
		case 'game-comment':
		case 'user-comment':
			return MediaItem.TYPE_COMMENT;
		case 'forum-post':
			return MediaItem.TYPE_FORUM_POST;
		case 'community-description':
			return MediaItem.TYPE_COMMUNITY_DESCRIPTION;
		case 'chat-message':
		case 'fireside-chat-message':
			return MediaItem.TYPE_CHAT_MESSAGE;
		case 'chat-command':
			return MediaItem.TYPE_CHAT_COMMAND;
		case 'community-channel-description':
			return MediaItem.TYPE_COMMUNITY_CHANNEL_DESCRIPTION;
		case 'help-page':
			return MediaItem.TYPE_HELP_PAGE_IMAGE;
	}
	throw new Error('There is no matching media item type for the context ' + context);
}
