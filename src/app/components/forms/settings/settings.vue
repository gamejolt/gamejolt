<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Watch } from 'vue-property-decorator';
import { ClientAutoStart } from '../../../../_common/client/safe-exports';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import {
	SettingAnimatedThumbnails,
	SettingAutostartClient,
	SettingBroadcastModal,
	SettingFeedNotifications,
	SettingGameInstallDir,
	SettingMaxDownloadCount,
	SettingMaxExtractCount,
	SettingQueueWhenPlaying,
	SettingRestrictedBrowsing,
	SettingThemeAlwaysOurs,
	SettingThemeDark,
} from '../../../../_common/settings/settings.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';

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

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormSettings extends mixins(Wrapper) {
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());

	get user() {
		return this.commonStore.user;
	}

	get canClientAutostart() {
		return ClientAutoStart?.canAutoStart;
	}

	get browserNotificationsDisabled() {
		return (Notification as any).permission === 'denied';
	}

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('restricted_browsing', SettingRestrictedBrowsing.get());
		this.setField('broadcast_modal', SettingBroadcastModal.get());
		this.setField('animated_thumbnails', SettingAnimatedThumbnails.get());
		this.setField('feed_notifications', SettingFeedNotifications.get());
		this.setField('theme_dark', SettingThemeDark.get());
		this.setField('theme_always_ours', SettingThemeAlwaysOurs.get());

		if (GJ_IS_DESKTOP_APP) {
			this.setField('game_install_dir', SettingGameInstallDir.get());
			this.setField('queue_when_playing', SettingQueueWhenPlaying.get());

			this.setField('max_download_count', SettingMaxDownloadCount.get());
			this.setField('limit_downloads', this.formModel.max_download_count !== -1);

			this.setField('max_extract_count', SettingMaxExtractCount.get());
			this.setField('limit_extractions', this.formModel.max_extract_count !== -1);

			if (this.canClientAutostart) {
				this.setField('autostart_client', SettingAutostartClient.get());
			}
		}
	}

	/**
	 * Just opens a file location dialog.
	 */
	changeLocation(ref: string) {
		const elem = this.$refs[ref];
		if (elem) {
			(elem as HTMLElement).click();
		}
	}

	onSelectedInstallDir(dir: string) {
		this.setField('game_install_dir', dir);
		this.onChange();
	}

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean) {
		this.setField(
			'max_download_count',
			shouldLimit ? SettingMaxDownloadCount.defaultValue : -1
		);
		this.onChange();
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean) {
		this.setField('max_extract_count', shouldLimit ? SettingMaxExtractCount.defaultValue : -1);
		this.onChange();
	}

	onChange() {
		SettingRestrictedBrowsing.set(this.formModel.restricted_browsing);
		SettingBroadcastModal.set(this.formModel.broadcast_modal);
		SettingAnimatedThumbnails.set(this.formModel.animated_thumbnails);
		SettingFeedNotifications.set(this.formModel.feed_notifications);
		SettingThemeDark.set(this.formModel.theme_dark);
		SettingThemeAlwaysOurs.set(this.formModel.theme_always_ours);

		this.themeStore.setDark(this.formModel.theme_dark);
		this.themeStore.setAlwaysOurs(this.formModel.theme_always_ours);

		if (GJ_IS_DESKTOP_APP) {
			SettingGameInstallDir.set(this.formModel.game_install_dir);
			SettingMaxDownloadCount.set(this.formModel.max_download_count);
			SettingMaxExtractCount.set(this.formModel.max_extract_count);
			SettingQueueWhenPlaying.set(this.formModel.queue_when_playing);

			if (ClientAutoStart && this.canClientAutostart) {
				SettingAutostartClient.set(this.formModel.autostart_client);

				if (this.formModel.autostart_client) {
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
}
</script>

<template>
	<AppForm :controller="form" @changed="onChange">
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
						<AppButton sm @click="changeLocation('game-install-dir')">
							<AppTranslate>Change Location</AppTranslate>
						</AppButton>
					</template>

					<div class="form-static">
						<code>{{ formModel.game_install_dir }}</code>
					</div>

					<p class="help-block">
						<AppTranslate>
							This is the directory on your computer that games will install into.
						</AppTranslate>
					</p>

					<input
						ref="game-install-dir"
						class="hidden"
						type="file"
						nwdirectory
						@change="onSelectedInstallDir($event.target.value)"
					/>

					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup
					:class="{ 'sans-margin-bottom': formModel.limit_downloads }"
					name="limit_downloads"
					:label="$gettext('Limit simultaneous downloads?')"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>
				</AppFormGroup>
				<br v-if="formModel.limit_downloads" />

				<AppFormGroup
					v-if="formModel.max_download_count !== -1"
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
					:class="{ 'sans-margin-bottom': formModel.limit_downloads }"
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
				<br v-if="formModel.limit_downloads" />

				<AppFormGroup
					v-if="formModel.max_extract_count !== -1"
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
