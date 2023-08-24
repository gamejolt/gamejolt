<script lang="ts" setup>
import { computed, onMounted, PropType, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import { ContentRules } from '../../../../../_common/content/content-rules';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
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
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatCommandModel } from './command.model';
import { ChatCommandsFormModel } from './FormChatCommands.vue';

const COMMAND_PATTERN = /^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$/i;
const MAX_EDITOR_HEIGHT = 480;

const previewContentRules = new ContentRules({
	maxMediaHeight: MAX_EDITOR_HEIGHT / 3.5,
	maxMediaWidth: 300,
});

const props = defineProps({
	item: {
		type: Object as PropType<ChatCommandModel>,
		required: true,
	},
	commandMinLength: {
		type: Number,
		required: true,
	},
	commandMaxLength: {
		type: Number,
		required: true,
	},
	messageMaxLength: {
		type: Number,
		required: true,
	},
	messageCapabilities: {
		type: Object as PropType<ContextCapabilities>,
		required: true,
	},
});

const emit = defineEmits({
	remove: (_fieldsToClear: string[]) => true,
});

const { item } = toRefs(props);

const form = useForm<ChatCommandsFormModel>()!;

const fieldCommand = computed(() => `command_${item.value.id}`);
const fieldMessageContent = computed(() => `message_content_${item.value.id}`);
const fieldIsActive = computed(() => `is_active_${item.value.id}`);
const fields = computed(() => [fieldCommand.value, fieldMessageContent.value, fieldIsActive.value]);

const isActive = computed(() => form.formModel[fieldIsActive.value] === true);

onMounted(() => {
	_initFields();
});

function _getModelValue(formField: string) {
	const key = formField.substring(0, formField.lastIndexOf('_'));
	return (item.value as any)[key];
}

function _initFields() {
	for (const field of fields.value) {
		form.formModel[field] = _getModelValue(field);
	}
}

function onBlurCommand() {
	const newCommand = form.formModel[fieldCommand.value]?.trim() || '';
	form.formModel[fieldCommand.value] = newCommand;
}

function removeItem() {
	emit('remove', fields.value);
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
		<div class="-chunk-inner">
			<div class="-toggle">
				<AppFormGroup :name="fieldIsActive" label="enabled" hide-label>
					<AppFormControlToggle />
				</AppFormGroup>
			</div>

			<AppFormGroup
				class="-command-chunk sans-margin-bottom"
				:name="fieldCommand"
				label="command"
				hide-label
			>
				<div class="-command-chunk-inner">
					<AppFormControlPrefix :prefix="item.prefix">
						<AppFormControl
							type="text"
							:validators="[
								_validateUnique(item.id),
								validatePattern(COMMAND_PATTERN),
								validateMinLength(commandMinLength),
								validateMaxLength(commandMaxLength),
							]"
							placeholder="command"
							@blur="onBlurCommand()"
						/>
					</AppFormControlPrefix>

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
						:capabilities="messageCapabilities"
						:display-rules="previewContentRules"
						:max-height="MAX_EDITOR_HEIGHT"
						:min-height="64"
						:model-data="{
							type: 'resource',
							resource: 'Chat_Command',
							resourceId: item.id,
						}"
						:model-id="item.id"
						:validators="[
							validateContentRequired(),
							validateContentNoActiveUploads(),
							validateContentMaxLength(messageMaxLength),
						]"
						:placeholder="$gettext(`Enter your message`)"
					/>

					<AppFormControlErrors />
				</AppFormGroup>
			</div>

			<AppButton
				v-app-tooltip="$gettext(`Remove`)"
				class="-trash"
				icon="remove"
				trans
				sparse
				circle
				@click="removeItem()"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.well
	margin-bottom: 0

.-fill-solid
	change-bg(bg-offset)

.-fill-partial
	change-bg-rgba(var(--theme-bg-offset-rgb), 0.4)

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

.-toggle
	margin-top: 3px

	> *
		margin-bottom: 0

.-content-editor
	flex: 2

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
		flex: auto

	.-trash
		position: absolute
		top: -8px
		right: 0

	.-content-editor
		flex: none
		width: 100%
</style>
