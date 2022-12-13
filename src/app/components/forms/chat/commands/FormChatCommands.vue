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
import AppFormControlChatCommand from './AppFormControlChatCommand.vue';
import { ChatCommand, CHAT_COMMAND_TYPE_COMMAND } from './command.model';

export interface ChatCommandsFormModel {
	commands: ChatCommand[];

	/**
	 * ChatCommands fields keyed as `command_${id}`, `message_content_${id}`,
	 * where `id` is the unique {@link ChatCommand.id}.
	 */
	[k: string]: any;
}
</script>

<script lang="ts" setup>
const isProcessing = ref(false);
const isAddingItem = ref(false);

const maxCommands = ref(20);
const commandMinLength = ref(2);
const commandMaxLength = ref(20);
const messageMaxLength = ref(1000);

const form: FormController<ChatCommandsFormModel> = createForm({
	loadUrl: `/web/chat/commands`,
	model: ref({
		commands: [] as ChatCommand[],
	}),
	onLoad(response) {
		form.formModel.commands = ChatCommand.populate(response.commands);

		maxCommands.value = response.maxCommands;
		commandMinLength.value = response.commandMinLength;
		commandMaxLength.value = response.commandMaxLength;
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
			type: CHAT_COMMAND_TYPE_COMMAND,
			commands: [],
		};

		for (const item of form.formModel.commands) {
			const makeKey = (prefix: string) => `${prefix}_${item.id}`;
			const getValue = (prefix: string) => form.formModel[makeKey(prefix)];

			const wantedFields: (keyof ChatCommand)[] = ['command', 'message_content', 'is_active'];
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
				console.error(`Didn't get the required fields to save a chat command.`);
				break;
			}

			// Add our ID to the list of commands we're saving.
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
		if (form.formModel.commands.length >= maxCommands.value) {
			// Wait a little bit so the button isn't spam-clicked.
			await sleep(2_000);
			throw Error('Tried adding a new command while already at our limit');
		}

		const response = await Api.sendRequest(
			`/web/chat/commands/new/${CHAT_COMMAND_TYPE_COMMAND}`,
			{},
			{ detach: true }
		);

		if (!response.command) {
			throw Error('Got no chat command returned when creating a new one');
		}

		const newCommand = new ChatCommand(response.command);
		// Set it as enabled right way to make it easier for them.
		newCommand.is_active = true;
		form.formModel.commands.push(newCommand);
	} catch (e) {
		console.error(e);
	} finally {
		isAddingItem.value = false;
	}
}

function removeItem(item: ChatCommand, fieldsToClear: string[]) {
	arrayRemove(form.formModel.commands, i => i.id === item.id);

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
			<AppExpand :when="form.formModel.commands.length === 0">
				<div class="lead text-center">
					{{
						$gettext(
							`Chat commands allow people in your fireside chat to get an automated message when sending a particular text command.`
						)
					}}
				</div>
			</AppExpand>

			<div class="-list">
				<AppFormControlChatCommand
					v-for="item of form.formModel.commands"
					:key="item.id"
					:item="item"
					:command-min-length="commandMinLength"
					:command-max-length="commandMaxLength"
					:message-max-length="messageMaxLength"
					@remove="removeItem(item, $event)"
				/>

				<AppButton
					v-if="form.formModel.commands.length < maxCommands"
					block
					:disabled="isProcessing || isAddingItem || !form.valid"
					@click="addNewItem"
				>
					{{ $gettext(`New command`) }}
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
