import { RawLocation } from 'vue-router';
import { Route } from 'vue-router/types/router';
import { Api } from '../../api/api.service';
import { Perm } from '../../collaborator/collaboratable';
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
	static TYPE_TEXT = 'text';
	static TYPE_MEDIA = 'media';
	static TYPE_VIDEO = 'video';
	static TYPE_SKETCHFAB = 'sketchfab';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

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
	game!: Game;
	as_game_owner!: boolean;
	slug!: string;
	subline!: string;
	url!: string;
	view_count?: number;
	expand_count?: number;
	is_pinned!: boolean;

	lead_snippet!: string;
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

	get hasArticle() {
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
		if (this.game) {
			return {
				name: 'discover.games.view.devlog.view',
				params: {
					slug: this.game.slug,
					id: this.game.id + '',
					postSlug: this.slug,
				},
			};
		}

		return {
			name: 'profile.post.view',
			params: {
				username: this.user.username,
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
			return this.game;
		}

		if (this.isInCommunityPinContext(route)) {
			return this.communities[0];
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
			if (!community.channel || !community.channel.permissions.canPerform('posts')) {
				return false;
			}
		}
		return true;
	}

	private isInCommunityPinContext(route: Route) {
		// A post can be pinned to a community if:
		// 1. viewing the community feed.
		// 2. the post was published to the community.
		// 3. viewing the channel the post was published to.
		// NOTE: this means posts cannot be pinned to meta channels like 'featured' and 'all posts'

		if (route.name !== 'communities.view.overview') {
			return false;
		}

		if (this.communities.length === 0) {
			return false;
		}

		const communityLink = this.communities[0];
		const community = communityLink.community;
		const channelTitle = communityLink.channel!.title;

		return route.params.path === community.path && route.params.channel === channelTitle;
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
			allowComplexData: ['keyGroups', 'mediaItemIds', 'publishToPlatforms'],
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

	$pin(targetModel: string) {
		return this.$_save(`/web/posts/manage/toggle-pin/${this.id}/${targetModel}`, 'post');
	}

	$unpin(targetModel: string) {
		return this.$_save(`/web/posts/manage/toggle-pin/${this.id}/${targetModel}`, 'post');
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
