<script lang="ts" setup>
import { CSSProperties, nextTick, onMounted, onUnmounted, PropType, ref } from 'vue';
import { debounce } from '../../../utils/utils';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../_styles/mixins';
import { Api } from '../../api/api.service';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../button/AppButton.vue';
import { showErrorGrowl } from '../../growls/growls.service';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { storeModelList } from '../../model/model-store.service';
import { Model, ModelData } from '../../model/model.service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/AppScrollInview.vue';
import { ReactionGroupData, useCommonStore } from '../../store/common-store';
import { $gettext } from '../../translate/translate.service';
import { EmojiGroup } from '../emoji-group.model';
import { Emoji } from '../emoji.model';
import AppEmojiModalItem from './AppEmojiModalItem.vue';

const InviewConfig = new ScrollInviewConfig({ margin: '100px' });

const props = defineProps({
	resource: {
		// TODO(reactions): use model to fetch what we can actually use.
		type: Object as PropType<Model>,
		default: undefined,
	},
});

const modal = useModal<Emoji>()!;

const { reactionsData, reactionsCursor } = useCommonStore();

const mounted = ref(false);
const isBootstrapped = ref(false);
const queuedItemFetches = ref(new Set<ReactionGroupData>());
let didInitialFetch = false;

const debounceInviewFetch = debounce(() => {
	if (!mounted.value) {
		return;
	}

	const items = [...queuedItemFetches.value];
	queuedItemFetches.value.clear();
	fetchCollections(items);
}, 200);

onMounted(() => {
	if (!mounted.value) {
		init();
		mounted.value = true;
	}
});
onUnmounted(() => (mounted.value = false));

async function init() {
	try {
		const response = await Api.sendRequest(
			'/web/emojis/bootstrap-for-picker-placeholders',
			{
				cursor: reactionsCursor.value,
			},
			{ detach: true }
		);

		if (typeof response['cursor'] === 'string') {
			reactionsCursor.value = response['cursor'];
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
				// TODO(reactions) is there a better way to do this? would be
				// nice to use `storeModel` with a custom id that uses our
				// auth-user id.
				new EmojiGroup({
					id: -1,
					name: 'Recently used',
					emojis: rawRecentEmojis,
					num_emojis: rawRecentEmojis.length,
					added_on: Date.now(),
					type: 'custom-local',
					media_item: undefined,
				} as ModelData<EmojiGroup>)
			);
		}
		newCollections.push(...storeModelList(EmojiGroup, response['groups']));

		const newData = newCollections.reduce<Map<number, ReactionGroupData>>(
			(result, newGroup) => {
				const old = reactionsData.value.get(newGroup.id);

				if (old == null) {
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
			},
			new Map()
		);

		reactionsData.value = newData;

		isBootstrapped.value = true;

		// Allow items to build and queue themselves for a fetch.
		//
		// TODO(reactions) test this more
		await nextTick();
		const items = [...queuedItemFetches.value];
		queuedItemFetches.value = new Set();
		await fetchCollections(items);
		didInitialFetch = true;
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong. Try again later.`));
	}
}

function canLoadItem(data: ReactionGroupData) {
	if (data.hasError || data.isBootstrapped || data.group.id <= 0) {
		return false;
	}
	return true;
}

function queueCollectionFetch(group: ReactionGroupData) {
	if (group.isLoading || !canLoadItem(group)) {
		return;
	}

	if (queuedItemFetches.value.has(group)) {
		return;
	}
	queuedItemFetches.value.add(group);
	group.isLoading = true;

	// Initial fetch doesn't require a debounce. All we need to do is add to
	// [queuedItemFetches.value] above and we should be good.
	if (!didInitialFetch) {
		return;
	}

	debounceInviewFetch();
}

function cancelCollectionFetch(group: ReactionGroupData) {
	if (!queuedItemFetches.value.delete(group)) {
		return;
	}

	group.isLoading = false;
}

async function fetchCollections(groups: ReactionGroupData[]) {
	const groupData = groups.reduce<ReactionGroupData[]>((result, item) => {
		// Double-check that we're able to fetch this collection.
		if (canLoadItem(item)) {
			result.push(item);
		}
		return result;
	}, []);

	if (!groupData.length) {
		return;
	}
	const groupIds = groupData.map(i => i.group.id);

	try {
		const body: any = {
			group_ids: groupIds,
		};
		if (reactionsCursor.value) {
			body.cursor = reactionsCursor.value;
		}
		const response = await Api.sendRequest('/web/emojis/fetch-picker-emojis-in-view', body, {
			detach: true,
			allowComplexData: ['group_ids'],
		});

		if (typeof response['cursor'] === 'string') {
			reactionsCursor.value = response['cursor'];
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

		// Check if any of our collections became stale.
		reactionsData.value.forEach(data => {
			const group = data.group;
			const needsRefresh =
				data.isBootstrapped &&
				(staleIds.includes(group.id) || group.num_emojis !== oldCounts.get(group.id));

			if (!needsRefresh) {
				return;
			}

			// TODO: check if item is currently in view. If so, we should
			// automatically refresh it.
			data.isBootstrapped = false;
		});
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
				{{ $gettext(`Emojis and reactions`) }}
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
			<AppScrollInview
				v-for="[key, data] in reactionsData"
				v-else
				:key="key"
				:config="InviewConfig"
				:style="{
					marginBottom: `32px`,
				}"
				@inview="queueCollectionFetch(data)"
				@outview="cancelCollectionFetch(data)"
			>
				<h6 class="section-header">
					{{ data.group.name }}
				</h6>

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
	</AppModal>
</template>
