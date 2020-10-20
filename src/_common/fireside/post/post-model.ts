import { RawLocation } from 'vue-router';
import { Route } from 'vue-router/types/router';
import { Api } from '../../api/api.service';
import { Perm } from '../../collaborator/collaboratable';
import { COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING } from '../../community/channel/channel-permissions';
import { CommunityChannel } from '../../community/channel/channel.model';
import { Community } from '../../community/community.model';
import { ContentContainerModel } from '../../content/content-container-model';
import { ContentContext } from '../../content/content-context';
import { ContentSetCacheService } from '../../content/content-set-cache';
import { EventItem } from '../../event-item/event-item.model';
import { Game } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { KeyGroup } from '../../key-group/key-group.model';
import { MediaItem } from '../../media-item/media-item-model';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { CommentableModel, Model, ModelSaveRequestOptions } from '../../model/model.service';
import { Poll } from '../../poll/poll.model';
import { Registry } from '../../registry/registry.service';
import { StickerPlacement } from '../../sticker/placement/placement.model';
import { appStore } from '../../store/app-store';
import { Translate } from '../../translate/translate.service';
import { User } from '../../user/user.model';
import { FiresidePostCommunity } from './community/community.model';
import { FiresidePostLike } from './like/like-model';
import { FiresidePostSketchfab } from './sketchfab/sketchfab-model';
import { FiresidePostTag } from './tag/tag-model';
import { FiresidePostVideo } from './video/video-model';

interface FiresidePostPublishedPlatform {
	created_resource_provider: string;
	created_resource_account_name: string;
	url: string;
}

export class FiresidePost extends Model implements ContentContainerModel, CommentableModel {
	static readonly TYPE_TEXT = 'text';
	static readonly TYPE_MEDIA = 'media';
	static readonly TYPE_VIDEO = 'video';
	static readonly TYPE_SKETCHFAB = 'sketchfab';

	static readonly STATUS_DRAFT = 'draft';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	type!: 'text' | 'media' | 'video' | 'sketchfab' | 'comment-video';
	hash!: string;
	status!: string;
	added_on!: number;
	updated_on!: number;
	published_on!: number;
	scheduled_for_timezone!: string | null;
	scheduled_for!: number | null;
	like_count!: number;
	comment_count!: number;
	user!: User;
	game?: Game;
	as_game_owner!: boolean;
	post_to_user_profile!: boolean;
	slug!: string;
	subline!: string;
	url!: string;
	view_count?: number;
	expand_count?: number;
	is_pinned!: boolean;

	/**
	 * If the post has an article saved, whether or not it's loaded in yet.
	 */
	has_article!: boolean;

	lead_content!: string;
	leadStr!: string;
	article_content!: string;

	tags: FiresidePostTag[] = [];
	communities: FiresidePostCommunity[] = [];
	media: MediaItem[] = [];
	videos: FiresidePostVideo[] = [];
	sketchfabs: FiresidePostSketchfab[] = [];
	user_like?: FiresidePostLike | null;
	key_groups: KeyGroup[] = [];
	poll!: Poll | null;
	platforms_published_to: FiresidePostPublishedPlatform[] = [];
	stickers: StickerPlacement[] = [];

	// Used for forms and saving.
	key_group_ids: number[] = [];

