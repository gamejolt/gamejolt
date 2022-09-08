import { LightboxMediaModel, LightboxMediaType } from '../lightbox/lightbox-helpers';
import { Model } from '../model/model.service';
import { constructStickerCounts, StickerCount } from '../sticker/sticker-count';
import { User } from '../user/user.model';

export class MediaItem extends Model implements LightboxMediaModel {
	static readonly TYPE_GAME_THUMBNAIL = 'game-thumbnail';
	static readonly TYPE_GAME_HEADER = 'game-header';
	static readonly TYPE_GAME_SCREENSHOT = 'game-screenshot';
	static readonly TYPE_GAME_TROPHY = 'game-trophy';
	static readonly TYPE_GAME_DESCRIPTION = 'game-description';

	static readonly TYPE_FIRESIDE_POST_HEADER = 'fireside-post-header';
	static readonly TYPE_FIRESIDE_POST_IMAGE = 'fireside-post-image';
	static readonly TYPE_FIRESIDE_POST_VIDEO = 'fireside-post-video';
	static readonly TYPE_FIRESIDE_POST_ARTICLE_IMAGE = 'fireside-post-article-image';

	static readonly TYPE_FEATURED_HEADER = 'featured-header';

	static readonly TYPE_COMMENT = 'comment';

	static readonly TYPE_FORUM_POST = 'forum-post';

	static readonly TYPE_COMMUNITY_DESCRIPTION = 'community-description';

	static readonly TYPE_COMMUNITY_CHANNEL_DESCRIPTION = 'community-channel-description';

	static readonly TYPE_CHAT_MESSAGE = 'chat-message';

	static readonly TYPE_VIDEO_POSTER = 'video-poster';
	static readonly TYPE_VIDEO_MANIFEST = 'video-manifest';
	static readonly TYPE_TRANSCODED_VIDEO = 'transcoded-video';
	static readonly TYPE_TRANSCODED_VIDEO_CARD = 'transcoded-video-card';

	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';
	static readonly STATUS_INACTIVE = 'inactive';

	type!: string;
	parent_id!: number;
	hash!: string;
	filename!: string;
	filetype!: string;
	is_animated!: boolean;
	width!: number;
	height!: number;
	filesize!: number;
	crop_start_x!: number;
	crop_start_y!: number;
	crop_end_x!: number;
	crop_end_y!: number;
	added_on!: number;
	status!: string;
	img_url!: string;
	mediaserver_url_webm!: string;
	mediaserver_url_mp4!: string;
	mediaserver_url!: string;
	avg_img_color!: null | string;
	img_has_transparency!: boolean;
	sticker_counts: StickerCount[] = [];
	supporters: User[] = [];

	post_id?: number;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker_counts) {
			this.sticker_counts = constructStickerCounts(data.sticker_counts);
		}

		if (data.supporters) {
			this.supporters = User.populate(data.supporters);
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
		return this;
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
			width = maxWidth || (maxHeight ? maxHeight / aspectRatio : 0);
			height = maxHeight || (maxWidth ? maxWidth * aspectRatio : 0);
		} else {
			// Setting max for both.
			if (maxWidth && maxHeight) {
				width = Math.min(this.croppedWidth, maxWidth);
				height = width * aspectRatio;

				if (height > maxHeight) {
					height = maxHeight;
					width = height / aspectRatio;
				}
			} else if (maxWidth && !maxHeight) {
				width = Math.min(this.croppedWidth, maxWidth);
				height = width * aspectRatio;
			} else if (!maxWidth && maxHeight) {
				height = Math.min(this.croppedHeight, maxHeight);
				width = height / aspectRatio;
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

Model.create(MediaItem);
