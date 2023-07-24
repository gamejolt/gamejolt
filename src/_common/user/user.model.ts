import type { RouteLocationDefinition } from '../../utils/router';
import { trackUserFollow, UserFollowLocation } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { AvatarFrame } from '../avatar/frame.model';
import { CommentableModel } from '../comment/comment-model';
import { ContentContainerModel } from '../content/content-container-model';
import { ContentContext } from '../content/content-context';
import { ContentSetCache } from '../content/content-set-cache';
import { DogtagData } from '../dogtag/dogtag-data';
import { showErrorGrowl } from '../growls/growls.service';
import { MediaItem } from '../media-item/media-item-model';
import { ModalConfirm } from '../modal/confirm/confirm-service';
import { defineLegacyModel, Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Theme } from '../theme/theme.model';
import { $gettext } from '../translate/translate.service';
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

export const enum UserType {
	Gamer = 'User',
	Developer = 'Developer',
}

export const enum CreatorStatus {
	Creator = 1,
	Applied = 2,
	Suspended = 3,
}

export class User extends defineLegacyModel(
	class UserDefinition
		extends Model
		implements UserCommonFields, ContentContainerModel, CommentableModel
	{
		declare type: UserType;
		declare username: string;
		declare name: string;
		declare web_site: string;
		declare display_name: string;
		declare url: string;
		declare slug: string;
		declare img_avatar: string;
		declare dogtags?: DogtagData[];
		declare shouts_enabled: boolean;
		declare is_spawnday: boolean;

		declare status: number;
		declare permission_level: number;
		declare is_verified: boolean;
		declare is_partner: boolean | null;
		declare creator_status?: number;
		declare friend_requests_enabled: boolean;
		declare liked_posts_enabled?: boolean;
		declare mentions_setting?: number;

		declare created_on: number;

		declare theme: Theme | null;
		declare follower_count: number;
		declare following_count: number;
		declare comment_count: number;
		declare is_following?: boolean;
		declare follows_you?: boolean;
		declare is_blocked?: boolean;
		declare blocked_you?: boolean;

		// exp settings.
		declare level?: number;
		declare experience?: number;
		declare experience_next?: number;
		declare level_next_percentage?: number;

		// Profile settings.
		declare avatar_media_item?: MediaItem;
		declare header_media_item?: MediaItem;
		declare disable_gravatar?: boolean;
		declare avatar_frame?: AvatarFrame;

		declare bio_content: string;

		// Notifications settings.
		declare newsletter?: boolean;
		declare notify_shouts?: boolean;
		declare notify_comments?: boolean;
		declare notify_comment_replies?: boolean;
		declare notify_ratings?: boolean;
		declare notify_game_follows?: boolean;
		declare notify_user_follows?: boolean;
		declare notify_user_uploads?: boolean;
		declare notify_private_messages?: boolean;
		declare notify_friendships?: boolean;
		declare notify_forum_posts?: boolean;
		declare notify_followed_game_updates?: boolean;
		declare notify_sales?: boolean;
		declare notify_collaborator_invites?: boolean;
		declare notify_mentions?: boolean;
		declare notify_gj_news?: boolean;
		declare notify_gj_recommendations?: boolean;

		// Email settings
		declare email_address?: string;

		// Financials
		declare paypal_id?: string;
		declare paypal_email_address?: string;
		declare revenue_percentage?: number;
		declare revenue_payout_minimum?: number;
		declare revenue_wallet_maximum?: number;

		// Fireside.
		declare can_manage?: boolean;
		declare fireside_ga_tracking_id?: string;

		// Fireside profile
		declare fireside_profile?: string;
		declare compiled_fireside_profile?: string;
		declare fireside_about?: string;
		declare compiled_fireside_about?: string;

		// Card
		declare post_count?: number;
		declare game_count?: number;
		declare like_count?: number;

		is_gamer = false;
		is_developer = false;
		declare is_creator?: boolean;

		declare can_join_communities?: boolean;
		declare can_create_communities?: boolean;

		get isMod() {
			return this.permission_level >= 3;
		}

		get hasBio() {
			const cache = ContentSetCache.getCache(this, 'user-bio');
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

			if (this.type === UserType.Gamer) {
				this.is_gamer = true;
			} else if (this.type === UserType.Developer) {
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
) {}

export async function touchUser() {
	// We don't want to wait for the touch in Client since we know it gets loaded in
	// immediately.
	if (GJ_IS_DESKTOP_APP) {
		Api.sendRequest('/web/touch', null, { detach: true });
		return Promise.resolve();
	}

	return Api.sendRequest('/web/touch');
}

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
		user.creator_status === CreatorStatus.Applied ||
		user.creator_status === CreatorStatus.Creator ||
		user.creator_status === CreatorStatus.Suspended
	);
}
