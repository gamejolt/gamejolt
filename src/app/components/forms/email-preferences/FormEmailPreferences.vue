<script lang="ts">
import { computed, type Ref, ref, toRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '~common/form-vue/AppFormStickySubmit.vue';
import AppFormControlCheckbox from '~common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import { validateAvailability, validateMaxLength } from '~common/form-vue/validators';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoadingFade from '~common/loading/AppLoadingFade.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import {
	$saveUserEmailPreferences,
	$toggleUserEmails,
	UserModel,
} from '~common/user/user.model';

type FormModel = UserModel & {
	notifications: string[];
};
</script>

<script lang="ts" setup>
type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const userRef = toRef(() => user);

const isTogglingEmails = ref(false);

const form: FormController<FormModel> = createForm<FormModel>({
	modelClass: UserModel as any,
	modelSaveHandler: $saveUserEmailPreferences,
	model: userRef as Ref<FormModel | undefined>,
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
	return user.newsletter === false;
});

async function toggleEmails(state: boolean) {
	isTogglingEmails.value = true;
	await $toggleUserEmails(user, state);
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

				<AppFormGroup name="notify_gj_news" :label="$gettext(`News and product changes`)">
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
