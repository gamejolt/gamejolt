import { RouteLocationNormalized } from 'vue-router';
import { RouteLocationDefinition } from '../../../utils/router';
import { Api } from '../../api/api.service';
import { BackgroundModel } from '../../background/background.model';
import { Perm } from '../../collaborator/collaboratable';
import { CommentableModel } from '../../comment/comment-model';
import { CommunityChannelModel } from '../../community/channel/channel.model';
import { CommunityModel } from '../../community/community.model';
import { ContentContainerModel } from '../../content/content-container-model';
import { ContentContext } from '../../content/content-context';
import { ContentSetCache } from '../../content/content-set-cache';
import { EventItemModel } from '../../event-item/event-item.model';
import { GameModel } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { KeyGroupModel } from '../../key-group/key-group.model';
import { MediaItemModel } from '../../media-item/media-item-model';
import { showModalConfirm } from '../../modal/confirm/confirm-service';
import { storeModel } from '../../model/model-store.service';
import { Model, ModelSaveRequestOptions } from '../../model/model.service';
import { PollModel } from '../../poll/poll.model';
import { Registry } from '../../registry/registry.service';
import { StickerPlacementModel } from '../../sticker/placement/placement.model';
import { StickerCount, constructStickerCounts } from '../../sticker/sticker-count';
import { $gettext } from '../../translate/translate.service';
import { UserModel } from '../../user/user.model';
import { FiresidePostCommunityModel } from './community/community.model';
import { FiresidePostEmbedModel } from './embed/embed.model';
import { FiresidePostLikeModel } from './like/like-model';
import { FiresidePostRealmModel } from './realm/realm.model';
import { FiresidePostVideoModel } from './video/video-model';

export type CommunityNotifyOptions = {
	notifyUser: boolean;
	reason: string | null;
	reasonType: string | null;
};

export const enum FiresidePostType {
	Text = 'text',
	Media = 'media',
	Video = 'video',
}

export const enum FiresidePostStatus {
	Draft = 'draft',
	Active = 'active',
	Removed = 'removed',
	Temp = 'temp',
}

export const enum FiresidePostAllowComments {
	Disabled = 0,
	Enabled = 1,
	Friends = 2,
}

export class FiresidePostModel extends Model implements ContentContainerModel, CommentableModel {
	declare hash: string;
	declare status: FiresidePostStatus;
	declare added_on: number;
	declare updated_on: number;
	declare published_on: number;
	declare scheduled_for_timezone: string | null;
	declare scheduled_for: number | null;
	declare like_count: number;
	declare comment_count: number;
	declare user: UserModel;
	declare game?: GameModel;
	declare as_game_owner: boolean;
	declare post_to_user_profile: boolean;
	declare slug: string;
	declare subline: string;
	declare url: string;
	declare view_count?: number;
	declare is_pinned: boolean;
	declare is_processing: boolean;

	/**
	 * If the post has an article saved, whether or not it's loaded in yet.
	 */
	declare has_article: boolean;

	declare lead_content: string;
	declare leadStr: string;
	declare article_content: string;

	communities: FiresidePostCommunityModel[] = [];
	realms: FiresidePostRealmModel[] = [];
	media: MediaItemModel[] = [];
	videos: FiresidePostVideoModel[] = [];
	user_like?: FiresidePostLikeModel | null;
	key_groups: KeyGroupModel[] = [];
	declare poll: PollModel | null;
	stickers: StickerPlacementModel[] = [];
	sticker_counts: StickerCount[] = [];
	supporters: UserModel[] = [];
	embeds: FiresidePostEmbedModel[] = [];

	// Used for forms and saving.
	key_group_ids: number[] = [];

	// Returned when saving a post for the first time.
	// The feed no longer works with posts directly - we need the event item.
	declare event_item?: EventItemModel;

	declare background?: BackgroundModel;

	/**
	 * The raw state of who can comment from backend.
	 */
	declare allow_comments: FiresidePostAllowComments;

