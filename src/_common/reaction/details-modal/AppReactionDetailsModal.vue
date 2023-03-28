<script lang="ts" setup>
import { computed, PropType, ref, Ref, shallowRef, toRefs } from 'vue';
import { kFontSizeBase } from '../../../_styles/variables';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import AppModal, { AppModalInterface } from '../../modal/AppModal.vue';
import AppModalFloatingHeader from '../../modal/AppModalFloatingHeader.vue';
import { useModal } from '../../modal/modal.service';
import AppScrollAutoload from '../../scroll/AppScrollAutoload.vue';
import { kThemeFgMuted } from '../../theme/variables';
import { $gettext } from '../../translate/translate.service';
import AppUserList from '../../user/list/AppUserList.vue';
import { User } from '../../user/user.model';
import AppReactionList from '../list/AppReactionList.vue';
import { ReactionableModel, ReactionCount } from '../reaction.model';

const perPage = 30;

interface ReactionDetailsFeed {
	reaction: ReactionCount;
	users: Ref<User[]>;
	page: number;
	isLoadingMore: Ref<boolean>;
	isBootstrapped: Ref<boolean>;
	reachedEnd: Ref<boolean>;
}

const props = defineProps({
	model: {
		type: Object as PropType<ReactionableModel>,
		required: true,
	},
	initialReaction: {
		type: Object as PropType<ReactionCount>,
		default: undefined,
	},
});

const { model, initialReaction } = toRefs(props);

const modal = useModal<void>()!;
const rootModal = ref<AppModalInterface>();

const selectedReaction = ref(null) as Ref<ReactionCount | null>;
const reactionFeeds = shallowRef(new Map<number, ReactionDetailsFeed>());

const currentFeed = computed(() => {
	if (selectedReaction.value) {
		return reactionFeeds.value.get(selectedReaction.value.id) || null;
	}
	return null;
});

function makeReactionFeed(reaction: ReactionCount): ReactionDetailsFeed {
	return {
		reaction,
		users: ref([]),
		page: 1,
		isLoadingMore: ref(false),
		isBootstrapped: ref(false),
		reachedEnd: ref(false),
	};
}

function selectReaction(reaction: ReactionCount) {
	const isSameFeed = selectedReaction.value?.id === reaction.id;

	rootModal.value?.scrollTo(0);

	if (isSameFeed) {
		return;
	}
	selectedReaction.value = reaction;

	let feed: ReactionDetailsFeed | null = null;
	if (reactionFeeds.value.has(reaction.id)) {
		feed = reactionFeeds.value.get(reaction.id)!;
	} else {
		feed = makeReactionFeed(reaction);
		reactionFeeds.value.set(reaction.id, feed);
	}

	if (!feed.isBootstrapped.value) {
		bootstrapFeed(feed);
	}
}

selectReaction(initialReaction?.value || model.value.reaction_counts[0]);

async function bootstrapFeed(feed: ReactionDetailsFeed) {
	if (feed.isBootstrapped.value || feed.isLoadingMore.value) {
		return;
	}

	try {
		const newPage = 1;
		const response = await Api.sendRequest(
			`/web/reactions/for-resource?${getQueryParamsForFeed(feed, newPage)}`,
			undefined,
			{ detach: true }
		);

		if (response.success === false) {
			throw response;
		}

		feed.page = newPage;
		const users = User.populate(response.users);
		feed.users.value = users;

		if (!users.length) {
			feed.reachedEnd.value = true;
		}
	} catch (_) {
		// Error state is shown in the modal itself.
	}

	feed.isBootstrapped.value = true;
}

async function loadMore(feed: ReactionDetailsFeed | null) {
	if (!feed || !feed.isBootstrapped.value || feed.isLoadingMore.value || feed.reachedEnd.value) {
		return;
	}

	feed.isLoadingMore.value = true;

	try {
		const newPage = feed.page + 1;
		const response = await Api.sendRequest(
			`/web/reactions/for-resource?${getQueryParamsForFeed(feed, newPage)}`,
			undefined,
			{ detach: true }
		);

		if (response.success === false) {
			throw response;
		}

		feed.page = newPage;
		const users = User.populate(response.users);

		if (!users.length) {
			feed.reachedEnd.value = true;
		} else {
			feed.users.value = feed.users.value.concat(...users);
		}
	} catch (_) {}

	feed.isLoadingMore.value = false;
}

function getQueryParamsForFeed(feed: ReactionDetailsFeed, newPage: number) {
	return [
		`resource=${model.value.typename__}`,
		`resourceId=${model.value.id}`,
		`emojiId=${feed.reaction.id}`,
		`page=${newPage}`,
		`perPage=${perPage}`,
	].join('&');
}
</script>

<template>
	<AppModal ref="rootModal">
		<AppModalFloatingHeader>
			<template #modal-controls>
				<div class="modal-controls">
					<AppButton @click="modal.dismiss()">
						{{ $gettext(`Close`) }}
					</AppButton>
				</div>
			</template>

			<template #bottom>
				<!-- TODO(reactions) pin this to the side or make this horizontally scrollable. -->
				<AppReactionList
					:model="model"
					:focused-id="selectedReaction?.id"
					click-action="emit-click"
					@item-click="selectReaction"
				/>

				<div
					v-if="currentFeed"
					:style="{
						color: kThemeFgMuted,
						fontSize: kFontSizeBase.px,
						fontWeight: `bold`,
						paddingBottom: `4px`,
					}"
				>
					{{ currentFeed.reaction.commandName }}
				</div>
			</template>
		</AppModalFloatingHeader>

		<div
			class="modal-body"
			:style="{
				minHeight: `200px`,
			}"
		>
			<template v-if="!currentFeed">
				<div class="well fill-offset">
					{{ $gettext(`Please select a reaction.`) }}
				</div>
			</template>
			<template
				v-else-if="currentFeed.isBootstrapped.value && !currentFeed.users.value.length"
			>
				<div class="well fill-offset">
					{{ $gettext(`We couldn't find any users that used that reaction.`) }}
				</div>
			</template>
			<template v-else>
				<AppLoadingFade :is-loading="!currentFeed.isBootstrapped.value">
					<AppUserList :users="currentFeed.users.value" />

					<AppScrollAutoload
						:key="currentFeed.reaction.id"
						:can-load-more="
							currentFeed.isBootstrapped.value && !currentFeed.reachedEnd.value
						"
						:load-more="() => loadMore(currentFeed)"
					/>
				</AppLoadingFade>
			</template>
		</div>
	</AppModal>
</template>
