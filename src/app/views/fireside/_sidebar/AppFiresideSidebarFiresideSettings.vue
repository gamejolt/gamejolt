<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { Background } from '../../../../_common/background/background.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Community } from '../../../../_common/community/community.model';
import { FiresideChatSettings } from '../../../../_common/fireside/chat/chat-settings.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FIRESIDE_ROLES } from '../../../../_common/fireside/role/role.model';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlBackground from '../../../../_common/form-vue/controls/AppFormControlBackground.vue';
import AppFormControlToggleButton from '../../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButton.vue';
import AppFormControlToggleButtonGroup from '../../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButtonGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../../_common/form-vue/validators';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
extinguishFireside,
publishFireside,
useFiresideController
} from '../../../components/fireside/controller/controller';
import { ChatCommandsModal } from '../../../components/forms/chat/commands/modal/modal.service';
import { ChatModsModal } from '../../../components/forms/chat/mods/modal/modal.service';
import { ChatTimersModal } from '../../../components/forms/chat/timers/modal/modal.service';
import { FiresideHostsModal } from '../../../components/forms/fireside/hosts/modal/modal.service';
import AppPostTargets from '../../../components/post/AppPostTargets.vue';
import AppFiresideShare from '../AppFiresideShare.vue';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const { user } = useCommonStore();
const c = useFiresideController()!;
const {
	fireside,
	chatSettings,
	chatRoom,
	hostBackgrounds,
	gridChannel,
	isStreaming,
	isOwner,
	canEdit,
	canStream,
	canPublish,
	canExtinguish,
	canReport,
} = c;

const selectedCommunities = ref<{ community: Community }[]>([]);
const targetableCommunities = computed(() => selectedCommunities.value.map(i => i.community));
const selectedRealms = ref<Realm[]>([]);
const maxRealms = ref(5);

const form: FormController<Fireside> = createForm({
	warnOnDiscard: false,
	modelClass: Fireside,
	// Just wrapping in a ref to make the form happy. It never actually changes.
	model: ref(fireside),
	loadUrl: `/web/dash/fireside/save/${fireside.hash}`,
	onLoad: response => {
		maxRealms.value = response.maxRealms;
	},
	onInit: () => {
		selectedCommunities.value = fireside.community_links.map(i => {
			return { community: i.community };
		});
		selectedRealms.value = fireside.realms.map(i => i.realm);
	},
	onSubmit: () => form.formModel.$saveWithRealms(selectedRealms.value.map(i => i.id)),
	onSubmitSuccess: () => {
		fireside.assign(form.formModel);
	},
});

function attachRealm(realm: Realm, append = true) {
	// Do nothing if that realm is already attached.
	if (selectedRealms.value.find(i => i.id === realm.id)) {
		return;
	}

	if (append) {
		selectedRealms.value.push(realm);
	} else {
		selectedRealms.value.unshift(realm);
	}
	form.changed = true;
}

function removeRealm(realm: Realm) {
	const removed = arrayRemove(selectedRealms.value, i => i.id === realm.id, {
		onMissing: () => console.warn('Attempted to remove a realm that is not attached');
	});

	if (removed.length) {
		form.changed = true;
	}
}

const settingsForm: FormController<FiresideChatSettings> = createForm({
	warnOnDiscard: false,
	modelClass: FiresideChatSettings,
	model: chatSettings,
	loadUrl: computed(() => {
		// Only load this form if we have permissions to edit the fireside.
		if (!canEdit.value) {
			return undefined;
		}
		return `/web/dash/fireside/chat-settings/${fireside.hash}`;
	}),
	onLoad(payload) {
		chatSettings.value.assign(payload.settings);
		settingsForm.formModel.assign(payload.settings);
	},
	onSubmit: () => gridChannel.value!.pushUpdateChatSettings(settingsForm.formModel),
	onSubmitSuccess(response) {
		// Update our form model. The base model will update through a grid
		// message.
		settingsForm.formModel.assign(response);
	},
});

// If anyone else modifies the chat settings, let's sync it back to our form as
// well. This should only really occur if they do it in another tab or client.
watch(chatSettings, () => settingsForm.formModel.assign(chatSettings.value), { deep: true });

