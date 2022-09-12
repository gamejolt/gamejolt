<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Background } from '../../../../_common/background/background.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import { FiresideChatSettings } from '../../../../_common/fireside/chat-settings/chat-settings.model';
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
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	extinguishFireside,
	publishFireside,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import AppFiresideShare from '../AppFiresideShare.vue';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeadingCollapse from './AppFiresideSidebarHeadingCollapse.vue';

const c = useFiresideController()!;
const {
	fireside,
	chatSettings,
	gridChannel,
	isStreaming,
	canEdit,
	canStream,
	canPublish,
	canExtinguish,
	canReport,
	sidebar,
} = c;

const backgrounds = ref<Background[]>([]);

const form: FormController<Fireside> = createForm({
	warnOnDiscard: false,
	modelClass: Fireside,
	// Just wrapping in a ref to make the form happy. It never actually changes.
	model: ref(fireside),
});

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
		backgroundForm.formModel.background_id = payload.currentBackgroundId;
		backgrounds.value = Background.populate(payload.backgrounds);
	},
	onSubmit() {
		return gridChannel.value!.pushUpdateHostBackground(backgroundForm.formModel.background_id!);
	},
	onSubmitSuccess(response) {
		// TODO(fireside-host-backgrounds) Check response, update form model
		// with new background_id value.
		const id = response.background ? response.background.id : response.background_id;
		// Update our form model. The base model will update through a grid
		// message.
		backgroundForm.formModel.background_id = id;
	},
});

// If anyone else modifies the chat settings, let's sync it back to our form as
// well. This should only really occur if they do it in another tab or client.
watch(chatSettings, () => settingsForm.formModel.assign(chatSettings.value), { deep: true });

watch(canEdit, (value, oldValue) => {
	if (value && !oldValue) {
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
	publishFireside(c);
}

function onClickExtinguish() {
	extinguishFireside(c);
}
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppHeaderBar :elevation="2" :defined-slots="['leading', 'title', 'actions']">
				<template #leading>
					<AppButton circle sparse trans icon="chevron-left" @click="sidebar = 'chat'" />
				</template>

				<template #title>
					<AppTranslate>Fireside Settings</AppTranslate>
				</template>

				<template #actions>
					<AppFiresideSidebarHeadingCollapse />
				</template>
			</AppHeaderBar>
		</template>

		<template #body>
			<AppScrollScroller class="-pad-v">
				<div class="-pad-h">
					<template v-if="canStream">
						<AppButton block @click="sidebar = 'stream-settings'">
							<AppTranslate>Stream settings</AppTranslate>
						</AppButton>
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

							<AppFormStickySubmit>
								<AppFormButton>
									<AppTranslate>Save</AppTranslate>
								</AppFormButton>
							</AppFormStickySubmit>
						</AppForm>

						<AppForm
							:controller="backgroundForm"
							:forced-is-loading="backgroundForm.isProcessing ? true : undefined"
							@changed="backgroundForm.submit"
						>
							<template v-if="backgrounds.length">
								<AppFormGroup
									name="background_id"
									class="sans-margin-bottom"
									:label="$gettext(`Background`)"
									small
								>
									<AppFormControlBackground
										:backgrounds="backgrounds"
										:tile-size="32"
										:tile-gap="8"
									/>
								</AppFormGroup>

								<!-- TODO(fireside-host-backgrounds) Might need some text here to let them know it's only visible when you're the focused user. -->

								<AppSpacer vertical :scale="6" />
							</template>
						</AppForm>

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
					<AppTranslate>Make fireside public</AppTranslate>
				</AppButton>

				<AppButton
					v-if="canExtinguish"
					icon="remove"
					icon-color="notice"
					block
					@click="onClickExtinguish"
				>
					<AppTranslate>Extinguish fireside</AppTranslate>
				</AppButton>

				<AppButton v-if="canReport" icon="flag" trans block @click="onClickReport()">
					<AppTranslate>Report fireside</AppTranslate>
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
</style>
