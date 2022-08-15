<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import { InviteFriendModal } from '../modal/friend-invite/modal.service';
import AppSpacer from '../spacer/AppSpacer.vue';
import { useCommonStore } from '../store/common-store';
import { $gettext } from '../translate/translate.service';
import AppQuestProgress from './AppQuestProgress.vue';
import { Quest, QuestStatus } from './quest-model';
import { QuestObjective, QuestObjectiveStatus, QuestObjectiveType } from './quest-objective-model';

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	objective: {
		type: Object as PropType<QuestObjective>,
		required: true,
	},
});

const { quest, objective } = toRefs(props);
const { user } = useCommonStore();

const iconData = computed<{ icon: Jolticon; classes: string[] }>(() => {
	const i = objective.value;
	const isQuestStart = i.type === QuestObjectiveType.questStart;
	const canAccept = quest.value.status == QuestStatus.available;

	if (i.has_unclaimed_rewards || (isQuestStart && canAccept)) {
		return { icon: 'exclamation', classes: ['-link', '-link-shadow'] };
	} else if (i.status === QuestObjectiveStatus.complete) {
		return { icon: 'star', classes: ['-link'] };
	} else {
		return { icon: 'hr', classes: ['-fade'] };
	}
});

const isFriendInvite = computed(() => objective.value.type === QuestObjectiveType.inviteFriend);
const subtitleData = computed<{ text: string; icon: Jolticon } | undefined>(() => {
	if (!isFriendInvite.value) {
		return undefined;
	}
	return { text: $gettext(`Get your personalized invite link`), icon: 'arrow-right' };
});

function onClickSubtitle() {
	if (!user.value) {
		return;
	}

	if (isFriendInvite.value) {
		InviteFriendModal.show({
			user: user.value,
		});
	}
}
</script>

<template>
	<div class="-quest-objective" :class="{ '-disabled': objective.isDisabled }">
		<div class="-icon" :class="iconData.classes">
			<AppJolticon :icon="iconData.icon" />
		</div>
		<AppSpacer horizontal :scale="5" />
		<div class="-details">
			<div class="-title">
				<!-- TODO(quest) inline-sticker support -->

				<span>
					{{ objective.title }}
				</span>

				<span v-if="objective.is_optional" class="text-muted">
					({{ $gettext('optional') }})
				</span>
			</div>

			<template v-if="subtitleData">
				<AppSpacer vertical :scale="isFriendInvite ? 2 : 1" />
				<component
					:is="isFriendInvite ? 'a' : 'span'"
					:v-app-auth-required="isFriendInvite"
					class="-subtitle"
					:class="{ '-link': isFriendInvite }"
					@click="onClickSubtitle"
				>
					<span>
						{{ subtitleData.text }}
					</span>
					<AppJolticon :icon="subtitleData.icon" />
				</component>
			</template>

			<template v-if="objective.hasProgressDisplay">
				<AppSpacer vertical :scale="3" />
				<AppQuestProgress
					:progress="objective.current_progress_ticks"
					:max-progress-ticks="objective.max_progress_ticks"
					:is-percent="objective.isPercent"
					:is-segmented="objective.isSegmented"
					show-end-display
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-quest-objective
	display: flex

	&.-disabled
		opacity: 0.3

.-icon
	position: relative
	display: flex
	align-items: center
	justify-content: center
	top: 2px
	width: 16px
	height: 16px

	&.-link-shadow
		text-shadow: var(--theme-link) 0 0 4px

.-link
	color: var(--theme-link)

	&:hover
		color: var(--theme-link-hover)


.-details
	width: 100%

.-title
	font-size: $font-size-small
	display: inline-flex
	grid-gap: 8px

.-subtitle
	display: inline-flex
	align-items: center
	font-size: $font-size-tiny

	.jolticon
		font-size: $font-size-small
</style>
