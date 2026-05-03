import { LightboxMediaModel, LightboxMediaType } from '~common/lightbox/lightbox-helpers';
import { Model } from '~common/model/model.service';
import { constructStickerCounts, StickerCount } from '~common/sticker/sticker-count';

export const MediaItemTypeGameThumbnail = 'game-thumbnail';
export const MediaItemTypeGameHeader = 'game-header';
export const MediaItemTypeGameScreenshot = 'game-screenshot';
export const MediaItemTypeGameTrophy = 'game-trophy';
export const MediaItemTypeGameDescription = 'game-description';
export const MediaItemTypeFiresidePostHeader = 'fireside-post-header';
export const MediaItemTypeFiresidePostImage = 'fireside-post-image';
export const MediaItemTypeFiresidePostVideo = 'fireside-post-video';
export const MediaItemTypeFiresidePostArticleImage = 'fireside-post-article-image';
export const MediaItemTypeFeaturedHeader = 'featured-header';
export const MediaItemTypeComment = 'comment';
export const MediaItemTypeForumPost = 'forum-post';
export const MediaItemTypeCommunityDescription = 'community-description';
export const MediaItemTypeCommunityChannelDescription = 'community-channel-description';
export const MediaItemTypeChatMessage = 'chat-message';
export const MediaItemTypeChatCommand = 'chat-command';
export const MediaItemTypeVideoPoster = 'video-poster';
export const MediaItemTypeVideoManifest = 'video-manifest';
export const MediaItemTypeTranscodedVideo = 'transcoded-video';
export const MediaItemTypeTranscodedVideoCard = 'transcoded-video-card';
export const MediaItemTypeHelpPageImage = 'help-page-image';

export type MediaItemType =
	| typeof MediaItemTypeGameThumbnail
	| typeof MediaItemTypeGameHeader
	| typeof MediaItemTypeGameScreenshot
	| typeof MediaItemTypeGameTrophy
	| typeof MediaItemTypeGameDescription
	| typeof MediaItemTypeFiresidePostHeader
	| typeof MediaItemTypeFiresidePostImage
	| typeof MediaItemTypeFiresidePostVideo
	| typeof MediaItemTypeFiresidePostArticleImage
	| typeof MediaItemTypeFeaturedHeader
	| typeof MediaItemTypeComment
	| typeof MediaItemTypeForumPost
	| typeof MediaItemTypeCommunityDescription
	| typeof MediaItemTypeCommunityChannelDescription
	| typeof MediaItemTypeChatMessage
	| typeof MediaItemTypeChatCommand
	| typeof MediaItemTypeVideoPoster
	| typeof MediaItemTypeVideoManifest
	| typeof MediaItemTypeTranscodedVideo
	| typeof MediaItemTypeTranscodedVideoCard
	| typeof MediaItemTypeHelpPageImage;

export const MediaItemStatusActive = 'active';
export const MediaItemStatusRemoved = 'removed';
export const MediaItemStatusInactive = 'inactive';

export type MediaItemStatus =
	| typeof MediaItemStatusActive
	| typeof MediaItemStatusRemoved
	| typeof MediaItemStatusInactive;

export class MediaItemModel extends Model implements LightboxMediaModel {
	declare type: MediaItemType;
	declare parent_id: number;
	declare hash: string;
	declare filename: string;
	declare filetype: string;
	declare is_animated: boolean;
	declare width: number;
	declare height: number;
	declare filesize: number;
	declare crop_start_x: number;
	declare crop_start_y: number;
	declare crop_end_x: number;
	declare crop_end_y: number;
	declare added_on: number;
	declare status: MediaItemStatus;
	declare img_url: string;
	declare mediaserver_url_webm: string;
	declare mediaserver_url_mp4: string;
	declare mediaserver_url: string;
	declare avg_img_color: null | string;
	declare img_has_transparency: boolean;
	declare post_id?: number;
	sticker_counts: StickerCount[] = [];

	constructor(data: any = {}) {
		super(data);

		if (data.sticker_counts) {
			this.sticker_counts = constructStickerCounts(data.sticker_counts);
		}
	}

	get croppedWidth() {
		const crop = this.getCrop();
		if (!crop) {
			return this.width;
		}
		return crop.x2 - crop.x;
	}

	get croppedHeight() {
		const crop = this.getCrop();
		if (!crop) {
			return this.height;
		}
		return crop.y2 - crop.y;
	}

	// Needed for lightbox and other components that are used together with GameVideo.
	get img_thumbnail() {
		return this.mediaserver_url;
	}

	set img_thumbnail(img: string) {
		this.mediaserver_url = img;
	}

	get aspectRatio() {
		return this.croppedWidth / this.croppedHeight;
	}

	getModelId() {
		return this.id;
	}

	getMediaType() {
		return 'image' as LightboxMediaType;
	}

	getMediaItem() {
		// Have to type it like this so we don't do a circular type reference.
		return this as any;
	}

	getDimensions(
		maxWidth: number | undefined,
		maxHeight: number | undefined,
		options: { force?: boolean } = {}
	) {
		// Simple getter for dimensions.
		if (!maxWidth && !maxHeight) {
			return {
				width: this.croppedWidth,
				height: this.croppedHeight,
			};
		} else if (options && options.force && maxWidth && maxHeight) {
			// This case is a bit silly, but whatever.
			return {
				width: maxWidth,
				height: maxHeight,
			};
		}

		const aspectRatio = this.aspectRatio;
		let width = 0;
		let height = 0;

		// Forcing one of the dimensions is easy.
		if (options && options.force) {
			width = maxWidth || (maxHeight ? maxHeight * aspectRatio : 0);
			height = maxHeight || (maxWidth ? maxWidth / aspectRatio : 0);
		} else {
			// Setting max for both.
			if (maxWidth && maxHeight) {
				width = Math.min(this.croppedWidth, maxWidth);
				height = width / aspectRatio;

				if (height > maxHeight) {
					height = maxHeight;
					width = height * aspectRatio;
				}
			} else if (maxWidth && !maxHeight) {
				width = Math.min(this.croppedWidth, maxWidth);
				height = width / aspectRatio;
			} else if (!maxWidth && maxHeight) {
				height = Math.min(this.croppedHeight, maxHeight);
				width = height * aspectRatio;
			}
		}

		return {
			width,
			height,
		};
	}

	getCrop() {
		if (!this.crop_end_x || !this.crop_end_y) {
			return undefined;
		}

		return {
			x: this.crop_start_x,
			y: this.crop_start_y,
			x2: this.crop_end_x,
			y2: this.crop_end_y,
		};
	}
}

export function getMediaItemImageSrc(media: MediaItemModel) {
	if ((media.img_url && media.is_animated) || !media.mediaserver_url) {
		return { src: media.img_url, isMediaserver: false };
	} else {
		return { src: media.mediaserver_url, isMediaserver: true };
	}
}
