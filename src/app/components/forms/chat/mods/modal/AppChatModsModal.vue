<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import AppTabBar from '../../../../../../_common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '../../../../../../_common/tab-bar/AppTabBarItem.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { ChatRoom } from '../../../../chat/room';
import { ChatUser } from '../../../../chat/user';
import FormChatMods from '../FormChatMods.vue';

const ListTitles = {
	currentMods: $gettext(`Current moderators`),
	friends: $gettext(`Friends`),
	chat: $gettext(`Chat`),
};

export type ListTitle = keyof typeof ListTitles;
</script>

<script lang="ts" setup>
const props = defineProps({
	chatRoom: {
		type: Object as PropType<ChatRoom>,
		default: undefined,
	},
	hasCurrentMods: {
		type: Boolean,
	},
	initialMods: {
		type: Array as PropType<ChatUser[]>,
		default: undefined,
	},
	initialSection: {
		type: String as PropType<ListTitle>,
		default: 'friends',
	},
});

const { chatRoom, hasCurrentMods, initialSection } = toRefs(props);

const modal = useModal()!;

const listChanged = ref(false);

const activeList = ref<ListTitle>(
	hasCurrentMods.value || initialSection.value !== 'currentMods'
		? initialSection.value
		: 'friends'
);

const isAdding = computed(() => activeList.value !== 'currentMods');
const listOptions = computed<Partial<typeof ListTitles>>(() => {
	const options: Partial<typeof ListTitles> = { friends: ListTitles.friends };
	if (chatRoom?.value) {
		options.chat = ListTitles.chat;
	}
	return options;
});
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.resolve(listChanged)">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<div
				:style="{
					display: 'flex',
				}"
			>
				<template v-if="isAdding && hasCurrentMods">
					<AppButton
						:style="{
							alignSelf: 'flex-start',
						}"
						circle
						sparse
						trans
						icon="chevron-left"
						@click="activeList = 'currentMods'"
					/>

					<AppSpacer horizontal :scale="4" />
				</template>

				<h2 class="modal-title">
					{{ $gettext(`Chat moderators`) }}
				</h2>
			</div>

			<AppButton v-if="!isAdding" solid primary block @click="activeList = 'friends'">
				{{ $gettext(`Add`) }}
			</AppButton>

			<AppTabBar v-if="isAdding">
				<AppTabBarItem
					v-for="(title, key) of listOptions"
					:key="key"
					:active="activeList === key"
					@click="activeList = key"
				>
					{{ title }}
				</AppTabBarItem>
			</AppTabBar>
		</div>

		<div class="modal-body">
			<FormChatMods
				class="full-bleed"
				:section="activeList"
				:chat-room="chatRoom"
				:initial-mods="initialMods"
				:get-current-mods="hasCurrentMods"
				@list-changed="listChanged = true"
			/>

			<AppSpacer vertical :scale="4" />
		</div>
	</AppModal>
</template>
