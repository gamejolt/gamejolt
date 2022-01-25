<script lang="ts">
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
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="email_address">
			<app-form-control
				type="email"
				:validators="[
					validateMaxLength(200),
					validateAvailability({
						url: '/web/dash/email-preferences/check-field-availability/email_address',
						initVal: model.email_address,
					}),
				]"
				validate-on-blur
			/>
			<app-form-control-errors />
		</app-form-group>

		<hr />

		<div class="clearfix">
			<template v-if="!emailsDisabled">
				<app-button class="pull-right" trans @click="toggleEmails(false)">
					<translate>Turn off emails</translate>
				</app-button>
			</template>
			<template v-else>
				<div class="pull-left">
					<p>
						<app-jolticon icon="notice" notice />
						<translate>Emails are currently turned off.</translate>
					</p>
				</div>
				<app-button class="pull-right" primary solid @click="toggleEmails(true)">
					<translate>Turn on emails</translate>
				</app-button>
			</template>
		</div>

		<br />

		<app-loading-fade :is-loading="isTogglingEmails">
			<fieldset :disabled="emailsDisabled ? 'true' : undefined">
				<legend>
					<translate>Activity</translate>
				</legend>

				<p class="help-block">
					<translate>
						Let us know what kinds of activity you'd like to get emailed for.
					</translate>
				</p>

				<app-form-group name="notifications" hide-label optional>
					<div
						v-for="notificationType of notificationTypes"
						:key="notificationType.key"
						class="checkbox"
					>
						<label>
							<app-form-control-checkbox :value="notificationType.key" />

							{{ notificationType.label }}
						</label>
					</div>
				</app-form-group>
			</fieldset>

			<fieldset :disabled="emailsDisabled ? 'true' : undefined">
				<legend>
					<translate>Updates from Game Jolt</translate>
				</legend>

				<div class="form-horizontal">
					<app-form-group
						name="notify_gj_news"
						:label="$gettext(`News and product changes`)"
						label-class="col-sm-4"
						disabled
					>
						<div class="col-sm-8">
							<app-form-control-toggle :disabled="emailsDisabled" />
							<p class="help-block">
								<translate>
									Get emails about new features and changes to Game Jolt.
								</translate>
							</p>
						</div>
					</app-form-group>

					<app-form-group
						name="notify_gj_recommendations"
						:label="$gettext(`Suggestions and recommendations`)"
						label-class="col-sm-4"
					>
						<div class="col-sm-8">
							<app-form-control-toggle :disabled="emailsDisabled" />
							<p class="help-block">
								<translate>
									Get email recommendations about content on Game Jolt that we
									think you might like.
								</translate>
							</p>
						</div>
					</app-form-group>
				</div>
			</fieldset>
		</app-loading-fade>

		<div class="row">
			<div class="col-sm-8 col-sm-offset-4">
				<app-form-button>
					<translate>dash.email_prefs.submit_button</translate>
				</app-form-button>
			</div>
		</div>
	</app-form>
</template>
