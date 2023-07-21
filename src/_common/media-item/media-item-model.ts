import { LightboxMediaModel, LightboxMediaType } from '../lightbox/lightbox-helpers';
import { Model, defineLegacyModel } from '../model/model.service';
import { StickerCount, constructStickerCounts } from '../sticker/sticker-count';

export const enum MediaItemType {
	GameThumbnail = 'game-thumbnail',
	GameHeader = 'game-header',
	GameScreenshot = 'game-screenshot',
	GameTrophy = 'game-trophy',
	GameDescription = 'game-description',
	FiresidePostHeader = 'fireside-post-header',
	FiresidePostImage = 'fireside-post-image',
	FiresidePostVideo = 'fireside-post-video',
	FiresidePostArticleImage = 'fireside-post-article-image',
	FeaturedHeader = 'featured-header',
	Comment = 'comment',
	ForumPost = 'forum-post',
	CommunityDescription = 'community-description',
	CommunityChannelDescription = 'community-channel-description',
	ChatMessage = 'chat-message',
	ChatCommand = 'chat-command',
	VideoPoster = 'video-poster',
	VideoManifest = 'video-manifest',
	TranscodedVideo = 'transcoded-video',
	TranscodedVideoCard = 'transcoded-video-card',
	HelpPageImage = 'help-page-image',
}

export const enum MediaItemStatus {
	Active = 'active',
	Removed = 'removed',
	Inactive = 'inactive',
}

export class MediaItem extends defineLegacyModel(
	class MediaItemDefinition extends Model implements LightboxMediaModel {
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
) {}
