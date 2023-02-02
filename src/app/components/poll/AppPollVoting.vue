<script lang="ts" setup>
import { onUnmounted } from '@vue/runtime-core';
import { computed, onMounted, PropType, ref, toRefs } from 'vue';
import { vAppAuthRequired } from '../../../_common/auth/auth-required-directive';
import AppButton from '../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../_common/filters/number';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { PollItem } from '../../../_common/poll/item/item.model';
import { Poll } from '../../../_common/poll/poll.model';
import AppProgressBar from '../../../_common/progress/AppProgressBar.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { $ngettext } from '../../../_common/translate/translate.service';

const props = defineProps({
	poll: {
		type: Object as PropType<Poll>,
		required: true,
	},
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const { poll, post } = toRefs(props);

const { user: myUser } = useCommonStore();

const chosenItemId = ref<number | null>(null);
const isProcessing = ref(false);
const areResultsReady = ref(false);
const now = ref(Date.now());
const dateRefresh = ref<NodeJS.Timer | null>(null);

const game = computed(() => post.value.game);
const user = computed(() => post.value.user);

const isOwner = computed(() => !!myUser.value && user.value.id === myUser.value.id);
const shouldObscureResults = computed(() => poll.value.is_private && !isOwner.value);

const showResults = computed(
	() =>
		(!isVotable.value && areResultsReady.value) ||
		votedId.value !== null ||
		(game.value && game.value.hasPerms()) ||
		isOwner.value
);

const votedId = computed(() => {
	for (const item of poll.value.items) {
		if (item.is_voted) {
			return item.id;
		}
	}
	return null;
});

const isVotable = computed(() => poll.value.end_time && poll.value.end_time > now.value);

onMounted(() => {
	if (isVotable.value) {
		setDateRefresh();
	} else {
		areResultsReady.value = true;
	}
});

onUnmounted(() => {
	clearDateRefresh();
});

function getItemPercentage(item: PollItem) {
	return (item.vote_count || 0) / Math.max(poll.value.vote_count, 1);
}

async function vote(id: number) {
	if (isProcessing.value) {
		return;
	}

	isProcessing.value = true;
	const payload = await poll.value.$vote(id);
	handleVotePayload(payload);
	isProcessing.value = false;
}

function handleVotePayload(payload: any) {
	const parentResourceField = 'parent_resource_model';
	if (!payload || !payload[parentResourceField]) {
		return;
	}

	switch (payload.parent_resource) {
		case 'Fireside_Post':
			post.value.processUpdate(payload, parentResourceField);
			break;
		case 'Game':
			game.value?.processUpdate(payload, parentResourceField);
			break;
		case 'User':
			user.value.processUpdate(payload, parentResourceField);
			break;
	}
}

function clearDateRefresh() {
	if (import.meta.env.SSR) {
		return;
	}

	if (dateRefresh.value) {
		clearInterval(dateRefresh.value);
		dateRefresh.value = null;
	}
}

function setDateRefresh() {
	if (import.meta.env.SSR) {
		return;
	}

	clearDateRefresh();
	dateRefresh.value = setInterval(async () => {
		now.value = Date.now();
		if (!isVotable.value) {
			clearDateRefresh();
			await poll.value.$refresh();
			areResultsReady.value = true;
		}
	}, 1000);
}
</script>

<template>
	<div class="poll-voting">
		<template v-if="!showResults">
			<div class="form-group">
				<div v-for="item of poll.items" :key="item.id" class="radio">
					<label>
						<input
							v-model="chosenItemId"
							type="radio"
							:value="item.id"
							:disabled="isProcessing ? 'true' : undefined"
						/>
						{{ item.text }}
					</label>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				v-for="item of poll.items"
				:key="item.id"
				:style="
					item.is_voted
						? {
								fontWeight: `bold`,
						  }
						: {}
				"
			>
				<AppProgressBar :percent="getItemPercentage(item) * 100">
					<span
						v-if="!shouldObscureResults"
						:style="{
							display: `inline-block`,
							width: `50px`,
							fontWeight: `bold`,
							marginRight: `10px`,
							textAlign: `right`,
						}"
					>
						{{
							formatNumber(getItemPercentage(item), {
								style: 'percent',
								maximumFractionDigits: 0,
							})
						}}
					</span>

					{{ item.text }}
				</AppProgressBar>
			</div>

			<div v-if="poll.is_private" class="alert">
				{{ $gettext(`The results of this poll are private.`) }}
			</div>
		</template>

		<div>
			<template v-if="!showResults">
				<span v-app-auth-required>
					<AppButton
						:disabled="!chosenItemId || isProcessing"
						@click="vote(chosenItemId!)"
					>
						{{ $gettext(`Vote`) }}
					</AppButton>
				</span>
				&nbsp;
			</template>

			<span class="text-muted">
				{{
					$gettextInterpolate(
						$ngettext('%{ votes } vote', '%{ votes } votes', poll.vote_count || 0),
						{ votes: formatNumber(poll.vote_count || 0) }
					)
				}}

				<span class="dot-separator" />

				<AppTimeAgo v-if="isVotable" :date="poll.end_time" is-future />
				<template v-else-if="poll.end_time">
					{{ $gettext(`Voting finished`) }}
				</template>
				<template v-else>
					{{ $gettext(`Draft poll`) }}
				</template>
			</span>
		</div>
	</div>
</template>
