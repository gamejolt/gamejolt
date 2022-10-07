<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, toRefs } from 'vue';
import { arrayRemove } from '../../../../../utils/array';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	FormValidatorError,
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
	validateMaxLength,
	validateMinLength,
	validatePattern,
} from '../../../../../_common/form-vue/validators';
import { FormModel } from './AppFormChatCommands.vue';
import { ChatCommand } from './command.model';

const COMMAND_PATTERN = /^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$/i;
const MAX_EDITOR_HEIGHT = 480;

const previewContentRules = new ContentRules({
	maxMediaHeight: MAX_EDITOR_HEIGHT / 3.5,
	maxMediaWidth: 300,
});

const props = defineProps({
	item: {
		type: Object as PropType<ChatCommand>,
		required: true,
	},
});

const { item } = toRefs(props);

const form = useForm<FormModel>()!;

const isActive = computed(() => form.formModel[`is_active_${item.value.id}`] === true);

const fieldPrefix = computed(() => `prefix_${item.value.id}`);
const fieldCommand = computed(() => `command_${item.value.id}`);
const fieldMessageContent = computed(() => `message_content_${item.value.id}`);
const fieldIsActive = computed(() => `is_active_${item.value.id}`);
const fieldInvokeDelay = computed(() => `invoke_delay_${item.value.id}`);
const fieldUseBot = computed(() => `use_bot_${item.value.id}`);
const fields = computed(() => [
	fieldPrefix,
	fieldCommand,
	fieldMessageContent,
	fieldIsActive,
	fieldInvokeDelay,
	fieldUseBot,
]);

onMounted(() => {
	_initFields();
});

onUnmounted(() => {
	_deleteFields();
});

function _getModelValue(formField: string) {
	const key = formField.substring(0, formField.lastIndexOf('_'));
	return (item.value as any)[key];
}

function _initFields() {
	for (const field of fields.value) {
		form.formModel[field.value] = _getModelValue(field.value);
	}
}

function _deleteFields() {
	for (const field of fields.value) {
		delete form.formModel[field.value];
	}
}

function onBlurCommand() {
	const newCommand = form.formModel[fieldCommand.value]?.trim() || '';
	form.formModel[fieldCommand.value] = newCommand;
}

function removeItem() {
	arrayRemove(form.formModel.commands, i => i.id === item.value.id);
}

function _validateUnique(id: number) {
	return async (value: string): Promise<FormValidatorError | null> => {
		const hasConflict = form.formModel.commands.some(i => {
			if (i.command !== value) {
				return false;
			}

			return i.id !== id;
		});

		if (hasConflict) {
			return {
				type: 'unique',
				message: 'Commands must be unique.',
			};
		}
		return null;
	};
}
</script>

<template>
	<div
		:key="item.id"
		class="well"
		:class="{
			'-fill-solid': isActive,
			'-fill-partial': !isActive,
		}"
	>
		<div class="-toggles">
			<AppFormGroup :name="fieldIsActive" label="enabled" hide-label>
				<AppFormControlToggle />
			</AppFormGroup>
		</div>

		<div class="-chunk-inner">
			<AppFormGroup
				class="-command-chunk sans-margin-bottom"
				:name="fieldCommand"
				label="command"
				hide-label
			>
				<div class="-command-chunk-inner">
					<div class="-command-row">
						<div class="-prefix">{{ item.prefix }}</div>

						<div class="-command">
							<AppFormControl
								class="-command-input"
								type="text"
								:validators="[
									_validateUnique(item.id),
									validatePattern(COMMAND_PATTERN),
									// TODO(chat-bang-commands) min-length for commands?
									validateMinLength(2),
									validateMaxLength(form.formModel.maxCommandLength),
								]"
								placeholder="command"
								@blur="onBlurCommand()"
							/>
						</div>
					</div>

					<AppFormControlErrors class="-command-chunk-errors" />
				</div>
			</AppFormGroup>

			<!-- Message content -->
			<div class="-content-editor">
				<AppFormGroup
					class="sans-margin-bottom"
					:name="fieldMessageContent"
					label="message"
					hide-label
				>
					<AppFormControlContent
						content-context="chat-command"
						:display-rules="previewContentRules"
						:max-height="MAX_EDITOR_HEIGHT"
						:min-height="64"
						:model-id="item.id"
						:validators="[
							validateContentRequired(),
							validateContentNoActiveUploads(),
							// TODO(chat-bang-commands) Do we want to include a max-length for the message?
							validateContentMaxLength(1_000),
						]"
						placeholder="Enter your message"
					/>

					<AppFormControlErrors />
				</AppFormGroup>
			</div>

			<AppButton class="-trash" icon="trash-can" solid sparse @click="removeItem()" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.well
	margin-bottom: 0

.-fill-solid
	change-bg(bg-offset)

.-fill-partial
	change-bg-rgba(var(--theme-bg-offset-rgb), 0.2)

.-toggles
	margin-bottom: 12px

	> *
		margin-bottom: 0

.-chunk-inner
	display: flex
	align-items: flex-start
	gap: 12px
	position: relative

.-command-chunk
	flex: 1
	min-width: 100px
	display: flex

.-command-chunk-inner
	flex: auto

.-prefix
	rounded-corners()
	border-top-right-radius: 0
	border-bottom-right-radius: 0
	change-bg(bg-subtle)
	border: $border-width-base solid var(--theme-bg-subtle)
	padding: 4px 12px 4px 8px
	margin-right: -6px
	display: inline-flex
	align-items: center

.-command-input
.-prefix
	height: 34px

.-command
	min-width: 0

.-content-editor
	flex: 4

.-command-row
	flex: none
	display: inline-flex
	align-items: center

@media $media-mobile
	.-chunk-inner
		flex-direction: column

	.-command-chunk
		width: 100%

	.-command-row
		display: flex

	.-command
		padding-right: 48px
		flex: auto

	.-trash
		position: absolute
		top: 0
		right: 0

	.-content-editor
		flex: none
		width: 100%
</style>