	/**
	 * If the current post comment restrictions allow us to comment. For the
	 * result of all restrictions, check {@link canMakeComment}.
	 */
	declare can_comment: boolean;

	/**
	 * If post comment restrictions allow us to view comments at all.
	 */
	declare can_view_comments: boolean;
	declare can_receive_charged_stickers: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.game) {
			this.game = new GameModel(data.game);
		}

		if (data.communities) {
			this.communities = FiresidePostCommunityModel.populate(data.communities);
		}

		if (data.realms) {
			this.realms = FiresidePostRealmModel.populate(data.realms);
		}

		if (data.media) {
			this.media = MediaItemModel.populate(data.media);
		}

		if (data.videos) {
			this.videos = FiresidePostVideoModel.populate(data.videos);
		}

		if (data.user_like) {
			this.user_like = new FiresidePostLikeModel(data.user_like);
		}

		if (data.key_groups) {
			this.key_groups = KeyGroupModel.populate(data.key_groups);
			this.key_group_ids = this.key_groups.map(i => i.id);
		}

		if (data.poll) {
			this.poll = new PollModel(data.poll);
		}

		if (data.event_item) {
			this.event_item = new EventItemModel(data.event_item);
		}

		if (data.sticker_counts) {
			this.sticker_counts = constructStickerCounts(data.sticker_counts);
		}

		if (data.supporters) {
			this.supporters = UserModel.populate(data.supporters);
		}

		if (data.embeds) {
			this.embeds = FiresidePostEmbedModel.populate(data.embeds);
		}

		if (data.background) {
			this.background = storeModel(BackgroundModel, data.background);
		}

		Registry.store('FiresidePost', this);
	}

	get isActive() {
		return this.status === FiresidePostStatus.Active;
	}

	get isDraft() {
		return this.status === FiresidePostStatus.Draft;
	}

	get isRemoved() {
		return this.status === FiresidePostStatus.Removed;
	}

	get isScheduled() {
		return !!this.scheduled_for;
	}

	// Which user is displayed as the author of this post
	get displayUser() {
		if (!this.game) {
			return this.user;
		}

		return this.as_game_owner ? this.game.developer : this.user;
	}

	get hasAnyBlock() {
		return this.displayUser.hasAnyBlock;
	}

	/** Checks if any media or videos are attached. */
	get hasAnyMedia() {
		return this.hasMedia || this.hasVideo;
	}

	/** Has images/gifs. */
	get hasMedia() {
		return this.media.length > 0;
	}

	get hasVideo() {
		return this.videos.length > 0;
	}

	/**
	 * This differs from has_article in that it is purely a frontend check, so
	 * it updates in realtime.
	 */
	get hasArticleContent() {
		const cache = ContentSetCache.getCache(this, 'fireside-post-article');
		return cache.hasContent;
	}

	get hasLead() {
		const cache = ContentSetCache.getCache(this, 'fireside-post-lead');
		return cache.hasContent;
	}

	get leadLength() {
		const cache = ContentSetCache.getCache(this, 'fireside-post-lead');
		return cache.length;
	}

	get hasPoll() {
		return !!this.poll;
	}

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'post',
			params: {
				slug: this.slug,
			},
		};
	}

	get manageableCommunities() {
		return this.getManageableCommunities(['community-features', 'community-posts'], true);
	}

	/**
	 * Whether we can like, place stickers, or interact with comments on this
	 * post.
	 */
	get _canInteractWithPost() {
		if (this.hasAnyBlock || this.isDraft || this.isRemoved) {
			return false;
		}

		return true;
	}

	get canViewComments() {
		return this.can_view_comments;
	}

	get canMakeComment() {
		return this._canInteractWithPost && this.can_comment;
	}

	get canInteractWithComments() {
		return (
			this._canInteractWithPost && this.allow_comments !== FiresidePostAllowComments.Disabled
		);
	}

	get canPlaceSticker() {
		return this._canInteractWithPost;
	}

	get canLike() {
		return this._canInteractWithPost;
	}

	getContent(context: ContentContext) {
		if (context === 'fireside-post-lead') {
			return this.lead_content;
		} else if (context === 'fireside-post-article') {
			return this.article_content;
		}
		throw new Error(`Context ${context} is not defined for Fireside Post.`);
	}

	getManageableCommunities(perms?: Perm | Perm[], either?: boolean) {
		return this.communities.filter(tc => tc.community.hasPerms(perms, either));
	}

	/**
	 * Manageable is any permissions that would show the event-item-manage
	 * controls.
	 */
	isManageableByUser(user?: UserModel | null) {
		return this.isEditableByUser(user) || this.manageableCommunities.length !== 0;
	}

	isEditableByUser(user?: UserModel | null) {
		if (!(user instanceof UserModel)) {
			return false;
		}

		if (this.user.id === user.id) {
			return true;
		}

		if (this.game && this.game.hasPerms('devlogs')) {
			return true;
		}
	}

	getPinContextFor(route: RouteLocationNormalized) {
		if (this._isInGamePinContext(route)) {
			return this.game!;
		}

		const fpc = this._getCommunityPinContext(route);
		if (fpc !== null) {
			return fpc;
		}

		if (this._isInUserPinContext(route)) {
			return this.user;
		}

		return null;
	}

	canPublishToCommunities() {
		if (!this.communities) {
			return true;
		}
		for (const community of this.communities) {
			if (!community.channel?.canPost) {
				return false;
			}
		}
		return true;
	}

	getShortLead(length = 70) {
		let lead = this.leadStr.replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' ');
		if (lead.length > length) {
			lead = lead.substr(0, length - 3).trim() + '...';
		}
		return lead;
	}

	_getCommunityPinContext(route: RouteLocationNormalized) {
		// A post can be pinned to a community if:
		// 1. viewing the community feed.
		// 2. the post was published to the community.
		// 3. viewing the channel the post was published to.
		// NOTE: this means posts cannot be pinned to meta channels like 'featured' and 'all posts'

		if (route.name !== 'communities.view.channel') {
			return null;
		}

		for (const communityLink of this.communities) {
			const community = communityLink.community;
			const channelTitle = communityLink.channel!.title;

			if (route.params.path === community.path && route.params.channel === channelTitle) {
				return communityLink;
			}
		}

		return null;
	}

	_isInGamePinContext(route: RouteLocationNormalized) {
		// A post can be pinned to a game if:
		// 1. viewing the game feed, or the game's dashboard feed.
		// 2. the post is a game post (sanity check)
		// 3. the post belongs to the game we're viewing (sanity check)

		if (
			route.name !== 'discover.games.view.overview' &&
			route.name !== 'dash.games.manage.devlog'
		) {
			return false;
		}

		if (!this.game) {
			return false;
		}

		return route.params.id.toString() === this.game.id.toString();
	}

	_isInUserPinContext(route: RouteLocationNormalized) {
		// A post can be pinned to a user if:
		// 1. viewing the user's profile
		// 2. the post is shown to be written by the user we're viewing (sanity check)
		if (route.name !== 'profile.overview') {
			return false;
		}

		return route.params.username === this.displayUser.username;
	}

	getTaggedCommunity(community: CommunityModel) {
		return this.communities.find(c => c.community.id === community.id);
	}
}

