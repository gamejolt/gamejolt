import { mixins, Options } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../_common/form-vue/form.service';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';

interface FormModel extends User {
	notifications: string[];
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
		AppLoadingFade,
	},
})
export default class FormEmailPreferences extends mixins(Wrapper) implements FormOnBeforeSubmit {
	modelClass = User as any;
	saveMethod = '$saveEmailPreferences' as const;

	isTogglingEmails = false;

	get notificationTypes() {
		return [
			{
				key: 'notify_user_follows',
				label: $gettext(`When someone follows you.`),
			},
			{
				key: 'notify_mentions',
				label: $gettext(`When you're mentioned through a @mention.`),
			},
			{
				key: 'notify_comment_replies',
				label: $gettext(`When someone replies to one of your comments.`),
			},
			{
				key: 'notify_followed_game_updates',
				label: $gettext(`New posts from stuff you follow.`),
			},
			{
				key: 'notify_friendships',
				label: $gettext(`When someone sends you a friend request.`),
			},
			{
				key: 'notify_private_messages',
				label: $gettext(`When someone sends you a private message.`),
			},
			{
				key: 'notify_comments',
				label: $gettext(`When someone comments on one of your games or posts.`),
			},
			{
				key: 'notify_ratings',
				label: $gettext(`When someone likes one of your games.`),
			},
			{
				key: 'notify_game_follows',
				label: $gettext(`When someone follows one of your games.`),
			},
			{
				key: 'notify_sales',
				label: $gettext(`When someone buys one of your games.`),
			},
			{
				key: 'notify_collaborator_invites',
				label: $gettext(`When you're invited to collaborate on a game.`),
			},
			{
				key: 'notify_forum_posts',
				label: $gettext(`When someone replies to a forum topic you're following.`),
			},
		];
	}

	get emailsDisabled() {
		return this.model!.newsletter === false;
	}

	onInit() {
		const notifications = [];
		for (const i of this.notificationTypes) {
			if ((this.formModel as any)[i.key]) {
				notifications.push(i.key);
			}
		}
		this.setField('notifications', notifications);
	}

	onBeforeSubmit() {
		for (const i of this.notificationTypes) {
			this.setField(i.key as any, this.formModel.notifications.indexOf(i.key) !== -1);
		}
	}

	async toggleEmails(state: boolean) {
		this.isTogglingEmails = true;
		await this.model!.$toggleEmails(state);
		this.isTogglingEmails = false;
	}
}
