import { RouteLocationNormalized } from 'vue-router';
import { RouteLocationDefinition } from '../../../utils/router';
import { Api } from '../../api/api.service';
import { Background } from '../../background/background.model';
import { Perm } from '../../collaborator/collaboratable';
import { CommentableModel } from '../../comment/comment-model';
import { CommunityChannel } from '../../community/channel/channel.model';
import { Community } from '../../community/community.model';
import { ContentContainerModel } from '../../content/content-container-model';
import { ContentContext } from '../../content/content-context';
import { ContentSetCache } from '../../content/content-set-cache';
import { EventItem } from '../../event-item/event-item.model';
import { Game } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { KeyGroup } from '../../key-group/key-group.model';
import { MediaItem } from '../../media-item/media-item-model';
import { showModalConfirm } from '../../modal/confirm/confirm-service';
import { Model, ModelSaveRequestOptions, defineLegacyModel } from '../../model/model.service';
import { Poll } from '../../poll/poll.model';
import { Registry } from '../../registry/registry.service';
import { StickerPlacement } from '../../sticker/placement/placement.model';
import { StickerCount, constructStickerCounts } from '../../sticker/sticker-count';
import { $gettext } from '../../translate/translate.service';
import { User } from '../../user/user.model';
import { FiresidePostCommunity } from './community/community.model';
import { FiresidePostEmbed } from './embed/embed.model';
import { FiresidePostLike } from './like/like-model';
import { FiresidePostRealm } from './realm/realm.model';
import { FiresidePostVideo } from './video/video-model';

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

