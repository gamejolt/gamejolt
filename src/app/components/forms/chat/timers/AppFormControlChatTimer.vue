<script lang="ts" setup>
import { computed, onMounted, PropType, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import { ContentRules } from '../../../../../_common/content/content-rules';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	processFormValidatorErrorMessage,
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
	validateMaxValue,
	validateMinValue,
} from '../../../../../_common/form-vue/validators';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatCommand } from '../commands/command.model';
import { ChatTimersFormModel } from './FormChatTimers.vue';

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
	maxInvokeSchedule: {
		type: Number,
		required: true,
	},
	maxRequiredMessages: {
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

const form = useForm<ChatTimersFormModel>()!;

const fieldDescription = computed(() => `description_${item.value.id}`);
const fieldInvokeSchedule = computed(() => `invoke_schedule_${item.value.id}`);
const fieldNumRequiredMessages = computed(() => `num_required_messages_${item.value.id}`);
const fieldMessageContent = computed(() => `message_content_${item.value.id}`);
const fieldIsActive = computed(() => `is_active_${item.value.id}`);
const fields = computed(() => [
	fieldDescription.value,
	fieldInvokeSchedule.value,
	fieldNumRequiredMessages.value,
	fieldMessageContent.value,
	fieldIsActive.value,
]);

const isActive = computed(() => form.formModel[fieldIsActive.value] === true);
const timingError = computed(() => {
	const fieldsToCheck = [
		{ label: 'interval', field: fieldInvokeSchedule },
		{ label: 'number of required messages', field: fieldNumRequiredMessages },
	];

	for (const { label, field } of fieldsToCheck) {
		if (form.controlErrors[field.value]) {
			return processFormValidatorErrorMessage(form.controlErrors[field.value].message, label);
		}
	}

	return null;
});

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

function removeItem() {
	emit('remove', fields.value);
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
		<div class="-inner">
			<div class="-toggle">
				<AppFormGroup :name="fieldIsActive" label="enabled" hide-label>
					<AppFormControlToggle />
				</AppFormGroup>
			</div>

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
						:min-height="100"
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

			<div class="-trigger">
				<div class="-trigger-text">
					Trigger every
					<AppFormGroup
						class="-inline-control"
						:name="fieldInvokeSchedule"
						:label="$gettext(`Schedule`)"
						hide-label
					>
						<AppFormControl
							type="number"
							step="1"
							:max="maxInvokeSchedule"
							min="1"
							:validators="[validateMinValue(1), validateMaxValue(maxInvokeSchedule)]"
						/>
					</AppFormGroup>
					minute(s)
					<br />
					if at least
					<AppFormGroup
						class="-inline-control"
						style="margin-left: 0"
						:name="fieldNumRequiredMessages"
						:label="$gettext(`Number of required messages`)"
						hide-label
						optional
					>
						<AppFormControl
							type="number"
							step="1"
							:max="maxRequiredMessages"
							min="0"
							:validators="[
								validateMinValue(0),
								validateMaxValue(maxRequiredMessages),
							]"
						/>
					</AppFormGroup>
					message(s)
					<br />
					have been sent in chat
				</div>

				<p v-if="timingError" class="help-block error anim-fade-in">
					{{ timingError }}
				</p>
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

.-inner
	display: flex
	align-items: flex-start
	gap: 24px
	position: relative

.-inline-control
	display: inline-block
	margin: 4px 8px
	width: 80px

	input
		height: 30px

.-trigger
	flex: 1

.-trigger-text
	line-height: 40px

.-toggle
	margin-top: 3px

	> *
		margin-bottom: 0

.-content-editor
	flex: 1

@media $media-mobile
	.-inner
		flex-direction: column

	.-trash
		position: absolute
		top: -8px
		right: 0

	.-content-editor
		flex: none
		width: 100%
</style>
