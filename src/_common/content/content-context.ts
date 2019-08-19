import { MediaItem } from '../media-item/media-item-model';

export type ContentContext =
	| 'fireside-post-lead'
	| 'fireside-post-article'
	| 'fireside-post-comment'
	| 'game-description'
	| 'game-comment'
	| 'user-comment'
	| 'user-bio'
	| 'forum-post'
	| 'community-description';

enum ContextCapabilityType {
	TextBold,
	TextItalic,
	TextLink,
	TextCode,
	TextStrike,

	CustomLink,
	Emoji,
	Tag,
	Mention,

	Media,
	Gif,

	EmbedVideo,
	EmbedMusic,
	EmbedModel,

	CodeBlock,
	Blockquote,
	List,
	HorizontalRule,
	Spoiler,
	Heading,
}

export class ContextCapabilities {
	public capabilities: ContextCapabilityType[];

	get hasAnyBlock() {
		return (
			this.hasAnyEmbed ||
			this.media ||
			this.codeBlock ||
			this.blockquote ||
			this.list ||
			this.hr ||
			this.spoiler
		);
	}
	get hasAnyText() {
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
		return this.hasCapability(ContextCapabilityType.TextBold);
	}
	get textItalic() {
		return this.hasCapability(ContextCapabilityType.TextItalic);
	}
	get textLink() {
		return this.hasCapability(ContextCapabilityType.TextLink);
	}
	get textCode() {
		return this.hasCapability(ContextCapabilityType.TextCode);
	}
	get textStrike() {
		return this.hasCapability(ContextCapabilityType.TextStrike);
	}
	get customLink() {
		return this.hasCapability(ContextCapabilityType.CustomLink);
	}
	get media() {
		// for media items, also allows uploading through the media upload component
		return this.hasCapability(ContextCapabilityType.Media);
	}
	get embedVideo() {
		return this.hasCapability(ContextCapabilityType.EmbedVideo);
	}
	get embedMusic() {
		return this.hasCapability(ContextCapabilityType.EmbedMusic);
	}
	get embedModel() {
		return this.hasCapability(ContextCapabilityType.EmbedModel);
	}
	get codeBlock() {
		return this.hasCapability(ContextCapabilityType.CodeBlock);
	}
	get blockquote() {
		return this.hasCapability(ContextCapabilityType.Blockquote);
	}
	get emoji() {
		return this.hasCapability(ContextCapabilityType.Emoji);
	}
	get list() {
		return this.hasCapability(ContextCapabilityType.List);
	}
	get hr() {
		return this.hasCapability(ContextCapabilityType.HorizontalRule);
	}
	get spoiler() {
		return this.hasCapability(ContextCapabilityType.Spoiler);
	}
	get tag() {
		return this.hasCapability(ContextCapabilityType.Tag);
	}
	get heading() {
		return this.hasCapability(ContextCapabilityType.Heading);
	}
	get mention() {
		return this.hasCapability(ContextCapabilityType.Mention);
	}
	get gif() {
		return this.hasCapability(ContextCapabilityType.Gif);
	}

	private constructor(capabilities: ContextCapabilityType[]) {
		this.capabilities = capabilities;
	}

	private hasCapability(capability: ContextCapabilityType) {
		return this.capabilities.includes(capability);
	}

	public static getEmpty() {
		return new ContextCapabilities([]);
	}

	public static getForContext(context: ContentContext) {
		switch (context) {
			case 'fireside-post-lead':
				return new ContextCapabilities([
					ContextCapabilityType.TextLink,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Mention,
				]);
			case 'fireside-post-article':
			case 'forum-post':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.CustomLink,
					ContextCapabilityType.Media,
					ContextCapabilityType.EmbedVideo,
					ContextCapabilityType.EmbedMusic,
					ContextCapabilityType.EmbedModel,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Heading,
					ContextCapabilityType.Mention,
					ContextCapabilityType.Gif,
				]);
			case 'game-description':
			case 'community-description':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.CustomLink,
					ContextCapabilityType.Media,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Heading,
					ContextCapabilityType.Mention,
				]);
			case 'game-comment':
			case 'user-comment':
			case 'fireside-post-comment':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.CustomLink,
					ContextCapabilityType.Media,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Mention,
					ContextCapabilityType.Gif,
				]);
			case 'user-bio':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.CustomLink,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Mention,
				]);
		}
		throw new Error('Context capabilities undefined for context ' + context);
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
	}
	throw new Error('There is no matching media item type for the context ' + context);
}
