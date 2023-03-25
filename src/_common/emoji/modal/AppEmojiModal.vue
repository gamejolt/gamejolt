<script lang="ts" setup>
import {
	computed,
	CSSProperties,
	nextTick,
	onMounted,
	onUnmounted,
	PropType,
	ref,
	Ref,
	toRefs,
} from 'vue';
import { arrayRemove } from '../../../utils/array';
import { debounceWithMaxTimeout } from '../../../utils/utils';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../_styles/mixins';
import { kFontSizeBase } from '../../../_styles/variables';
import { Api } from '../../api/api.service';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../button/AppButton.vue';
import { ContentEditorModelData } from '../../content/content-owner';
import { showErrorGrowl } from '../../growls/growls.service';
import AppLoading from '../../loading/AppLoading.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { storeModelList } from '../../model/model-store.service';
import { ModelData } from '../../model/model.service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/AppScrollInview.vue';
import { EmojiGroupData, useCommonStore } from '../../store/common-store';
import { $gettext } from '../../translate/translate.service';
import { EmojiGroup } from '../emoji-group.model';
import { Emoji } from '../emoji.model';
import AppEmojiModalItem from './AppEmojiModalItem.vue';
import AppEmojiGroupThumbnail from './_group/AppEmojiGroupThumbnail.vue';

const InviewConfig = new ScrollInviewConfig({ margin: '100px' });

const props = defineProps({
	type: {
		type: String as PropType<'emojis' | 'reactions'>,
		required: true,
	},
	modelData: {
		type: Object as PropType<ContentEditorModelData>,
		required: true,
	},
});

const { modelData } = toRefs(props);

const modal = useModal<Emoji>()!;
const { reactionsData, reactionsCursor } = useCommonStore();

let didInitialFetch = false;

const mounted = ref(false);
const isBootstrapped = ref(false);
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

	if (modelData.value.type === 'newChatMessage') {
		result.chatRoomId = modelData.value.chatRoomId;
	} else if (modelData.value.type === 'commentingOnResource') {
		result.commentingOnResource = modelData.value.resource;
		result.commentingOnResourceId = modelData.value.resourceId;
	} else if (modelData.value.type === 'resource') {
		result.resource = modelData.value.resource;
		result.resourceId = modelData.value.resourceId;
	} else if (modelData.value.type === 'supporterMessage') {
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

		const staleIds = Array.isArray(response['bustCache']) ? response['bustCache'] : [];
		const rawRecentEmojis = Array.isArray(response['recentEmojis'])
			? response['recentEmojis']
			: [];

		const oldCounts = new Map<number, number>();
		for (const [groupId, data] of reactionsData.value) {
			oldCounts.set(groupId, data.group.num_emojis);
		}

		const newCollections: EmojiGroup[] = [];
		if (rawRecentEmojis.length) {
			newCollections.push(
				new EmojiGroup({
					id: -1,
					name: 'Recently used',
					emojis: rawRecentEmojis,
					num_emojis: rawRecentEmojis.length,
					added_on: Date.now(),
					type: EmojiGroup.TYPE_LOCAL_RECENT,
					media_item: undefined,
				} as ModelData<EmojiGroup>)
			);
		}
		newCollections.push(...storeModelList(EmojiGroup, response['groups']));

		const newData = newCollections.reduce<Map<number, EmojiGroupData>>((result, newGroup) => {
			const old = reactionsData.value.get(newGroup.id);

			if (!old) {
				// If we don't have the collection already, add it.
				result.set(newGroup.id, {
					group: newGroup,
					hasError: false,
					isLoading: false,
					isBootstrapped: false,
				});
			} else {
				const needsRefresh =
					old.hasError ||
					staleIds.includes(newGroup.id) ||
					newGroup.num_emojis !== oldCounts.get(newGroup.id);

				// Update our existing collection with the new data.
				old.group = newGroup;
				old.isLoading = false;
				old.hasError = false;
				if (needsRefresh) {
					old.isBootstrapped = false;
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
		// TODO(reactions) might not work because of proxy. May need to change
		// inview groups to be a map of EmojiGroupModel.id => {GroupData,
		// isInview}
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
	// Clone our queued items so we can clear the original list.
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
		storeModelList(EmojiGroup, response['groups']);

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

		// TODO(reactions) messaging
		showErrorGrowl($gettext(`Couldn't fetch emoji groups. Try again later.`));
	}
}

function selectEmoji(emoji: Emoji) {
	Api.sendRequest(`/web/emojis/pick-emoji/${emoji.id}`, {}, { detach: true }).catch(e => {
		console.error('Failed to update recently used emoji.', e);
	});
	modal.resolve(emoji);
}

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(32px, 1fr))`,
	gridGap: `16px`,
};
</script>

<template>
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
										...styleBorderRadiusCircle,
										...styleChangeBg('bg-subtle'),
										width: `100%`,
										height: `100%`,
									}"
								/>
							</AppAspectRatio>
						</div>
					</div>
				</div>
			</template>
			<template v-else>
				<div v-for="[key, data] in reactionsData" :key="key">
					<!-- TODO(reactions) -->
					<AppScrollInview
						v-if="!data.hasError && (data.group.emojis.length || data.group.num_emojis)"
						:config="InviewConfig"
						:style="{
							marginBottom: `32px`,
						}"
						@inview="onGroupInviewChanged(data, true)"
						@outview="onGroupInviewChanged(data, false)"
					>
						<div
							class="section-header"
							:style="{
								display: `flex`,
								gap: `8px`,
								alignItems: `flex-start`,
							}"
						>
							<AppEmojiGroupThumbnail
								:group="data.group"
								:size="kFontSizeBase.value + 2"
							/>

							<h6
								:style="{
									marginTop: 0,
								}"
							>
								{{ data.group.name }}
							</h6>

							<!-- TODO(reactions) loading indicator -->
							<template v-if="data.isLoading">
								<!-- <div
									:style="{
										width: kFontSizeBase.px,
										height: kFontSizeBase.px,
										borderRadius: `50%`,
										border: `${kBorderWidthLg.px} solid ${kThemePrimary}`,
									}"
								/> -->
								<AppLoading stationary hide-label />
							</template>
						</div>

						<div :style="gridStyles">
							<div
								v-for="(_, index) of Math.max(
									data.group.emojis.length,
									data.group.num_emojis
								)"
								:key="data.group.emojis[index]?.id || index"
							>
								<AppEmojiModalItem
									:emoji="data.group.emojis[index]"
									@select="selectEmoji"
								/>
							</div>
						</div>
					</AppScrollInview>
				</div>
			</template>
		</div>
	</AppModal>
</template>
