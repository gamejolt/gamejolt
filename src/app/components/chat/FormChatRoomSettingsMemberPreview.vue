<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppButton from '../../../_common/button/AppButton.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppChatMemberListItem from './member-list/AppChatMemberListItem.vue';
import { ChatRoomModel } from './room';
import { useChatRoomMembers } from './room-channel';

type Props = {
	room: ChatRoomModel;
};
const { room } = defineProps<Props>();

const emit = defineEmits<{
	viewMembers: [];
}>();

const { memberCollection } = useChatRoomMembers(toRef(() => room));

const members = toRef(() => memberCollection.value?.users || []);
const membersPreview = computed(() => members.value.slice(0, 5));
</script>

<template>
	<div v-if="membersPreview.length > 0">
		<AppSpacer vertical :scale="6" />
		<hr />
		<AppSpacer vertical :scale="6" />

		<ul class="shell-nav">
			<AppChatMemberListItem
				v-for="user of membersPreview"
				:key="user.id"
				:user="user"
				:room="room"
			/>

			<div class="-pad">
				<AppSpacer vertical :scale="4" />
				<AppButton block @click="emit('viewMembers')">
					{{ $gettext(`View all members`) }}
				</AppButton>
			</div>
		</ul>
	</div>
</template>
