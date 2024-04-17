<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/AppButton.vue';
import { ContextCapabilities } from '../../../content/content-context';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../form-vue/controls/AppFormControlContent.vue';
import { validateContentMaxLength, validateContentRequired } from '../../../form-vue/validators';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppMediaItemBackdrop from '../../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { $gettext } from '../../../translate/translate.service';
import AppUserAvatarImg from '../../../user/user-avatar/AppUserAvatarImg.vue';
import { SupporterActionModel } from '../../action.model';
import { $saveSupporterMessageTemplate, SupporterMessageModel } from '../../message.model';

const props = defineProps({
	action: {
		type: Object as PropType<SupporterActionModel>,
		default: undefined,
	},
	...defineFormProps<SupporterMessageModel>(),
});

const { action, model } = toRefs(props);

const modal = useModal()!;

const lengthLimit = ref(300);
const contentCapabilities = ref(ContextCapabilities.getPlaceholder());

const isTemplate = computed(() => !action?.value);

const loadUrl = computed(() => {
	let type = model?.value?.type ?? action?.value?.type ?? undefined;
	if (!type) {
		throw new Error('Expected either model or action to be provided');
	}

	return `/web/dash/creators/supporters/save-template/${type}`;
});

const sendUrl = computed(() => `/web/dash/creators/supporters/send-message`);

const form: FormController<SupporterMessageModel> = createForm({
	model,
	modelClass: SupporterMessageModel,
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
				response = await $saveSupporterMessageTemplate(form.formModel);
			} else {
				const payload = {
					action_id: action!.value!.id,
					type: action!.value!.type,
					message_content: form.formModel.content,
				};

				response = await Api.sendRequest(sendUrl.value, payload, { detach: true });
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

			modal.resolve({
				message: new SupporterMessageModel(response.message),
				canSendAll:
					typeof response.canSendAll === 'boolean' ? response.canSendAll : undefined,
			});
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
						:model-data="{
							type: 'supporterMessage',
						}"
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
