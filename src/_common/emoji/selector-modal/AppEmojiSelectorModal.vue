<script lang="ts" setup>
import { computed, CSSProperties, nextTick, onMounted, onUnmounted, Ref, ref } from 'vue';

import { Api } from '~common/api/api.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import { ContentEditorModelData } from '~common/content/content-owner';
import { EmojiModel } from '~common/emoji/emoji.model';
import { EmojiGroupModel, EmojiGroupTypeLocalRecent } from '~common/emoji/emoji-group.model';
import AppEmojiSelectorGroup from '~common/emoji/selector-modal/_group/AppEmojiSelectorGroup.vue';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { ModelData } from '~common/model/model.service';
import { storeModelList } from '~common/model/model-store.service';
import { EmojiGroupData, useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { styleChangeBg } from '~styles/mixins';
import { arrayRemove } from '~utils/array';
import { debounceWithMaxTimeout } from '~utils/utils';

type Props = {
	type: 'emojis' | 'reactions';
	modelData: ContentEditorModelData;
};
const { type, modelData } = defineProps<Props>();

const modal = useModal<EmojiModel>()!;
const { reactionsData, reactionsCursor } = useCommonStore();

let didInitialFetch = false;

const mounted = ref(import.meta.env.SSR);
const isBootstrapped = ref(import.meta.env.SSR);
const hasError = ref(false);
const inviewGroups = ref([]) as Ref<EmojiGroupData[]>;

const debounceItemsFetch = debounceWithMaxTimeout(
	() => {
		if (!mounted.value) {
			return;
		}
		fetchGroupsFromQueue();
	},
	200,
	500
);

const requestBodyData = computed(() => {
	const result: Record<string, string | number | boolean> = {};
	if (reactionsCursor.value) {
		result.cursor = reactionsCursor.value;
	}

	if (modelData.type === 'newChatMessage') {
		result.chatRoomId = modelData.chatRoomId;
	} else if (modelData.type === 'commentingOnResource') {
		result.commentingOnResource = modelData.resource;
		result.commentingOnResourceId = modelData.resourceId;
	} else if (modelData.type === 'resource') {
		result.resource = modelData.resource;
		result.resourceId = modelData.resourceId;
	} else if (modelData.type === 'supporterMessage') {
		result.forSupporterMessage = true;
	}

	return result;
});

onMounted(() => {
	if (!mounted.value) {
		init();
		mounted.value = true;
	}
});

onUnmounted(() => {
	mounted.value = false;
});

async function init() {
	try {
		const response = await Api.sendRequest(
			'/web/emojis/bootstrap-for-picker-placeholders',
			requestBodyData.value,
			{ detach: true }
		);

		if (typeof response.cursor === 'string') {
			reactionsCursor.value = response.cursor;
		}

		if (response.success === false) {
			throw response;
		}

		const staleIds = Array.isArray(response['bustCache']) ? response['bustCache'] : [];
		const rawRecentEmojis = Array.isArray(response['recentEmojis'])
			? response['recentEmojis']
			: [];

		const oldCounts = new Map<number, number>();
		for (const [groupId, data] of reactionsData.value) {
			oldCounts.set(groupId, data.group.num_emojis);
		}

		const newCollections: EmojiGroupModel[] = [];
		if (rawRecentEmojis.length) {
			// We want to keep this out of the model store since we generate it.
			const recentlyUsed = new EmojiGroupModel();
			recentlyUsed.update({
				id: -1,
				name: 'Recently used',
				emojis: rawRecentEmojis,
				num_emojis: rawRecentEmojis.length,
				added_on: Date.now(),
				type: EmojiGroupTypeLocalRecent,
				media_item: undefined,
			} as ModelData<EmojiGroupModel>);

			newCollections.push(recentlyUsed);
		}
		newCollections.push(...storeModelList(EmojiGroupModel, response['groups']));

		const newData = newCollections.reduce<Map<number, EmojiGroupData>>((result, newGroup) => {
			const old = reactionsData.value.get(newGroup.id);

			if (!old) {
				// If we don't have the collection already, add it.
				result.set(newGroup.id, {
					group: newGroup,
					hasError: false,
					isLoading: false,
					// This is always bootstrapped - we'll never load this when
					// fetching inview items.
					isBootstrapped: newGroup.isRecentlyUsed,
				});
			} else {
				// Update our existing collection with the new data.
				old.group = newGroup;
				old.isLoading = false;
				old.hasError = false;
				if (newGroup.isRecentlyUsed) {
					// Always bootstrap the recently used group.
					old.isBootstrapped = true;
				} else {
					const needsRefresh =
						old.hasError ||
						staleIds.includes(newGroup.id) ||
						newGroup.num_emojis !== oldCounts.get(newGroup.id);

					if (needsRefresh) {
						old.isBootstrapped = !needsRefresh;
					}
				}
				result.set(newGroup.id, old);
			}

			return result;
		}, new Map());

		reactionsData.value = newData;
		if (!mounted.value) {
			return;
		}
		isBootstrapped.value = true;

		// Allow items to build and queue themselves for a fetch.
		await nextTick();
		// Mark our initial fetch as completed so we can start debouncing future
		// fetches.
		didInitialFetch = true;
		await fetchGroupsFromQueue();
	} catch (e) {
		console.error(e);
		hasError.value = true;
		showErrorGrowl($gettext(`Something went wrong. Try again later.`));
	}
}

function canLoadGroup(data: EmojiGroupData) {
	if (data.hasError || data.isBootstrapped || data.group.isRecentlyUsed) {
		return false;
	}
	return true;
}

function onGroupInviewChanged(item: EmojiGroupData, isInview: boolean) {
	arrayRemove(inviewGroups.value, i => i.group.id === item.group.id);

	if (isInview) {
		inviewGroups.value.push(item);
		queueGroupFetch(item);
	} else {
		cancelGroupFetch(item);
	}
}

function queueGroupFetch(item: EmojiGroupData) {
	if (item.isLoading || !canLoadGroup(item)) {
		return;
	}

	item.isLoading = true;

	// Initial fetch doesn't require a debounce.
	if (!didInitialFetch) {
		return;
	}

	debounceItemsFetch.call();
}

function cancelGroupFetch(item: EmojiGroupData) {
	if (!item.isLoading) {
		return;
	}

	item.isLoading = false;

	if (!inviewGroups.value.length || inviewGroups.value.every(i => !canLoadGroup(i))) {
		debounceItemsFetch.cancel();
	}
}

async function fetchGroupsFromQueue() {
	const items = inviewGroups.value.filter(i => !i.isBootstrapped);
	return fetchGroups(items);
}

async function fetchGroups(groups: EmojiGroupData[]) {
	const groupData = groups.reduce<EmojiGroupData[]>((result, item) => {
		// Double-check that we're able to fetch this group.
		if (canLoadGroup(item)) {
			result.push(item);
		}
		return result;
	}, []);

	if (!groupData.length) {
		return;
	}
	const groupIds = groupData.map(i => i.group.id);

	try {
		const response = await Api.sendRequest(
			'/web/emojis/fetch-picker-emojis-in-view',
			{
				...requestBodyData.value,
				group_ids: groupIds,
			},
			{
				detach: true,
				allowComplexData: ['group_ids'],
			}
		);

		if (typeof response.cursor === 'string') {
			reactionsCursor.value = response.cursor;
		}

		if (response.success === false) {
			throw response;
		}

		const oldCounts = new Map<number, number>();
		for (const [groupId, data] of reactionsData.value) {
			oldCounts.set(groupId, data.group.num_emojis);
		}

		const staleIds = Array.isArray(response['bustCache']) ? response['bustCache'] : [];

		// This will update any collections defined on the group data wrappers.
		storeModelList(EmojiGroupModel, response['groups']);

		// Update data for the groups we just fetched.
		groupData.forEach(item => {
			item.isLoading = false;
			item.isBootstrapped = true;
		});

		let needsInviewRefetch = false;

		// Check if any of our collections became stale.
		reactionsData.value.forEach(data => {
			const group = data.group;
			const needsRefresh =
				data.isBootstrapped &&
				(staleIds.includes(group.id) || group.num_emojis !== oldCounts.get(group.id));

			if (!needsRefresh) {
				return;
			}

			needsInviewRefetch = true;
			data.isBootstrapped = false;
		});

		if (needsInviewRefetch) {
			fetchGroupsFromQueue();
		}
	} catch (e) {
		console.error('Error fetching for groups.', groupIds, e);
		// Reset state for any groups that failed to fetch, setting isError to
		// true.
		groupData.forEach(item => {
			item.isLoading = false;
			item.hasError = true;
		});

		showErrorGrowl($gettext(`Couldn't fetch emoji groups. Try again later.`));
	}
}

function selectEmoji(emoji: EmojiModel) {
	modal.resolve(emoji);
}

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(40px, 1fr))`,
	gridGap: `16px`,
};
</script>

<template>
	<!-- AppEmojiSelectorModal -->
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<template v-if="type === 'emojis'">
					{{ $gettext(`Emojis`) }}
				</template>
				<template v-else-if="type === 'reactions'">
					{{ $gettext(`Reactions`) }}
				</template>
				<template v-else>
					{{ $gettext(`Select an item`) }}
				</template>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="!reactionsData.size">
				<div
					v-if="hasError || isBootstrapped"
					class="well fill-notice"
					:style="{
						marginBottom: `32px`,
					}"
				>
					{{ $gettext(`We couldn't find anything you can use. Please try again later.`) }}
				</div>
				<div
					v-else
					:style="{
						marginBottom: `32px`,
					}"
				>
					<h6 class="section-header">
						<div
							class="lazy-placeholder"
							:style="{
								width: `25%`,
								maxWidth: `200px`,
							}"
						/>
					</h6>

					<div :style="gridStyles">
						<div v-for="num of 3" :key="num">
							<AppAspectRatio :ratio="1">
								<div
									:style="{
										...styleChangeBg('bg-subtle'),
										width: `100%`,
										height: `100%`,
										borderRadius: `50%`,
									}"
								/>
							</AppAspectRatio>
						</div>
					</div>
				</div>
			</template>
			<template v-else>
				<div v-for="[key, data] in reactionsData" :key="key">
					<AppEmojiSelectorGroup
						:group-data="data"
						:grid-styles="gridStyles"
						@inview="onGroupInviewChanged(data, true)"
						@outview="onGroupInviewChanged(data, false)"
						@select-emoji="selectEmoji"
					/>
				</div>
			</template>
		</div>
	</AppModal>
</template>
