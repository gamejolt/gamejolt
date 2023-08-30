<script lang="ts" setup>
import { computed, nextTick, onUnmounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	CollectibleModel,
	CollectibleType,
} from '../../../../_common/collectible/collectible.model';
import AppJoltydexSection from '../../../../_common/joltydex/AppJoltydexSection.vue';
import { storeModelList } from '../../../../_common/model/model-store.service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { useAppStore } from '../../../store/index';
import { useJoltydexStore } from '../../../store/joltydex';
import AppShellWindow from '../../shell/AppShellWindow.vue';

const props = defineProps({
	selectedUser: {
		type: UserModel,
		required: true,
	},
});

const { selectedUser } = toRefs(props);
const { user: loggedInUser } = useCommonStore();
const { selectedJoltydexUser } = useJoltydexStore();
const { toggleLeftPane } = useAppStore();

const isWindowLoading = ref(false);
const hasError = ref(false);

interface SectionData {
	type: CollectibleType;
	collectibles: CollectibleModel[];
	collectibleCount: number;
	isLoading: boolean;
}

const sectionTypes = [
	CollectibleType.AvatarFrame,
	CollectibleType.Background,
	CollectibleType.Sticker,
];

const sectionData = ref(new Map<CollectibleType, SectionData>());
for (const sectionType of sectionTypes) {
	sectionData.value.set(sectionType, {
		type: sectionType,
		collectibles: [],
		collectibleCount: 0,
		isLoading: false,
	});
}

const filteredSections = computed(
	() => new Map([...sectionData.value].filter(([_type, data]) => data.collectibleCount > 0))
);

// This will load in the initial data for all the sections.
init();

// TODO(atlas): do we need this?
onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();

	if (selectedUser.value === selectedJoltydexUser.value) {
		selectedJoltydexUser.value = undefined;
	}
});

async function init() {
	if (isWindowLoading.value) {
		return;
	}
	isWindowLoading.value = true;

	try {
		await _doLoad(sectionTypes);
	} catch (e) {
		console.error('Failed to load collection data', e);
		hasError.value = true;
	}
	isWindowLoading.value = false;
}

async function loadMore(type: CollectibleType) {
	const section = sectionData.value.get(type)!;
	section.isLoading = true;

	try {
		await _doLoad([type], section.collectibles.length);
	} catch (e) {
		console.error('Failed to load collection data', e);
	}

	section.isLoading = false;
}

function close() {
	// Causes the shell to v-if this away.
	selectedJoltydexUser.value = undefined;

	// Close the sidebar only for breakpoints that always show it. Mobile
	// breakpoints have the quest window overlay everything, so we should keep
	// the sidebar open.
	if (Screen.isDesktop) {
		toggleLeftPane('');
	}
}

async function _doLoad(sectionTypes: CollectibleType[], pos?: number) {
	const commonFields = {
		ownerUser: selectedUser.value.id,
		user: loggedInUser.value!.id,
		resourceTypes: sectionTypes,
	};

	const payload = await Api.sendFieldsRequest(
		'/mobile/inventory-collection',
		{
			collectibles: {
				...commonFields,
				pos,
			},
			collectibleCount: {
				...commonFields,
			},
		},
		{ detach: true }
	);

	for (const sectionType of sectionTypes) {
		const section = sectionData.value.get(sectionType)!;
		section.collectibles.push(
			...storeModelList(CollectibleModel, payload.collectibles[sectionType] || [])
		);
		section.collectibleCount = payload.collectibleCount[sectionType] || 0;
	}
}
</script>

<template>
	<AppShellWindow :close-callback="close" avoid-sidebar="md-up">
		<div
			class="modal-controls"
			:style="{
				position: `absolute`,
				left: 0,
				top: 0,
				right: 0,
				height: 0,
				zIndex: 2,
			}"
		>
			<AppButton overlay @click="close">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div
			:style="{
				position: `relative`,
				zIndex: 1,
				width: `100%`,
				height: `100%`,
			}"
		>
			<AppScrollScroller
				:style="{
					height: `100%`,
					padding: `16px`,
				}"
			>
				<template
					v-for="[
						sectionType,
						{ collectibles, collectibleCount, isLoading },
					] of filteredSections"
					:key="sectionType"
				>
					<AppJoltydexSection :type="sectionType" :collectibles="collectibles" />

					<AppSpacer vertical :scale="6" />

					<AppButton
						v-if="!isLoading && collectibles.length < collectibleCount"
						@click="loadMore(sectionType)"
					>
						{{ $gettext(`Load more`) }}
					</AppButton>

					<AppSpacer vertical :scale="10" />
				</template>
			</AppScrollScroller>
		</div>
	</AppShellWindow>
</template>