	// Returned when saving a post for the first time.
	// The feed no longer works with posts directly - we need the event item.
	event_item?: EventItem;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}

		if (data.tags) {
			this.tags = FiresidePostTag.populate(data.tags);
		}

		if (data.communities) {
			this.communities = FiresidePostCommunity.populate(data.communities);
		}

		if (data.media) {
			this.media = MediaItem.populate(data.media);
		}

		if (data.videos) {
			this.videos = FiresidePostVideo.populate(data.videos);
		}

		if (data.sketchfabs) {
			this.sketchfabs = FiresidePostSketchfab.populate(data.sketchfabs);
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

		if (data.platforms_published_to) {
			this.platforms_published_to = data.platforms_published_to;
		}

		if (data.stickers) {
			this.stickers = StickerPlacement.populate(data.stickers);
		}

		Registry.store('FiresidePost', this);
	}

	get isActive() {
		return this.status === FiresidePost.STATUS_ACTIVE;
	}

	get isDraft() {
		return this.status === FiresidePost.STATUS_DRAFT;
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

	get hasMedia() {
		return this.media.length > 0;
	}

	get hasSketchfab() {
		return this.sketchfabs.length > 0;
	}

	get hasVideo() {
		return this.videos.length > 0;
	}

	/**
	 * This differs from has_article in that it is purely a frontend check, so
	 * it updates in realtime.
	 */
	get hasArticleContent() {
		const cache = ContentSetCacheService.getCache(this, 'fireside-post-article');
		return cache.hasContent;
	}

	get hasLead() {
		const cache = ContentSetCacheService.getCache(this, 'fireside-post-lead');
		return cache.hasContent;
	}

	get leadLength() {
		const cache = ContentSetCacheService.getCache(this, 'fireside-post-lead');
		return cache.length;
	}

	get hasPoll() {
		return !!this.poll;
	}

	static pullHashFromUrl(url: string) {
		return url.substring(url.lastIndexOf('-') + 1);
	}

	async fetchLikes(): Promise<FiresidePostLike[]> {
		const response = await Api.sendRequest(`/web/posts/likes/${this.id}`);
		return FiresidePostLike.populate(response.likes);
	}

	get routeLocation(): RawLocation {
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

	get canComment() {
		if (this.user.blocked_you || this.user.is_blocked) {
			return false;
		}

		if (this.game && !this.game.canComment) {
			return false;
		}

		return true;
	}

	get canPlaceSticker() {
		return this.canComment;
	}

	get canLike() {
		let postOwner = this.user;
		if (this.game && this.as_game_owner) {
			postOwner = this.game.developer;
		}

		if (postOwner.blocked_you || postOwner.is_blocked) {
			return false;
		}

		return true;
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

	getPinContextFor(route: Route) {
		if (this.isInGamePinContext(route)) {
			return this.game!;
		}

		const fpc = this.getCommunityPinContext(route);
		if (fpc !== null) {
			return fpc;
		}

		if (this.isInUserPinContext(route)) {
			return this.user;
		}

		return null;
	}

	canPublishToCommunities() {
		if (!this.communities) {
			return true;
		}
		for (const community of this.communities) {
			if (
				!community.channel?.permissions.canPerform(
					COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING
				)
			) {
				return false;
			}
		}
		return true;
	}

	getShortLead(length = 70) {
		let lead = this.leadStr
			.replace('\r\n', ' ')
			.replace('\r', ' ')
			.replace('\n', ' ');
		if (lead.length > length) {
			lead = lead.substr(0, length - 3).trim() + '...';
		}
		return lead;
	}

	private getCommunityPinContext(route: Route) {
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

	private isInGamePinContext(route: Route) {
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

	private isInUserPinContext(route: Route) {
		// A post can be pinned to a user if:
		// 1. viewing the user's profile
		// 2. the post is shown to be written by the user we're viewing (sanity check)
		if (route.name !== 'profile.overview') {
			return false;
		}

		return route.params.username === this.displayUser.username;
	}

	static async $create(gameId?: number) {
		let url = `/web/posts/manage/new-post`;
		if (gameId) {
			url += '/' + gameId;
		}

		const response = await Api.sendRequest(url);
		await FiresidePost.processCreate(response, 'post');
		return new FiresidePost(response.post);
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
				'keyGroups',
				'mediaItemIds',
				'publishToPlatforms',
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

	$viewed() {
		// TODO(collaborators) block collaborators from logging ticks on posts they own
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post', this.id);
		}
	}

	$expanded() {
		// TODO(collaborators) block collaborators from logging ticks on posts they own
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post-expand', this.id);
		}
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

	$reject(community: Community) {
		const c = this.getTaggedCommunity(community);
		if (!c) {
			throw new Error('Cannot reject a post to a community it is not tagged in');
		}

		return this.$_save(`/web/communities/manage/reject/${c.id}`, 'post');
	}

	$moveChannel(community: Community, channel: CommunityChannel) {
		const c = this.getTaggedCommunity(community);
		if (!c) {
			throw new Error('Cannot move a post to a channel in a community it is not tagged in');
		}

		if (community.id !== channel.community_id) {
			throw new Error(
				'Attempted to move a community post to a channel of a different community'
			);
		}

		return this.$_save(`/web/communities/manage/move-post/${c.id}/${channel.id}`, 'post');
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

	async remove() {
		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to remove this post?`),
			undefined,
			'yes'
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

Model.create(FiresidePost);

/**
 * Will load the article from the API and store it into the post model.
 */
export async function loadArticleIntoPost(post: FiresidePost) {
	const payload = await Api.sendRequest(`/web/posts/article/${post.id}`);
	post.article_content = payload.article;
	return post;
}
