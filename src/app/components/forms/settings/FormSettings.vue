<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { ClientAutoStart } from '../../../../_common/client/safe-exports';
import AppForm, { FormController, createForm } from '../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { validateMinValue } from '../../../../_common/form-vue/validators';
import {
	SettingAnimatedThumbnails,
	SettingAutostartClient,
	SettingBroadcastModal,
	SettingFeedNotifications,
	SettingGameInstallDir,
	SettingMaxDownloadCount,
	SettingMaxExtractCount,
	SettingParallaxBackgrounds,
	SettingQueueWhenPlaying,
	SettingRestrictedBrowsing,
	SettingThemeAlwaysOurs,
	SettingThemeDark,
} from '../../../../_common/settings/settings.service';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

type FormModel = {
	chat_notify_friends_online: boolean;
	restricted_browsing: boolean;
	broadcast_modal: boolean;
	animated_thumbnails: boolean;
	feed_notifications: boolean;
	game_install_dir: string;
	queue_when_playing: boolean;
	max_download_count: number;
	limit_downloads: boolean;
	max_extract_count: number;
	limit_extractions: boolean;
	autostart_client: boolean;
	theme_dark: boolean;
	theme_always_ours: boolean;
	sticker_sounds: boolean;
};

const { setDark, setAlwaysOurs } = useThemeStore();

const gameInstallDir = ref<HTMLInputElement>();

const canClientAutostart = computed(() => ClientAutoStart?.canAutoStart);
const browserNotificationsDisabled = computed(() => (Notification as any).permission === 'denied');

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		form.formModel['restricted_browsing'] = SettingRestrictedBrowsing.get();
		form.formModel['broadcast_modal'] = SettingBroadcastModal.get();
		form.formModel['animated_thumbnails'] = SettingAnimatedThumbnails.get();
		form.formModel['parallax_backgrounds'] = SettingParallaxBackgrounds.get();
		form.formModel['feed_notifications'] = SettingFeedNotifications.get();
		form.formModel['theme_dark'] = SettingThemeDark.get();
		form.formModel['theme_always_ours'] = SettingThemeAlwaysOurs.get();

		if (GJ_IS_DESKTOP_APP) {
			form.formModel['game_install_dir'] = SettingGameInstallDir.get();
			form.formModel['queue_when_playing'] = SettingQueueWhenPlaying.get();

			form.formModel['max_download_count'] = SettingMaxDownloadCount.get();
			form.formModel['limit_downloads'] = form.formModel.max_download_count !== -1;

			form.formModel['max_extract_count'] = SettingMaxExtractCount.get();
			form.formModel['limit_extractions'] = form.formModel.max_extract_count !== -1;

			if (canClientAutostart.value) {
				form.formModel['autostart_client'] = SettingAutostartClient.get();
			}
		}
	},
	onChange() {
		_onChange();
	},
});

function _onChange() {
	SettingRestrictedBrowsing.set(form.formModel.restricted_browsing);
	SettingBroadcastModal.set(form.formModel.broadcast_modal);
	SettingAnimatedThumbnails.set(form.formModel.animated_thumbnails);
	SettingParallaxBackgrounds.set(form.formModel.parallax_backgrounds);
	SettingFeedNotifications.set(form.formModel.feed_notifications);
	SettingThemeDark.set(form.formModel.theme_dark);
	SettingThemeAlwaysOurs.set(form.formModel.theme_always_ours);

	setDark(form.formModel.theme_dark);
	setAlwaysOurs(form.formModel.theme_always_ours);

	if (GJ_IS_DESKTOP_APP) {
		SettingGameInstallDir.set(form.formModel.game_install_dir);
		SettingMaxDownloadCount.set(form.formModel.max_download_count);
		SettingMaxExtractCount.set(form.formModel.max_extract_count);
		SettingQueueWhenPlaying.set(form.formModel.queue_when_playing);

		if (ClientAutoStart && canClientAutostart.value) {
			SettingAutostartClient.set(form.formModel.autostart_client);

			if (form.formModel.autostart_client) {
				ClientAutoStart.set();
			} else {
				ClientAutoStart.clear();
			}
		}

		// TODO(vue3)
		// Tell's it to use the new settings.
		// this.$store.commit('clientLibrary/checkQueueSettings');
	}
}

/**
 * Just opens a file location dialog.
 */
function changeLocation(elem: HTMLInputElement | undefined) {
	elem?.click();
}

function onSelectedInstallDir(event: InputEvent) {
	const dir: string = (event.target as any).value;
	form.formModel['game_install_dir'] = dir;
	_onChange();
}

watch(
	() => form.formModel.limit_downloads,
	shouldLimit => {
		form.formModel['max_download_count'] = shouldLimit
			? SettingMaxDownloadCount.defaultValue
			: -1;

		_onChange();
	}
);

watch(
	() => form.formModel.limit_extractions,
	shouldLimit => {
		form.formModel['max_extract_count'] = shouldLimit
			? SettingMaxExtractCount.defaultValue
			: -1;

		_onChange();
	}
);
</script>

