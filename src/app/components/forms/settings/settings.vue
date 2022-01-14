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
	<app-form :controller="form" @changed="onChange">
		<fieldset v-if="GJ_IS_DESKTOP_APP" id="settings-client">
			<legend>
				<translate>settings.client</translate>
			</legend>

			<app-form-group
				name="game_install_dir"
				:label="$gettext('settings.game_install_dir_label')"
			>
				<div class="pull-right">
					<app-button sm @click="changeLocation('game-install-dir')">
						<translate>settings.change_location_button</translate>
					</app-button>
				</div>

				<div class="form-static">
					<code>{{ formModel.game_install_dir }}</code>
				</div>

				<p class="help-block">
					<translate>settings.game_install_dir_help</translate>
				</p>

				<input
					ref="game-install-dir"
					class="hidden"
					type="file"
					nwdirectory
					@change="onSelectedInstallDir($event.target.value)"
				/>

				<app-form-control-errors />
			</app-form-group>

			<app-form-group
				:class="{ 'sans-margin-bottom': formModel.limit_downloads }"
				name="limit_downloads"
				:label="$gettext('settings.limit_downloads_label')"
			>
				<app-form-control-toggle class="pull-right" />
			</app-form-group>
			<br v-if="formModel.limit_downloads" />

			<app-form-group
				v-if="formModel.max_download_count !== -1"
				name="max_download_count"
				:label="$gettext('settings.max_download_count_label')"
				:hide-label="true"
			>
				<app-form-control type="number" :validators="[validateMinValue(1)]" />
				<p class="help-block">
					<translate>settings.max_download_count_help</translate>
				</p>
				<app-form-control-errors />
			</app-form-group>

			<app-form-group
				:class="{ 'sans-margin-bottom': formModel.limit_downloads }"
				name="limit_extractions"
				:label="$gettext('settings.limit_extractions_label')"
			>
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>settings.limit_extractions_help</translate>
				</p>
			</app-form-group>
			<br v-if="formModel.limit_downloads" />

			<app-form-group
				v-if="formModel.max_extract_count !== -1"
				name="max_extract_count"
				:label="$gettext('settings.max_extract_count_label')"
				:hide-label="true"
			>
				<app-form-control type="number" :validators="[validateMinValue(1)]" />
				<p class="help-block">
					<translate>settings.max_extract_count_help</translate>
				</p>
				<app-form-control-errors />
			</app-form-group>

			<app-form-group
				name="queue_when_playing"
				:label="$gettext('settings.queue_when_playing_label')"
			>
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>settings.queue_when_playing_help</translate>
				</p>
			</app-form-group>

			<app-form-group
				v-if="canClientAutostart"
				name="autostart_client"
				:label="$gettext('settings.autostart_client_label')"
			>
				<app-form-control-toggle class="pull-right" />
			</app-form-group>
		</fieldset>

		<fieldset id="settings-site">
			<legend>
				<translate>Site</translate>
			</legend>

			<app-form-group name="animated_thumbnails" :label="$gettext('Animated thumbnails?')">
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>
						Turning this off will show a static image instead of animated thumbnails.
					</translate>
				</p>
			</app-form-group>

			<app-form-group name="theme_dark" :label="$gettext('Dark mode?')">
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>Give your eyes a rest, come to the dark side!</translate>
				</p>
			</app-form-group>

			<app-form-group name="theme_always_ours" :label="$gettext('Always use your theme?')">
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>
						Don't switch to other themes when viewing profiles, games or communities.
					</translate>
				</p>
			</app-form-group>
		</fieldset>

		<fieldset id="settings-restrictions">
			<legend>
				<translate>Restrictions</translate>
			</legend>

			<app-form-group name="restricted_browsing" :label="$gettext('Restrict browsing?')">
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>
						This will block games that have a maturity rating of "Mature" and ask if
						you'd like to continue before showing the full page.
					</translate>
				</p>
			</app-form-group>
		</fieldset>

		<fieldset id="settings-notifications">
			<legend>
				<translate>Notifications</translate>
			</legend>

			<app-form-group name="feed_notifications" :label="$gettext('Feed notifications?')">
				<app-form-control-toggle
					class="pull-right"
					:disabled="browserNotificationsDisabled"
				/>
				<p class="help-block">
					<translate>
						We attempt to send you notifications as they happen. You can disable them
						here anytime.
					</translate>
				</p>
				<div v-if="browserNotificationsDisabled" class="alert">
					You've disabled this in your browser. If you'd like to get notifications, you'll
					have to give us permission within your browser first.
				</div>
			</app-form-group>

			<app-form-group name="broadcast_modal" :label="$gettext('Show broadcasts?')">
				<app-form-control-toggle class="pull-right" />
				<p class="help-block">
					<translate>
						With this on you will receive notifications of new site features that have
						been added since you last visited.
					</translate>
				</p>
			</app-form-group>
		</fieldset>
	</app-form>
</template>
