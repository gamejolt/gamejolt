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
	<AppForm :controller="form">
		<AppFormGroup name="email_address">
			<AppFormControl
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
			<AppFormControlErrors />
		</AppFormGroup>

		<hr />

		<div class="clearfix">
			<template v-if="!emailsDisabled">
				<AppButton class="pull-right" trans @click="toggleEmails(false)">
					<AppTranslate>Turn off emails</AppTranslate>
				</AppButton>
			</template>
			<template v-else>
				<div class="pull-left">
					<p>
						<AppJolticon icon="notice" notice />
						<AppTranslate>Emails are currently turned off.</AppTranslate>
					</p>
				</div>
				<AppButton class="pull-right" primary solid @click="toggleEmails(true)">
					<AppTranslate>Turn on emails</AppTranslate>
				</AppButton>
			</template>
		</div>

		<br />

		<AppLoadingFade :is-loading="isTogglingEmails">
			<fieldset :disabled="emailsDisabled ? 'true' : undefined">
				<legend>
					<AppTranslate>Activity</AppTranslate>
				</legend>

				<p class="help-block">
					<AppTranslate>
						Let us know what kinds of activity you'd like to get emailed for.
					</AppTranslate>
				</p>

				<AppFormGroup name="notifications" hide-label optional>
					<div
						v-for="notificationType of notificationTypes"
						:key="notificationType.key"
						class="checkbox"
					>
						<label>
							<AppFormControlCheckbox :value="notificationType.key" />

							{{ notificationType.label }}
						</label>
					</div>
				</AppFormGroup>
			</fieldset>

			<fieldset :disabled="emailsDisabled ? 'true' : undefined">
				<legend>
					<AppTranslate>Updates from Game Jolt</AppTranslate>
				</legend>

				<div class="form-horizontal">
					<AppFormGroup
						name="notify_gj_news"
						:label="$gettext(`News and product changes`)"
						label-class="col-sm-4"
						disabled
					>
						<div class="col-sm-8">
							<AppFormControlToggle :disabled="emailsDisabled" />
							<p class="help-block">
								<AppTranslate>
									Get emails about new features and changes to Game Jolt.
								</AppTranslate>
							</p>
						</div>
					</AppFormGroup>

					<AppFormGroup
						name="notify_gj_recommendations"
						:label="$gettext(`Suggestions and recommendations`)"
						label-class="col-sm-4"
					>
						<div class="col-sm-8">
							<AppFormControlToggle :disabled="emailsDisabled" />
							<p class="help-block">
								<AppTranslate>
									Get email recommendations about content on Game Jolt that we
									think you might like.
								</AppTranslate>
							</p>
						</div>
					</AppFormGroup>
				</div>
			</fieldset>
		</AppLoadingFade>

		<div class="row">
			<div class="col-sm-8 col-sm-offset-4">
				<AppFormButton>
					<AppTranslate>dash.email_prefs.submit_button</AppTranslate>
				</AppFormButton>
			</div>
		</div>
	</AppForm>
</template>