export class FiresidePost extends defineLegacyModel(
	class FiresidePostDefinition extends Model implements ContentContainerModel, CommentableModel {
		declare hash: string;
		declare status: FiresidePostStatus;
		declare added_on: number;
		declare updated_on: number;
		declare published_on: number;
		declare scheduled_for_timezone: string | null;
		declare scheduled_for: number | null;
		declare like_count: number;
		declare comment_count: number;
		declare user: User;
		declare game?: Game;
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

		communities: FiresidePostCommunity[] = [];
		realms: FiresidePostRealm[] = [];
		media: MediaItem[] = [];
		videos: FiresidePostVideo[] = [];
		user_like?: FiresidePostLike | null;
		key_groups: KeyGroup[] = [];
		declare poll: Poll | null;
		stickers: StickerPlacement[] = [];
		sticker_counts: StickerCount[] = [];
		supporters: User[] = [];
		embeds: FiresidePostEmbed[] = [];

		// Used for forms and saving.
		key_group_ids: number[] = [];

		// Returned when saving a post for the first time.
		// The feed no longer works with posts directly - we need the event item.
		declare event_item?: EventItem;

		declare background?: Background;

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

		constructor(data: any = {}) {
			super(data);

			if (data.user) {
				this.user = new User(data.user);
			}

			if (data.game) {
				this.game = new Game(data.game);
			}

			if (data.communities) {
				this.communities = FiresidePostCommunity.populate(data.communities);
			}

			if (data.realms) {
				this.realms = FiresidePostRealm.populate(data.realms);
			}

			if (data.media) {
				this.media = MediaItem.populate(data.media);
			}

			if (data.videos) {
				this.videos = FiresidePostVideo.populate(data.videos);
			}

			if (data.user_like) {
				this.user_like = new FiresidePostLike(data.user_like);
			}

			if (data.key_groups) {
				this.key_groups = KeyGroup.populate(data.key_groups);
				this.key_group_ids = this.key_groups.map(i => i.id);
			}

			if (data.poll) {
				this.poll = new Poll(data.poll);
			}

			if (data.event_item) {
				this.event_item = new EventItem(data.event_item);
			}

			if (data.sticker_counts) {
				this.sticker_counts = constructStickerCounts(data.sticker_counts);
			}

			if (data.supporters) {
				this.supporters = User.populate(data.supporters);
			}

			if (data.embeds) {
				this.embeds = FiresidePostEmbed.populate(data.embeds);
			}

			if (data.background) {
				this.background = new Background(data.background);
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

		get hasBackground() {
			return !!this.background;
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
		private get _canInteractWithPost() {
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
				this._canInteractWithPost &&
				this.allow_comments !== FiresidePostAllowComments.Disabled
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
		isManageableByUser(user?: User | null) {
			return this.isEditableByUser(user) || this.manageableCommunities.length !== 0;
		}

		isEditableByUser(user?: User | null) {
			if (!(user instanceof User)) {
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

		async $save() {
			if (!this.id) {
				throw new Error(
					`Can't add fireside posts through $save() anymore. Use $create() instead`
				);
			}

			const options: ModelSaveRequestOptions = {
				data: Object.assign({}, this),
				allowComplexData: [
					'attached_communities',
					'attached_realms',
					'keyGroups',
					'mediaItemIds',
				],
			};

			if (this.game) {
				options.data.keyGroups = {};
				for (const id of this.key_group_ids) {
					options.data.keyGroups[id] = true;
				}
			}

			// Preserve the is pinned status.
			// The backend will not know the context in which we edit the post,
			// so we save the pinned status, which won't change between edits, and then reapply it manully.
			const isPinned = this.is_pinned;

			const payload = await this.$_save(
				`/web/posts/manage/save/${this.id}`,
				'firesidePost',
				options
			);

			this.is_pinned = isPinned;

			return payload;
		}

		$feature(community: Community) {
			const c = this.getTaggedCommunity(community);
			if (!c) {
				throw new Error('Cannot feature a post to a community it is not tagged in');
			}

			return this.$_save(`/web/communities/manage/feature/${c.id}`, 'post');
		}

		$unfeature(community: Community) {
			const c = this.getTaggedCommunity(community);
			if (!c) {
				throw new Error('Cannot unfeature a post to a community it is not tagged in');
			}

			return this.$_save(`/web/communities/manage/unfeature/${c.id}`, 'post');
		}

		$reject(
			community: Community,
			notifyOptions: CommunityNotifyOptions | undefined = undefined
		) {
			const c = this.getTaggedCommunity(community);
			if (!c) {
				throw new Error('Cannot reject a post to a community it is not tagged in');
			}

			return this.$_save(`/web/communities/manage/reject/${c.id}`, 'post', {
				data: notifyOptions,
			});
		}

		$moveChannel(
			community: Community,
			channel: CommunityChannel,
			notifyOptions: CommunityNotifyOptions | undefined = undefined
		) {
			const c = this.getTaggedCommunity(community);
			if (!c) {
				throw new Error(
					'Cannot move a post to a channel in a community it is not tagged in'
				);
			}

			if (community.id !== channel.community_id) {
				throw new Error(
					'Attempted to move a community post to a channel of a different community'
				);
			}

			return this.$_save(`/web/communities/manage/move-post/${c.id}/${channel.id}`, 'post', {
				data: notifyOptions,
			});
		}

		getTaggedCommunity(community: Community) {
			return this.communities.find(c => c.community.id === community.id);
		}

		$publish() {
			return this.$_save(`/web/posts/manage/publish/${this.id}`, 'firesidePost');
		}

		$togglePin(targetModel: string, targetId: number) {
			return this.$_save(
				`/web/posts/manage/toggle-pin/${this.id}/${targetModel}/${targetId}`,
				'post'
			);
		}

		$removeVideo() {
			return Api.sendRequest(`/web/posts/manage/remove-video/${this.id}`, {});
		}

		async remove() {
			const result = await showModalConfirm(
				$gettext(`Are you sure you want to remove this post?`)
			);

			if (result) {
				await this.$remove();
				return true;
			}

			return false;
		}

		$remove() {
			return this.$_remove(`/web/posts/manage/remove/${this.id}`);
		}
	}
) {}

/**
 * Given a URL will try to find the post hash.
 */
export function pullFiresideHashFromUrl(url: string) {
	return url.substring(url.lastIndexOf('-') + 1);
}

export async function $createFiresidePost(gameId?: number) {
	let url = `/web/posts/manage/new-post`;
	if (gameId) {
		url += '/' + gameId;
	}

	const response = await Api.sendRequest(url, {});
	await FiresidePost.processCreate(response, 'post');
	return new FiresidePost(response.post);
}

/**
 * Will load the article from the API and store it into the post model.
 */
export async function loadArticleIntoPost(post: FiresidePost) {
	const payload = await Api.sendRequest(`/web/posts/article/${post.id}`);
	post.article_content = payload.article;
	return post;
}

export function $viewPost(post: FiresidePost, sourceFeed?: string) {
	HistoryTick.sendBeacon('fireside-post', post.id, { sourceFeed });
}
