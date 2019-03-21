import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnBeforeSubmit, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import AppLoadingFade from 'game-jolt-frontend-lib/components/loading/fade/fade.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';


interface FormModel extends User {
	notifications: string[];
}

@Component({
	components: {
		AppFormControlToggle,
		AppLoadingFade,
	},
})
export default class FormEmailPreferences extends BaseForm<FormModel>
	implements FormOnInit, FormOnBeforeSubmit {
	modelClass = User as any;
	saveMethod: '$saveEmailPreferences' = '$saveEmailPreferences';

	isTogglingEmails = false;

	get notificationTypes() {
		return [
			{
				key: 'notify_user_follows',
				label: this.$gettext(`When someone follows you.`),
			},
			{
				key: 'notify_mentions',
				label: this.$gettext(`When you're mentioned through a @mention.`),
			},
			{
				key: 'notify_comment_replies',
				label: this.$gettext(`When someone replies to one of your comments.`),
			},
			{
				key: 'notify_followed_game_updates',
				label: this.$gettext(`New posts from stuff you follow.`),
			},
			{
				key: 'notify_friendships',
				label: this.$gettext(`When someone sends you a friend request.`),
			},
			{
				key: 'notify_private_messages',
				label: this.$gettext(`When someone sends you a private message.`),
			},
			{
				key: 'notify_comments',
				label: this.$gettext(`When someone comments on one of your games or posts.`),
			},
			{
				key: 'notify_ratings',
				label: this.$gettext(`When someone likes one of your games.`),
			},
			{
				key: 'notify_game_follows',
				label: this.$gettext(`When someone follows one of your games.`),
			},
			{
				key: 'notify_sales',
				label: this.$gettext(`When someone buys one of your games.`),
			},
			{
				key: 'notify_collaborator_invites',
				label: this.$gettext(`When you're invited to collaborate on a game.`),
			},
			{
				key: 'notify_forum_posts',
				label: this.$gettext(`When someone replies to a forum topic you're following.`),
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
