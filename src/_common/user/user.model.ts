import { Api } from '../api/api.service';
import { ContentContainerModel } from '../content/content-container-model';
import { ContentContext } from '../content/content-context';
import { ContentSetCache } from '../content/content-set-cache';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Theme } from '../theme/theme.model';

export class User extends Model implements ContentContainerModel {
	static readonly TYPE_GAMER = 'User';
	static readonly TYPE_DEVELOPER = 'Developer';

	private _contentSetCache: ContentSetCache | undefined;

	type!: 'User' | 'Developer';
	username!: string;
	name!: string;
	web_site!: string;
	display_name!: string;
	url!: string;
	slug!: string;
	img_avatar!: string;
	dogtag!: string;
	shouts_enabled!: boolean;

	status!: number;
	permission_level!: number;
	is_verified!: boolean;
	is_partner!: boolean | null;
	friend_requests_enabled!: boolean;

	created_on!: number;
	last_logged_on!: number;

	theme!: Theme | null;
	follower_count!: number;
	following_count!: number;
	comment_count!: number;
	is_following?: boolean;
	follows_you?: boolean;

	// exp settings.
	level?: number;
	experience?: number;
	experience_next?: number;
	level_next_percentage?: number;

	// Profile settings.
	avatar_media_item?: MediaItem;
	header_media_item?: MediaItem;
	disable_gravatar?: boolean;

	bio_content!: string;

	// Notifications settings.
	newsletter?: boolean;
	notifiy_shouts?: boolean;
	notifiy_comments?: boolean;
	notifiy_comment_replies?: boolean;
	notifiy_ratings?: boolean;
	notifiy_game_follows?: boolean;
	notifiy_user_follows?: boolean;
	notifiy_user_uploads?: boolean;
	notifiy_private_messages?: boolean;
	notifiy_friendships?: boolean;
	notifiy_forum_posts?: boolean;
	notifiy_followed_game_updates?: boolean;
	notifiy_sales?: boolean;
	notifiy_collaborator_invites?: boolean;
	notifiy_mentions?: boolean;
	notifiy_gj_news?: boolean;
	notifiy_gj_recommendations?: boolean;

	// Email settings
	email_address?: string;

	// Financials
	paypal_id?: string;
	paypal_email_address?: string;
	revenue_percentage?: number;
	revenue_payout_minimum?: number;
	revenue_wallet_maximum?: number;

	// Fireside.
	can_manage?: boolean;
	fireside_ga_tracking_id?: string;

	// Fireside profile
	fireside_profile?: string;
	compiled_fireside_profile?: string;
	fireside_about?: string;
	compiled_fireside_about?: string;

	// Card
	post_count?: number;
	game_count?: number;
	video_count?: number;

	is_gamer = false;
	is_developer = false;

	get isMod() {
		return this.permission_level >= 3;
	}

	get hasBio() {
		if (this._contentSetCache === undefined) {
			this._contentSetCache = new ContentSetCache(this, 'user-bio');
		}
		return this._contentSetCache.hasContent;
	}

	getContent(context: ContentContext) {
		if (context === 'user-bio') {
			return this.bio_content;
		}
		throw new Error(`Context ${context} is not defined for User.`);
	}

	constructor(data: any = {}) {
		super(data);

		if (this.type === User.TYPE_GAMER) {
			this.is_gamer = true;
		} else if (this.type === User.TYPE_DEVELOPER) {
			this.is_developer = true;
		}

		if (data.avatar_media_item) {
			this.avatar_media_item = new MediaItem(data.avatar_media_item);
		}

		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}

		if (data.theme) {
			this.theme = new Theme(data.theme);
		}

		Registry.store('User', this);
	}

	static touch() {
		if (GJ_IS_SSR) {
			return Promise.resolve();
		}

		// We don't want to wait for the touch in Client since we know it gets loaded in
		// immediately.
		if (GJ_IS_CLIENT) {
			Api.sendRequest('/web/touch', null, { detach: true });
			return Promise.resolve();
		}

		return Api.sendRequest('/web/touch');
	}

	async $follow() {
		this.is_following = true;
		++this.follower_count;

		try {
			return await Api.sendRequest(
				'/web/profile/follow/' + this.id,
				{
					data: {
						timestamp: Date.now(),
					},
				},
				{ detach: true }
			);
		} catch (e) {
			this.is_following = false;
			--this.follower_count;
			throw e;
		}
	}

	async $unfollow() {
		this.is_following = false;
		--this.follower_count;

		try {
			return await Api.sendRequest(
				'/web/profile/unfollow/' + this.id,
				{
					data: {
						timestamp: Date.now(),
					},
				},
				{ detach: true }
			);
		} catch (e) {
			this.is_following = true;
			++this.follower_count;
			throw e;
		}
	}

	$save() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/profile/save', 'user', {
			allowComplexData: ['theme'],
		});
	}

	$saveAvatar() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/avatar/save', 'user', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$clearAvatar() {
		return this.$_save('/web/dash/avatar/clear', 'user');
	}

	$saveHeader() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/header/save', 'user', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$clearHeader() {
		return this.$_save('/web/dash/header/clear', 'user');
	}

	$saveEmailPreferences() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/email-preferences/save', 'user');
	}

	$toggleEmails(state: boolean) {
		return this.$_save('/web/dash/email-preferences/toggle-emails', 'user', {
			data: { state },
		});
	}

	$unlinkAccount(provider: string) {
		return this.$_save('/web/dash/linked-accounts/unlink/' + provider, 'user');
	}
}

Model.create(User);
