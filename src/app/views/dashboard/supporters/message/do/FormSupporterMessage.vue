<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../../_common/content/content-context';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentRequired,
} from '../../../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppMediaItemBackdrop from '../../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { SupporterAction } from '../../../../../../_common/supporters/action.model';
import { SupporterMessage } from '../../../../../../_common/supporters/message.model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';

const props = defineProps({
	action: {
		type: Object as PropType<SupporterAction>,
		default: undefined,
	},
	...defineFormProps<SupporterMessage>(),
});

const { action, model } = toRefs(props);

const modal = useModal()!;

const lengthLimit = ref(300);
const contentCapabilities = ref(ContextCapabilities.getPlaceholder());

const isTemplate = computed(() => !action?.value);

const loadUrl = computed(() => `/web/dash/creators/supporters/save_template`);
const sendUrl = computed(() => `/web/dash/creators/supporters/send_message/${action?.value?.id}`);

const form: FormController<SupporterMessage> = createForm({
	model,
	modelClass: SupporterMessage,
	loadUrl,
	onLoad(response) {
		lengthLimit.value = response.lengthLimit;
		contentCapabilities.value = ContextCapabilities.fromPayloadList(
			response.contentCapabilities
		);
	},
	async onSubmit() {
		try {
			let response: any = {};

			if (isTemplate.value) {
				response = await form.formModel.$saveTemplate();
			} else {
				response = await Api.sendRequest(
					sendUrl.value,
					{
						message_content: form.formModel.content,
					},
					{
						detach: true,
					}
				);
			}

			if (!response.success) {
				const { errors = {} } = response;
				let message: string | undefined;

				if (errors.sending) {
					message = isTemplate.value
						? $gettext(
								`You can't save your template while there are still messages being sent.`
						  )
						: $gettext(`You have an existing message being sent to this user.`);
				} else if (errors.expired) {
					// Shouldn't encounter this error type when saving
					// templates.
					message = isTemplate.value
						? undefined
						: $gettext(
								`It's been too long since this user supported you to thank them.`
						  );
				}

				if (!message) {
					message = $gettext(`Something went wrong`);
				}

				showErrorGrowl(message);
				return;
			}

			modal.resolve(new SupporterMessage(response.message));
		} catch (e) {
			console.error(e);
			showErrorGrowl($gettext(`Something went wrong`));
		}
	},
});
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<template v-if="isTemplate">
					{{ $gettext(`Customize your message`) }}
				</template>
				<template v-else>
					{{ $gettext(`Say thanks!`) }}
				</template>
			</h2>
		</div>

		<div class="modal-body">
			<AppForm :controller="form">
				<template v-if="action">
					<h6 class="sans-margin-top">
						{{ $gettext(`Thanking user...`) }}
					</h6>

					<div class="-user">
						<AppMediaItemBackdrop
							class="-user-avatar"
							:media-item="action.user.avatar_media_item"
							fallback-color="var(--theme-bg-offset)"
						>
							<AppUserAvatarImg :user="action.user" />
						</AppMediaItemBackdrop>

						<div>
							<div class="-display-name">{{ action.user.display_name }}</div>
							<div class="-username">@{{ action.user.username }}</div>
						</div>
					</div>

					<AppSpacer vertical :scale="4" />
				</template>

				<AppFormGroup
					class="-content"
					name="content"
					:label="$gettext(`Message`)"
					hide-label
				>
					<AppFormControlContent
						content-context="supporter-message"
						:capabilities="contentCapabilities"
						:validators="[
							validateContentRequired(),
							validateContentMaxLength(lengthLimit),
						]"
						:disabled="form.isProcessing"
						:placeholder="
							isTemplate
								? $gettext(
										`Create a generic message to send your recent supporters!`
								  )
								: $gettext(`Thank this user with a custom message!`)
						"
						autofocus
					/>

					<AppFormControlErrors />
				</AppFormGroup>

				<div class="-submit-row">
					<AppFormButton class="-submit-button" :disabled="!form.valid || !form.changed">
						<template v-if="isTemplate">
							{{ $gettext(`Save template`) }}
						</template>
						<template v-else>
							{{ $gettext(`Send message`) }}
						</template>
					</AppFormButton>
				</div>
			</AppForm>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-user
	display: flex
	gap: 12px

.-user-avatar
	img-circle()
	width: 48px
	height: @width

.-display-name
.-username
	text-overflow()
	min-width: 0
	max-width: 100%

.-display-name
	font-weight: bold
	font-size: $font-size-base

.-username
	font-size: $font-size-small

.-content
	margin-bottom: ($grid-gutter-width / 2)

.-submit-row
	display: flex

.-submit-button
	margin-left: auto
</style>
