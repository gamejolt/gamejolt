<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlCheckbox from '../../../../_common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { validateAvailability, validateMaxLength } from '../../../../_common/form-vue/validators';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';

type FormModel = User & {
	notifications: string[];
};
</script>

<script lang="ts" setup>
const props = defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
});

const { user } = toRefs(props);

const isTogglingEmails = ref(false);

const form: FormController<FormModel> = createForm({
	modelClass: User,
	model: user,
	saveMethod: '$saveEmailPreferences' as const,
	onInit() {
		const notifications = [];
		for (const i of notificationTypes.value) {
			if ((form.formModel as any)[i.key]) {
				notifications.push(i.key);
			}
		}
		form.formModel.notifications = notifications;
	},
	onBeforeSubmit() {
		for (const i of notificationTypes.value) {
			(form.formModel as any)[i.key] = form.formModel.notifications.indexOf(i.key) !== -1;
		}
	},
});

const notificationTypes = computed(() => {
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
});

const emailsDisabled = computed(() => {
	return user.value.newsletter === false;
});

async function toggleEmails(state: boolean) {
	isTogglingEmails.value = true;
	await user.value.$toggleEmails(state);
	isTogglingEmails.value = false;
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
						initVal: user.email_address,
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

				<AppFormGroup
					name="notify_gj_news"
					:label="$gettext(`News and product changes`)"
					disabled
				>
					<template #inline-control>
						<AppFormControlToggle :disabled="emailsDisabled" />
					</template>

					<p class="help-block">
						<AppTranslate>
							Get emails about new features and changes to Game Jolt.
						</AppTranslate>
					</p>
				</AppFormGroup>

				<AppFormGroup
					name="notify_gj_recommendations"
					:label="$gettext(`Suggestions and recommendations`)"
				>
					<template #inline-control>
						<AppFormControlToggle :disabled="emailsDisabled" />
					</template>

					<p class="help-block">
						<AppTranslate>
							Get email recommendations about content on Game Jolt that we think you
							might like.
						</AppTranslate>
					</p>
				</AppFormGroup>
			</fieldset>
		</AppLoadingFade>

		<AppFormStickySubmit>
			<AppFormButton>
				<AppTranslate>Save Profile</AppTranslate>
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>
</template>
