<script lang="ts">
import { ref } from 'vue';
import { arrayRemove } from '../../../../../utils/array';
import { sleep } from '../../../../../utils/utils';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormStickySubmit from '../../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { ChatCommand, CHAT_COMMAND_TYPE_TIMER } from '../commands/command.model';
import AppFormControlChatTimer from './AppFormControlChatTimer.vue';

export interface ChatTimersFormModel {
	timers: ChatCommand[];

	/**
	 * Chat timer fields keyed as `description_${id}`, `message_content_${id}`,
	 * where `id` is the unique {@link ChatCommand.id}.
	 */
	[k: string]: any;
}
</script>

<script lang="ts" setup>
const isProcessing = ref(false);
const isAddingItem = ref(false);

const maxTimers = ref(10);
const maxInvokeSchedule = ref(60);
const maxRequiredMessages = ref(100);
const messageMaxLength = ref(1000);

const form: FormController<ChatTimersFormModel> = createForm({
	loadUrl: `/web/chat/commands/timers`,
	model: ref({
		timers: [] as ChatCommand[],
	}),
	onLoad(response) {
		form.formModel.timers = ChatCommand.populate(response.timers);

		maxTimers.value = response.maxTimers;
		maxInvokeSchedule.value = response.maxInvokeSchedule;
		maxRequiredMessages.value = response.maxRequiredMessages;
		messageMaxLength.value = response.messageMaxLength;
	},
	async onSubmit() {
		if (isProcessing.value) {
			return;
		}

		const body: {
			commands: number[];
			[k: string]: any;
		} = {
			type: CHAT_COMMAND_TYPE_TIMER,
			commands: [],
		};

		for (const item of form.formModel.timers) {
			const makeKey = (prefix: string) => `${prefix}_${item.id}`;
			const getValue = (prefix: string) => form.formModel[makeKey(prefix)];

			const wantedFields: (keyof ChatCommand)[] = [
				'invoke_schedule',
				'num_required_messages',
				'message_content',
				'is_active',
			];
			const formFields: { [k: string]: any } = {};

			let formFieldsLength = 0;
			for (const field of wantedFields) {
				const value = getValue(field);
				if (value === undefined) {
					break;
				}

				const key = makeKey(field);
				if (formFields[key] === undefined) {
					formFields[key] = value;
					++formFieldsLength;
				}
			}

			if (wantedFields.length !== formFieldsLength) {
				console.error(`Didn't get the required fields to save a chat timer.`);
				break;
			}

			// Add our ID to the list of timers we're saving.
			body.commands.push(item.id);
			// Assign each field to our request body.
			for (const [key, value] of Object.entries(formFields)) {
				body[key] = value;
			}
		}

		try {
			return Api.sendRequest(`/web/chat/commands/save`, body, {
				allowComplexData: ['commands'],
				detach: true,
			});
		} finally {
			isProcessing.value = false;
		}
	},
});

async function addNewItem() {
	isAddingItem.value = true;

	try {
		if (form.formModel.timers.length >= maxTimers.value) {
			// Wait a little bit so the button isn't spam-clicked.
			await sleep(2_000);
			throw Error('Tried adding a new timer while already at our limit');
		}

		const response = await Api.sendRequest(
			`/web/chat/commands/new/${CHAT_COMMAND_TYPE_TIMER}`,
			{},
			{ detach: true }
		);

		if (!response.command) {
			throw Error('Got no chat timer returned when creating a new one');
		}

		const newFilter = new ChatCommand(response.command);
		// Set it as enabled right way to make it easier for them.
		newFilter.is_active = true;
		newFilter.invoke_schedule = 30;
		newFilter.num_required_messages = 0;
		form.formModel.timers.push(newFilter);
	} catch (e) {
		console.error(e);
	} finally {
		isAddingItem.value = false;
	}
}

function removeItem(item: ChatCommand, fieldsToClear: string[]) {
	arrayRemove(form.formModel.timers, i => i.id === item.id);

	for (const field of fieldsToClear) {
		delete form.formModel[field];
	}

	form.changed = true;
}
</script>

<template>
	<AppForm :controller="form" :forced-is-loading="isProcessing">
		<template v-if="!form.isLoadedBootstrapped">
			<AppLoading big centered />
		</template>
		<template v-else>
			<AppExpand :when="form.formModel.timers.length === 0">
				<div class="lead text-center">
					{{
						$gettext(
							`Chat timers allow you to send messages in your fireside chat on a schedule.`
						)
					}}
				</div>
			</AppExpand>

			<div class="-list">
				<AppFormControlChatTimer
					v-for="item of form.formModel.timers"
					:key="item.id"
					:item="item"
					:max-invoke-schedule="maxInvokeSchedule"
					:max-required-messages="maxRequiredMessages"
					:message-max-length="messageMaxLength"
					@remove="removeItem(item, $event)"
				/>

				<AppButton
					v-if="form.formModel.timers.length < maxTimers"
					block
					:disabled="isProcessing || isAddingItem || !form.valid"
					@click="addNewItem"
				>
					{{ $gettext(`New timer`) }}
				</AppButton>

				<AppFormStickySubmit>
					<AppFormButton>
						{{ $gettext(`Save`) }}
					</AppFormButton>
				</AppFormStickySubmit>
			</div>
		</template>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-list
	display: flex
	flex-direction: column
	gap: 20px
</style>