/**
 * Given a URL will try to find the post hash.
 */
export function pullFiresidePostHashFromUrl(url: string) {
	return url.substring(url.lastIndexOf('-') + 1);
}

export async function $createFiresidePost(gameId?: number) {
	let url = `/web/posts/manage/new-post`;
	if (gameId) {
		url += '/' + gameId;
	}

	const response = await Api.sendRequest(url, {});
	await FiresidePostModel.processCreate(response, 'post');
	return new FiresidePostModel(response.post);
}

/**
 * Will load the article from the API and store it into the post model.
 */
export async function loadArticleIntoPost(post: FiresidePostModel) {
	const payload = await Api.sendRequest(`/web/posts/article/${post.id}`);
	post.article_content = payload.article;
	return post;
}

export function $viewPost(post: FiresidePostModel, sourceFeed?: string) {
	HistoryTick.sendBeacon('fireside-post', post.id, { sourceFeed });
}

export async function $saveFiresidePost(model: FiresidePostModel) {
	const options: ModelSaveRequestOptions = {
		data: Object.assign({}, model),
		allowComplexData: ['attached_communities', 'attached_realms', 'keyGroups', 'mediaItemIds'],
	};

	if (model.game) {
		options.data.keyGroups = {};
		for (const id of model.key_group_ids) {
			options.data.keyGroups[id] = true;
		}
	}

	// Preserve the is pinned status.
	// The backend will not know the context in which we edit the post,
	// so we save the pinned status, which won't change between edits, and then reapply it manully.
	const isPinned = model.is_pinned;

	const payload = await model.$_save(
		`/web/posts/manage/save/${model.id}`,
		'firesidePost',
		options
	);

	model.is_pinned = isPinned;

	return payload;
}

