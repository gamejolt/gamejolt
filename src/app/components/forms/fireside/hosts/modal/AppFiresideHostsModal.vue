<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import { objectPick } from '../../../../../../utils/object';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import AppTabBar from '../../../../../../_common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '../../../../../../_common/tab-bar/AppTabBarItem.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { FiresideController } from '../../../../../components/fireside/controller/controller';
import FormFiresideHosts from '../FormFiresideHosts.vue';

const ListTitles = {
	currentHosts: $gettext(`Current hosts`),
	friends: $gettext(`Friends`),
	chat: $gettext(`Chat`),
};

export type ListTitle = keyof typeof ListTitles;
</script>

<script lang="ts" setup>
const listOptions: Partial<typeof ListTitles> = objectPick(ListTitles, ['friends', 'chat']);

const props = defineProps({
	controller: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

const { controller } = toRefs(props);

const modal = useModal()!;

const activeList = ref<ListTitle>('currentHosts');

const isAdding = computed(() => activeList.value !== 'currentHosts');
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<div
				:style="{
					display: 'flex',
				}"
			>
				<template v-if="isAdding">
					<AppButton
						:style="{
							alignSelf: 'flex-start',
						}"
						circle
						sparse
						trans
						icon="chevron-left"
						@click="activeList = 'currentHosts'"
					/>

					<AppSpacer horizontal :scale="4" />
				</template>

				<h2 class="modal-title">
					{{ $gettext(`Manage hosts`) }}
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
			<FormFiresideHosts class="full-bleed" :section="activeList" :controller="controller" />

			<AppSpacer vertical :scale="4" />
		</div>
	</AppModal>
</template>
