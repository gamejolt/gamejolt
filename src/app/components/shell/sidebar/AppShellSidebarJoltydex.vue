<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { useEscapeStack } from '../../../../_common/escape-stack/escape-stack.service';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';
import { useAppStore } from '../../../store';
import { useJoltydexStore } from '../../../store/joltydex';
import AppJoltydexUser from './_joltydex/AppJoltydexUser.vue';

const { user: loggedInUser } = useCommonStore();
const { toggleLeftPane } = useAppStore();
const { selectedJoltydexUser } = useJoltydexStore();

const isLoading = ref(false);
const users = ref<UserModel[]>([]);

onMounted(() => {
	loadUsers();
});

useEscapeStack(() => {
	const hadWindow = !!selectedJoltydexUser.value;
	// Clear out the [activeQuest], closing the quest window.
	selectedJoltydexUser.value = undefined;

	// Mobile sizes should close the quest window before closing the sidebar.
	// Desktop should close the sidebar always.
	if (!hadWindow || Screen.isDesktop) {
		toggleLeftPane('');
	}
});

async function loadUsers() {
	isLoading.value = true;

	const response = await Api.sendFieldsRequest(
		'/mobile/inventory-collection',
		{
			users: {
				user: loggedInUser.value!.id,
			},
		},
		{ detach: true }
	);

	users.value = UserModel.populate(response.users);

	isLoading.value = false;
}
</script>

<template>
	<div id="shell-sidebar-joltydex" class="fill-offset">
		<AppLoadingFade :is-loading="isLoading">
			<AppScrollScroller thin>
				<div
					:style="{
						padding: `var(--shell-content-sidebar-padding)`,
					}"
				>
					<p>
						<em>{{ $gettext(`Choose a collection to view`) }}</em>
					</p>

					<AppJoltydexUser v-for="user of users" :key="user.id" :user="user" />
				</div>
			</AppScrollScroller>
		</AppLoadingFade>
	</div>
</template>