const backgrounds = ref<Background[]>([]);
const backgroundForm: FormController<{ background_id?: number }> = createForm({
	warnOnDiscard: false,
	loadUrl: computed(() => {
		// Only load this form if we have permissions to edit the fireside.
		if (!canStream.value) {
			return undefined;
		}
		return `/web/fireside/backgrounds/${fireside.hash}`;
	}),
	onLoad(payload) {
		backgrounds.value = Background.populate(payload.backgrounds);
		backgroundForm.formModel.background_id = payload.currentBackgroundId || undefined;
	},
	async onSubmit() {
		return gridChannel.value!.pushUpdateHost({
			backgroundId: backgroundForm.formModel.background_id,
		});
	},
	onSubmitSuccess(response) {
		// Update our form model. The base model will update through a grid
		// message. When it gets synced through grid it'll also apply to the
		// form just in case through the watch below.
		backgroundForm.formModel.background_id = response.background?.id || undefined;
	},
});

// Sync the background if they've changed it from another tab.
watchEffect(() => {
	if (!user.value) {
		return;
	}

	const current = hostBackgrounds.value.get(user.value.id);
	backgroundForm.formModel.background_id = current ? current.id : undefined;
});

watch([canEdit, canStream], (value, oldValue) => {
	const needsReload = (value[0] && !oldValue[0]) || (value[1] && !oldValue[1]);

	if (needsReload) {
		settingsForm.reload();
		backgroundForm.reload();
	}
});

const settingsRoleOptions = computed<{ label: string; value: FIRESIDE_ROLES | null }[]>(() => [
	{ label: $gettext('Owner only'), value: 'host' },
	{ label: $gettext('Hosts only'), value: 'cohost' },
	{ label: $gettext('Everyone'), value: 'audience' },
]);

function onClickReport() {
	ReportModal.show(fireside);
}

function onClickPublish() {
	publishFireside(c, 'fireside-settings');
}

function onClickExtinguish() {
	extinguishFireside(c, 'fireside-settings');
}

function onClickChatCommands() {
	ChatCommandsModal.show();
}

function onClickChatTimers() {
	ChatTimersModal.show();
}

function onClickHosts() {
	FiresideHostsModal.show({ controller: c });
}

