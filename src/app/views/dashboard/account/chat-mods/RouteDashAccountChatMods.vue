<script lang="ts">
import { computed, ref } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import { ChatUser } from '../../../../components/chat/user';
import FormChatMods from '../../../../components/forms/chat/mods/FormChatMods.vue';
import { ChatModsModal } from '../../../../components/forms/chat/mods/modal/modal.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const chatMods = ref<ChatUser[]>([]);
const formKey = ref(0);

const routeTitle = computed(() => $gettext(`Chat moderators`));
const hasMods = computed(() => chatMods.value.length > 0);

createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
});

async function onClickAdd() {
	const needsRefresh = await ChatModsModal.show({
		initialSection: 'friends',
		initialMods: chatMods.value,
	});

	// If we added chat mods through the modal that was shown, increment our key
	// so the form rebuilds and starts fetching fresh moderators again.
	if (needsRefresh) {
		++formKey.value;
	}
}

function onModsListLoaded(users: ChatUser[]) {
	chatMods.value = users;
}
</script>

<template>
	<AppExpand :when="!hasMods">
		<div class="lead text-center">
			{{
				$gettext(
					`Add chat moderators for your firesides that can kick users and remove messages on your behalf.`
				)
			}}
		</div>
	</AppExpand>

	<AppButton block @click="onClickAdd">
		{{ $gettext(`Add moderator`) }}
	</AppButton>

	<FormChatMods
		:key="formKey"
		section="currentMods"
		get-current-mods
		hide-empty
		@list-loaded="onModsListLoaded"
	/>
</template>
