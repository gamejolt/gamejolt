<script lang="ts" setup>
import { arrayAssignAll } from '../../../utils/array';
import { Api } from '../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlToggle from '../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useAppStore } from '../../store/index';

const { filteredNotificationTypes, supportedNotificationTypes } = useAppStore();

type FormModel = Record<string, boolean>;

const emit = defineEmits({
	submit: () => true,
});

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		for (const key of supportedNotificationTypes.value) {
			form.formModel[key] = false;
		}

		for (const key of filteredNotificationTypes.value) {
			form.formModel[key] = true;
		}
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/activity/notification-feed-filters', form.formModel, {});
	},
	onSubmitSuccess() {
		const newNotificationTypes: string[] = [];

		for (const key in form.formModel) {
			if (form.formModel[key]) {
				newNotificationTypes.push(key);
			}
		}

		arrayAssignAll(filteredNotificationTypes.value, newNotificationTypes);
		emit('submit');
	},
});

const labels: Record<string, string> = {
	notify_comments: $gettext('Comments'),
	notify_mentions: $gettext('Mentions'),
	notify_friendship_accepted: $gettext('Friend Accepts'),
	notify_charged_sticker_received: $gettext('Charged Stickers'),
	notify_user_follows: $gettext('User Follows'),
	notify_quest_updates: $gettext('Quests'),
	notify_collaborator_invites: $gettext('Collaborator Invites'),
	notify_friendship_requests: $gettext('Friend Requests'),
	notify_content_featured: $gettext('Features'),
	notify_community_moderation: $gettext('Community Moderation'),
	notify_site_trophies_unlocked: $gettext('Site Trophies'),
	notify_game_trophies_unlocked: $gettext('Game Trophies'),
	notify_game_ratings: $gettext('Game Ratings'),
	notify_game_follows: $gettext('Game Follows'),
	notify_game_sales: $gettext('Game Sales'),
};

const descriptions: Record<string, string | null> = {
	notify_comments: null,
	notify_mentions: null,
	notify_friendship_accepted: null,
	notify_charged_sticker_received: null,
	notify_user_follows: null,
	notify_quest_updates: $gettext(
		'Sent when special quests are available, rewards are unlocked, meaningful progress has been made, etc.'
	),
	notify_collaborator_invites: $gettext(
		'Sent when another user has invited you to collaborate on something.'
	),
	notify_friendship_requests: null,
	notify_content_featured: $gettext('Some content you made got featured somewhere.'),
	notify_community_moderation: $gettext(
		'Sent when a moderation action was taken on your posts/firesides in a community.'
	),
	notify_site_trophies_unlocked: null,
	notify_game_trophies_unlocked: null,
	notify_game_ratings: null,
	notify_game_follows: null,
	notify_game_sales: $gettext("Sent when you made some 🅱️ＯＢＵＸ on a game you're selling."),
};

function labelForNotificationType(notificationType: string) {
	return labels[notificationType] ?? '???';
}

function descriptionForNotificationType(notificationType: string) {
	return descriptions[notificationType] ?? null;
}
</script>

<template>
	<AppForm :controller="form">
		<fieldset id="notification-filters">
			<legend>Filter Notifications</legend>
			<template v-for="(_, notificationType) of form.formModel" :key="notificationType">
				<AppFormGroup :name="notificationType" class="-notification-form-group">
					<template #label>
						<span class="-notification-form-group-label">
							<span>{{ labelForNotificationType(notificationType) }}</span>
							<AppJolticon
								v-if="descriptionForNotificationType(notificationType)"
								v-app-tooltip.touchable="
									descriptionForNotificationType(notificationType)
								"
								class="text-muted"
								icon="help-circle"
							/>
						</span>
					</template>

					<template #inline-control>
						<AppFormControlToggle />
					</template>
				</AppFormGroup>
			</template>
		</fieldset>

		<AppFormStickySubmit>
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>
</template>

<style lang="stylus" scoped>
#notification-filters legend
    font-weight: normal

.-notification-form-group
    margin-bottom: 0

    &-label
        font-weight: normal
        display: flex

        span
            margin-right: 3px
</style>
