import type { RouteLocationDefinition } from '../../utils/router';
import { trackUserFollow, UserFollowLocation } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { AvatarFrame } from '../avatar/frame.model';
import { CommentableModel } from '../comment/comment-model';
import { ContentContainerModel } from '../content/content-container-model';
import { ContentContext } from '../content/content-context';
import { ContentSetCacheService } from '../content/content-set-cache';
import { DogtagData } from '../dogtag/dogtag-data';
import { showErrorGrowl } from '../growls/growls.service';
import { MediaItem } from '../media-item/media-item-model';
import { ModalConfirm } from '../modal/confirm/confirm-service';
import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Theme } from '../theme/theme.model';
import { $gettext } from '../translate/translate.service';

export const CreatorStatusCreator = 1;
export const CreatorStatusApplied = 2;
export const CreatorStatusSuspended = 3;

/**
 * When you have code that needs to work on either User | ChatUser, you can use
 * this interface to specify it only works with the fields that are common to
 * both.
 */
export interface UserCommonFields {
	id: number;
	username: string;
	display_name: string;
	img_avatar: string;
	permission_level: number;
	is_verified: boolean;
	is_creator?: boolean;
	avatar_frame?: AvatarFrame;
}

export class User
	extends Model
	implements UserCommonFields, ContentContainerModel, CommentableModel
{
	static readonly TYPE_GAMER = 'User';
	static readonly TYPE_DEVELOPER = 'Developer';

	type!: 'User' | 'Developer';
	username!: string;
	name!: string;
	web_site!: string;
	display_name!: string;
	url!: string;
	slug!: string;
	img_avatar!: string;
	dogtags?: DogtagData[];
	shouts_enabled!: boolean;
	is_spawnday!: boolean;

	status!: number;
	permission_level!: number;
	is_verified!: boolean;
	is_partner!: boolean | null;
	creator_status?: number;
	friend_requests_enabled!: boolean;
	liked_posts_enabled?: boolean;
	mentions_setting?: number;

	created_on!: number;

	theme!: Theme | null;
	follower_count!: number;
	following_count!: number;
	comment_count!: number;
	is_following?: boolean;
	follows_you?: boolean;
	is_blocked?: boolean;
	blocked_you?: boolean;

	// exp settings.
	level?: number;
	experience?: number;
	experience_next?: number;
	level_next_percentage?: number;

	// Profile settings.
	avatar_media_item?: MediaItem;
	header_media_item?: MediaItem;
	disable_gravatar?: boolean;
	avatar_frame?: AvatarFrame;

	bio_content!: string;

	// Notifications settings.
	newsletter?: boolean;
	notify_shouts?: boolean;
	notify_comments?: boolean;
	notify_comment_replies?: boolean;
	notify_ratings?: boolean;
	notify_game_follows?: boolean;
	notify_user_follows?: boolean;
	notify_user_uploads?: boolean;
	notify_private_messages?: boolean;
	notify_friendships?: boolean;
	notify_forum_posts?: boolean;
	notify_followed_game_updates?: boolean;
	notify_sales?: boolean;
	notify_collaborator_invites?: boolean;
	notify_mentions?: boolean;
	notify_gj_news?: boolean;
	notify_gj_recommendations?: boolean;

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
	like_count?: number;

	is_gamer = false;
	is_developer = false;
	is_creator?: boolean;

	can_join_communities?: boolean;
	can_create_communities?: boolean;

	get isMod() {
		return this.permission_level >= 3;
	}

	get hasBio() {
		const cache = ContentSetCacheService.getCache(this, 'user-bio');
		return cache.hasContent;
	}

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'profile.overview',
			params: { username: this.username },
		};
	}

	get hasAnyBlock() {
		return this.is_blocked || this.blocked_you || false;
	}

	get canViewComments() {
		return this.shouts_enabled;
	}

	get canMakeComment() {
		return this.shouts_enabled && !this.hasAnyBlock;
	}

	get canInteractWithComments() {
		return this.shouts_enabled && !this.hasAnyBlock;
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

		if (data.dogtags) {
			this.dogtags = DogtagData.populate(data.dogtags);
		}

		if (data.avatar_frame) {
			this.avatar_frame = new AvatarFrame(data.avatar_frame);
		}

		Registry.store('User', this);
	}

	static touch() {
		// We don't want to wait for the touch in Client since we know it gets loaded in
		// immediately.
		if (GJ_IS_DESKTOP_APP) {
			Api.sendRequest('/web/touch', null, { detach: true });
			return Promise.resolve();
		}

		return Api.sendRequest('/web/touch');
	}

	$save() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/profile/save', 'user', {
			allowComplexData: ['theme', 'dogtags', 'pronoun_dogtags'],
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

export async function followUser(user: User) {
	user.is_following = true;
	++user.follower_count;

	try {
		return await Api.sendRequest(
			'/web/profile/follow/' + user.id,
			{
				data: {
					timestamp: Date.now(),
				},
			},
			{ detach: true }
		);
	} catch (e) {
		user.is_following = false;
		--user.follower_count;
		throw e;
	}
}

export async function unfollowUser(user: User) {
	user.is_following = false;
	--user.follower_count;

	try {
		return await Api.sendRequest(
			'/web/profile/unfollow/' + user.id,
			{
				data: {
					timestamp: Date.now(),
				},
			},
			{ detach: true }
		);
	} catch (e) {
		user.is_following = true;
		++user.follower_count;
		throw e;
	}
}

export async function toggleUserFollow(
	user: User,
	location: UserFollowLocation
): Promise<boolean | null> {
	let failed = false,
		result: boolean | undefined = undefined;

	if (!user.is_following) {
		try {
			await followUser(user);
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext(`Something has prevented you from following this user.`));
		} finally {
			trackUserFollow(true, { failed, location });
		}
	} else {
		try {
			result = await ModalConfirm.show(
				$gettext(`Are you sure you want to unfollow this user?`),
				$gettext(`Unfollow user?`)
			);

			if (!result) {
				return null;
			}

			await unfollowUser(user);
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext(`For some reason we couldn't unfollow this user.`));
		} finally {
			// Finally is always triggered, even if you return early, so we
			// don't want to track if they canceled.
			if (result !== undefined) {
				trackUserFollow(false, { failed, location });
			}
		}
	}

	return !failed;
}

export function userCanAccessCreatorForm(user: User) {
	return (
		user.creator_status === CreatorStatusApplied ||
		user.creator_status === CreatorStatusCreator ||
		user.creator_status === CreatorStatusSuspended
	);
}