function onClickChatMods() {
	if (chatRoom.value) {
		ChatModsModal.show({
			chatRoom: chatRoom.value,
			hasCurrentMods: true,
			initialSection: 'currentMods',
		});
	}
}
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading>
				{{ $gettext(`Fireside settings`) }}
			</AppFiresideSidebarHeading>
		</template>

		<template #body>
			<AppScrollScroller class="-pad-v">
				<div class="-pad-h">
					<template v-if="isOwner">
						<div class="-icon-buttons">
							<a class="-icon-button" @click="onClickChatCommands">
								<AppJolticon class="-icon-button-icon" icon="wand" />
								<div class="-icon-button-label">
									{{ $gettext(`Chat commands`) }}
								</div>
							</a>

							<a class="-icon-button" @click="onClickChatTimers">
								<AppJolticon class="-icon-button-icon" icon="timer" />
								<div class="-icon-button-label">
									{{ $gettext(`Chat timers`) }}
								</div>
							</a>
						</div>

						<AppSpacer vertical :scale="8" />

						<div class="-icon-buttons">
							<a class="-icon-button" @click="onClickHosts">
								<AppJolticon class="-icon-button-icon" icon="friend-add-2" />
								<div class="-icon-button-label">
									{{ $gettext(`Manage hosts`) }}
								</div>
							</a>

							<a
								v-if="chatRoom && chatRoom.canElectModerators"
								class="-icon-button"
								@click="onClickChatMods"
							>
								<AppJolticon class="-icon-button-icon" icon="user-messages" />
								<div class="-icon-button-label">
									{{ $gettext(`Chat moderators`) }}
								</div>
							</a>
						</div>
					</template>

					<!-- Shown to guests and chat mods (since they can't do anything yet) -->
					<AppFiresideShare v-if="!canStream" class="-share" primary />

					<template v-if="canStream">
						<hr />

						<!-- This is where we show the share widget for people that can stream -->
						<AppFiresideShare class="-share" primary />

						<AppSpacer vertical :scale="6" />
					</template>

					<template v-if="canEdit">
						<AppForm :controller="form">
							<AppFormGroup
								name="title"
								class="sans-margin-bottom"
								:label="$gettext(`Fireside Name`)"
								small
							>
								<AppFormControl
									type="text"
									:validators="[validateMinLength(4), validateMaxLength(100)]"
									validate-on-blur
									focus
								/>

								<AppFormControlErrors />
							</AppFormGroup>

							<AppSpacer vertical :scale="6" />

							<AppFormGroup
								name="targetables"
								class="sans-margin-bottom"
								:label="$gettext(`Tagged to`)"
								small
							>
								<AppPostTargets
									:communities="selectedCommunities"
									:max-communities="1"
									:realms="selectedRealms"
									:max-realms="maxRealms"
									:targetable-communities="targetableCommunities"
									can-add-realm
									can-remove-realms
									no-community-channels
									@remove-realm="removeRealm"
									@select-realm="attachRealm"
								/>
							</AppFormGroup>

							<AppSpacer vertical :scale="6" />

							<AppFormStickySubmit>
								<AppFormButton>
									{{ $gettext(`Save`) }}
								</AppFormButton>
							</AppFormStickySubmit>
						</AppForm>
					</template>

					<AppForm
						v-if="canStream"
						:controller="backgroundForm"
						:forced-is-loading="backgroundForm.isProcessing ? true : undefined"
						@changed="backgroundForm.submit"
					>
						<template v-if="backgrounds.length || !backgroundForm.isLoaded">
							<AppFormGroup
								name="background_id"
								class="sans-margin-bottom"
								:label="$gettext(`Background`)"
								optional
								small
							>
								<AppFormControlBackground
									:backgrounds="backgrounds"
									:tile-size="40"
								/>
							</AppFormGroup>

							<p class="help-block sans-margin">
								{{
									$gettext(
										`This is the background we'll show to viewers when they focus your stream.`
									)
								}}
							</p>

							<AppSpacer vertical :scale="6" />
						</template>
					</AppForm>

					<template v-if="canEdit">
						<hr class="sans-margin-top" />

						<AppForm
							:controller="settingsForm"
							:forced-is-loading="settingsForm.isProcessing ? true : undefined"
							@changed="settingsForm.submit"
						>
							<AppFormGroup
								name="allow_images"
								class="sans-margin-bottom"
								:label="$gettext(`Allow images in fireside chat`)"
								small
							>
								<AppFormControlToggleButtonGroup>
									<AppFormControlToggleButton
										v-for="{ label, value } of settingsRoleOptions"
										:key="label"
										:value="value"
									>
										{{ label }}
									</AppFormControlToggleButton>
								</AppFormControlToggleButtonGroup>
							</AppFormGroup>

							<AppSpacer vertical :scale="6" />

							<AppFormGroup
								name="allow_gifs"
								class="sans-margin-bottom"
								:label="$gettext(`Allow GIFs in fireside chat`)"
								small
							>
								<AppFormControlToggleButtonGroup>
									<AppFormControlToggleButton
										v-for="{ label, value } of settingsRoleOptions"
										:key="label"
										:value="value"
									>
										{{ label }}
									</AppFormControlToggleButton>
								</AppFormControlToggleButtonGroup>
							</AppFormGroup>

							<AppSpacer vertical :scale="6" />

							<AppFormGroup
								name="allow_links"
								class="sans-margin-bottom"
								:label="$gettext(`Allow links in fireside chat`)"
								small
							>
								<AppFormControlToggleButtonGroup>
									<AppFormControlToggleButton
										v-for="{ label, value } of settingsRoleOptions"
										:key="label"
										:value="value"
									>
										{{ label }}
									</AppFormControlToggleButton>
								</AppFormControlToggleButtonGroup>
							</AppFormGroup>
						</AppForm>
					</template>
				</div>
			</AppScrollScroller>
		</template>

		<template #footer>
			<div v-if="canPublish || canExtinguish || canReport" class="-pad-h -pad-v">
				<AppButton
					v-if="canPublish"
					v-app-tooltip="
						isStreaming
							? undefined
							: $gettext(`Firesides need someone to be streaming to go public!`)
					"
					icon="megaphone"
					primary
					solid
					block
					:disabled="!isStreaming"
					@click="onClickPublish"
				>
					{{ $gettext(`Make fireside public`) }}
				</AppButton>

				<AppButton
					v-if="canExtinguish"
					icon="remove"
					icon-color="notice"
					block
					@click="onClickExtinguish"
				>
					{{ $gettext(`Extinguish fireside`) }}
				</AppButton>

				<AppButton v-if="canReport" icon="flag" trans block @click="onClickReport()">
					{{ $gettext(`Report fireside`) }}
				</AppButton>
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-pad-h
	padding-left: 16px
	padding-right: 16px

.-pad-v
	padding-top: 16px
	padding-bottom: 16px

hr
	margin: 24px 0

.-icon-buttons
	display: flex
	flex-direction: row

.-icon-button
	pressy()
	flex: 1
	display: flex
	gap: 12px
	flex-direction: column
	align-items: center
	text-align: center
	color: var(--theme-fg)

	&:hover
		color: var(--theme-primary)

.-icon-button-label
	font-size: $font-size-small
	font-weight: bold

.-icon-button-icon
	font-size: 30px
</style>
