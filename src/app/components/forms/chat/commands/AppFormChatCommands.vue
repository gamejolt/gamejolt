<script lang="ts">
type FormItemModel = ChatCommand;

export interface FormModel {
	commands: FormItemModel[];
	maxCommands: number;
	maxCommandLength: number;
	maxInvokeDelay: number;

	/**
	 * ChatCommands fields keyed as `command_${id}`, `message_content_${id}`,
	 * where `id` is the unique {@link ChatCommand.id}.
	 */
	[k: string]: any;
}
</script>

<script lang="ts" setup>
import { ref } from 'vue';
import { sleep } from '../../../../../utils/utils';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormStickySubmit from '../../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormControlChatCommand from './AppFormControlChatCommand.vue';
import { ChatCommand } from './command.model';

const isProcessing = ref(false);
const isAddingItem = ref(false);

const form: FormController<FormModel> = createForm({
	loadUrl: `/web/chat/commands`,
	model: ref<FormModel>({
		commands: [],
		maxCommandLength: 100,
		maxCommands: 20,
		maxInvokeDelay: 100,
	}),
	onLoad(response) {
		Object.assign(form.formModel, response);
		form.formModel.commands = ChatCommand.populate(response.commands);
	},
	async onSubmit() {
		if (isProcessing.value) {
			return;
		}

		const body: {
			commands: number[];
			[k: string]: any;
		} = {
			commands: [],
		};

		for (const item of form.formModel.commands) {
			const makeKey = (prefix: string) => `${prefix}_${item.id}`;
			const getValue = (prefix: string) => form.formModel[makeKey(prefix)];

			const wantedFields: (keyof ChatCommand)[] = [
				'prefix',
				'command',
				'message_content',
				'is_active',
				'invoke_delay',
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

		return Api.sendRequest(`/web/chat/commands/save`, body, {
			allowComplexData: ['commands'],
			detach: true,
		}).finally(() => (isProcessing.value = false));
	},
});

async function addNewItem() {
	isAddingItem.value = true;

	try {
		if (form.formModel.commands.length >= form.formModel.maxCommands) {
			// Wait a little bit so the button isn't spam-clicked.
			await sleep(2_000);
			throw Error('Tried adding a new command while already at our limit');
		}

		const response = await Api.sendRequest(`/web/chat/commands/new`, {}, { detach: true });

		if (!response.command) {
			throw Error('Got no chat command returned when creating a new one');
		}

		form.formModel.commands.push(new ChatCommand(response.command));
	} catch (e) {
		console.error(e);
	} finally {
		isAddingItem.value = false;
	}
}
</script>

<template>
	<AppForm :controller="form" :forced-is-loading="isProcessing">
		<div class="-grid-list">
			<AppFormControlChatCommand
				v-for="item of form.formModel.commands"
				:key="item.id"
				:item="item"
			/>

			<!-- TODO(chat-bang-commands) Only allow adding if all form fields are valid? -->
			<AppButton
				v-if="form.formModel.commands.length < form.formModel.maxCommands"
				block
				solid
				primary
				:disabled="isProcessing || isAddingItem || !form.valid"
				@click="addNewItem"
			>
				<AppTranslate>Add command</AppTranslate>
			</AppButton>

			<AppFormStickySubmit>
				<AppFormButton>
					<AppTranslate>Save commands</AppTranslate>
				</AppFormButton>
			</AppFormStickySubmit>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-grid-list
	display: grid
	grid-template-columns: minmax(0, 1fr)
	gap: $line-height-computed
</style>