<template>
	<AppForm :controller="form">
		<template v-if="GJ_IS_DESKTOP_APP">
			<fieldset id="settings-client">
				<legend>
					<AppTranslate>Client</AppTranslate>
				</legend>

				<AppFormGroup
					name="game_install_dir"
					:label="$gettext('Installed Games Directory')"
				>
					<template #inline-control>
						<AppButton sm @click="changeLocation(gameInstallDir)">
							<AppTranslate>Change Location</AppTranslate>
						</AppButton>
					</template>

					<div class="form-static">
						<code>{{ form.formModel.game_install_dir }}</code>
					</div>

					<p class="help-block">
						<AppTranslate>
							This is the directory on your computer that games will install into.
						</AppTranslate>
					</p>

					<input
						ref="gameInstallDir"
						class="hidden"
						type="file"
						nwdirectory
						@change="onSelectedInstallDir"
					/>

					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup
					:class="{ 'sans-margin-bottom': form.formModel.limit_downloads }"
					name="limit_downloads"
					:label="$gettext('Limit simultaneous downloads?')"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>
				</AppFormGroup>
				<br v-if="form.formModel.limit_downloads" />

				<AppFormGroup
					v-if="form.formModel.max_download_count !== -1"
					name="max_download_count"
					:label="$gettext('Max # of Simultaneous Downloads')"
					:hide-label="true"
				>
					<AppFormControl type="number" :validators="[validateMinValue(1)]" />
					<p class="help-block">
						<AppTranslate>
							If you have more than this number, downloads will be queued up.
						</AppTranslate>
					</p>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup
					:class="{ 'sans-margin-bottom': form.formModel.limit_downloads }"
					name="limit_extractions"
					:label="$gettext('Limit simultaneous extractions?')"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>
					<p class="help-block">
						<AppTranslate>
							An extraction is when the game is unpacked and installed after
							downloading.
						</AppTranslate>
					</p>
				</AppFormGroup>
				<br v-if="form.formModel.limit_downloads" />

				<AppFormGroup
					v-if="form.formModel.max_extract_count !== -1"
					name="max_extract_count"
					:label="$gettext('Max # of Simultaneous Extractions')"
					:hide-label="true"
				>
					<AppFormControl type="number" :validators="[validateMinValue(1)]" />
					<p class="help-block">
						<AppTranslate>
							If you have more than this number, extractions will be queued up.
						</AppTranslate>
					</p>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="queue_when_playing" :label="$gettext('Pause when playing?')">
					<template #inline-control>
						<AppFormControlToggle />
					</template>
					<p class="help-block">
						<AppTranslate>
							Should we pause all game installs and updates when you're playing a
							game?
						</AppTranslate>
					</p>
				</AppFormGroup>

				<AppFormGroup
					v-if="canClientAutostart"
					name="autostart_client"
					:label="$gettext('Start when Windows starts?')"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>
				</AppFormGroup>
			</fieldset>

			<hr class="fieldset-divider" />
		</template>

		<fieldset id="settings-site">
			<legend>
				<AppTranslate>Site</AppTranslate>
			</legend>

			<AppFormGroup name="animated_thumbnails" :label="$gettext('Animated thumbnails?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>
						Turning this off will show a static image instead of animated thumbnails.
					</AppTranslate>
				</p>
			</AppFormGroup>

			<AppFormGroup name="parallax_backgrounds" :label="$gettext('Parallax backgrounds?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>
						Turning this off will disable the parallax effect on background images while
						scrolling.
					</AppTranslate>
				</p>
			</AppFormGroup>

			<AppFormGroup name="theme_dark" :label="$gettext('Dark mode?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>Give your eyes a rest, come to the dark side!</AppTranslate>
				</p>
			</AppFormGroup>

			<AppFormGroup name="theme_always_ours" :label="$gettext('Always use your theme?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>
						Don't switch to other themes when viewing profiles, games or communities.
					</AppTranslate>
				</p>
			</AppFormGroup>
		</fieldset>

		<hr class="fieldset-divider" />

		<fieldset id="settings-restrictions">
			<legend>
				<AppTranslate>Restrictions</AppTranslate>
			</legend>

			<AppFormGroup name="restricted_browsing" :label="$gettext('Restrict browsing?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>
						This will block games that have a maturity rating of "Mature" and ask if
						you'd like to continue before showing the full page.
					</AppTranslate>
				</p>
			</AppFormGroup>
		</fieldset>

		<hr class="fieldset-divider" />

		<fieldset id="settings-notifications">
			<legend>
				<AppTranslate>Notifications</AppTranslate>
			</legend>

			<AppFormGroup name="feed_notifications" :label="$gettext('Feed notifications?')">
				<template #inline-control>
					<AppFormControlToggle :disabled="browserNotificationsDisabled" />
				</template>
				<p class="help-block">
					<AppTranslate>
						We attempt to send you notifications as they happen. You can disable them
						here anytime.
					</AppTranslate>
				</p>
				<div v-if="browserNotificationsDisabled" class="alert">
					You've disabled this in your browser. If you'd like to get notifications, you'll
					have to give us permission within your browser first.
				</div>
			</AppFormGroup>

			<AppFormGroup name="broadcast_modal" :label="$gettext('Show broadcasts?')">
				<template #inline-control>
					<AppFormControlToggle />
				</template>
				<p class="help-block">
					<AppTranslate>
						With this on you will receive notifications of new site features that have
						been added since you last visited.
					</AppTranslate>
				</p>
			</AppFormGroup>
		</fieldset>
	</AppForm>
</template>
