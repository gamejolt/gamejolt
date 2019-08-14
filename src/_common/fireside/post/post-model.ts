import { RawLocation } from 'vue-router';
import { Perm } from '../../../components/collaborator/collaboratable';
import { appStore } from '../../../vue/services/app/app-store';
import { Api } from '../../api/api.service';
import { Community } from '../../community/community.model';
import { ContentContainerModel } from '../../content/content-container-model';
import { ContentContext } from '../../content/content-context';
import { ContentSetCache } from '../../content/content-set-cache';
import { EventItem } from '../../event-item/event-item.model';
import { Game } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { KeyGroup } from '../../key-group/key-group.model';
import { MediaItem } from '../../media-item/media-item-model';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { Model, ModelSaveRequestOptions } from '../../model/model.service';
import { Poll } from '../../poll/poll.model';
import { Registry } from '../../registry/registry.service';
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

export class FiresidePost extends Model implements ContentContainerModel {
	static TYPE_TEXT = 'text';
	static TYPE_MEDIA = 'media';
	static TYPE_VIDEO = 'video';
	static TYPE_SKETCHFAB = 'sketchfab';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	private _articleSetCache: ContentSetCache | undefined;
	private _leadSetCache: ContentSetCache | undefined;

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
		if (this._articleSetCache === undefined) {
			this._articleSetCache = new ContentSetCache(this, 'fireside-post-article');
		}
		return this._articleSetCache.hasContent;
	}

	get hasLead() {
		if (this._leadSetCache === undefined) {
			this._leadSetCache = new ContentSetCache(this, 'fireside-post-lead');
		}
		return this._leadSetCache.hasContent;
	}

	get leadLength() {
		if (this._leadSetCache === undefined) {
			this._leadSetCache = new ContentSetCache(this, 'fireside-post-lead');
		}
		return this._leadSetCache.length;
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

	static async $create(gameId?: number) {
		let url = `/web/posts/manage/new-post`;
		if (gameId) {
			url += '/' + gameId;
		}

		const response = await Api.sendRequest(url);
		await FiresidePost.processCreate(response, 'post');
		return new FiresidePost(response.post);
	}

	$save() {
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

		return this.$_save(`/web/posts/manage/save/${this.id}`, 'firesidePost', options);
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

	getTaggedCommunity(community: Community) {
		return this.communities.find(c => c.community.id === community.id);
	}

	$publish() {
		return this.$_save(`/web/posts/manage/publish/${this.id}`, 'firesidePost');
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
