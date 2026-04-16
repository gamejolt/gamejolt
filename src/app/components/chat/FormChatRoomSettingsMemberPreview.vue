<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppChatMemberListItem from '~app/components/chat/member-list/AppChatMemberListItem.vue';
import { ChatRoomModel } from '~app/components/chat/room';
import { useChatRoomMembers } from '~app/components/chat/room-channel';
import AppButton from '~common/button/AppButton.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';

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