export function $featureFiresidePost(model: FiresidePostModel, community: CommunityModel) {
	const c = model.getTaggedCommunity(community);
	if (!c) {
		throw new Error('Cannot feature a post to a community it is not tagged in');
	}

	return model.$_save(`/web/communities/manage/feature/${c.id}`, 'post');
}

export function $unfeatureFiresidePost(model: FiresidePostModel, community: CommunityModel) {
	const c = model.getTaggedCommunity(community);
	if (!c) {
		throw new Error('Cannot unfeature a post to a community it is not tagged in');
	}

	return model.$_save(`/web/communities/manage/unfeature/${c.id}`, 'post');
}

export function $rejectFiresidePost(
	model: FiresidePostModel,
	community: CommunityModel,
	notifyOptions: CommunityNotifyOptions | undefined = undefined
) {
	const c = model.getTaggedCommunity(community);
	if (!c) {
		throw new Error('Cannot reject a post to a community it is not tagged in');
	}

	return model.$_save(`/web/communities/manage/reject/${c.id}`, 'post', {
		data: notifyOptions,
	});
}

export function $moveFiresidePostToChannel(
	model: FiresidePostModel,
	community: CommunityModel,
	channel: CommunityChannelModel,
	notifyOptions: CommunityNotifyOptions | undefined = undefined
) {
	const c = model.getTaggedCommunity(community);
	if (!c) {
		throw new Error('Cannot move a post to a channel in a community it is not tagged in');
	}

	if (community.id !== channel.community_id) {
		throw new Error('Attempted to move a community post to a channel of a different community');
	}

	return model.$_save(`/web/communities/manage/move-post/${c.id}/${channel.id}`, 'post', {
		data: notifyOptions,
	});
}

export function $publishFiresidePost(model: FiresidePostModel) {
	return model.$_save(`/web/posts/manage/publish/${model.id}`, 'firesidePost');
}

export function $togglePinOnFiresidePost(
	model: FiresidePostModel,
	targetModel: string,
	targetId: number
) {
	return model.$_save(
		`/web/posts/manage/toggle-pin/${model.id}/${targetModel}/${targetId}`,
		'post'
	);
}

export function $removeFiresidePostVideo(model: FiresidePostModel) {
	return Api.sendRequest(`/web/posts/manage/remove-video/${model.id}`, {});
}

export async function $removeFiresidePost(model: FiresidePostModel) {
	const result = await showModalConfirm($gettext(`Are you sure you want to remove this post?`));

	if (result) {
		await _removeFiresidePost(model);
		return true;
	}

	return false;
}

function _removeFiresidePost(model: FiresidePostModel) {
	return model.$_remove(`/web/posts/manage/remove/${model.id}`);
}
