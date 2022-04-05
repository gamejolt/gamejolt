<script lang="ts">
import { nextTick, onMounted, PropType, ref, Ref, toRefs } from 'vue';
import { Jolticon } from '../../jolticon/AppJolticon.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppThemeSvg from '../../theme/svg/AppThemeSvg.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppQuestThumbnail from '../AppQuestThumbnail.vue';
import illBackpackClosed from '../ill/backpack-closed.svg';
import illBackpackOpen from '../ill/backpack-open.svg';
import { Quest } from '../quest-model';
import { QuestReward } from '../quest-reward';
import AppQuestRewardItem from './AppQuestRewardItem.vue';

export interface QuestRewardData {
	/**
	 * The index id of the backback item element. This is used so we can remove
	 * the element after its animation ends.
	 */
	id: number;

	/** The image to display, if any. Uses [icon] as a fallback. */
	img_url?: string;

	/**
	 * If [img_url] is empty, displays a fallback Jolticon. Uses `present` as a
	 * fallback.
	 */
	icon?: Jolticon;

	// /** The offset-path trajectory of this reward item */
	// path: string;

	// /**
	//  * If the offset-path is starting from the right side of the backpack asset.
	//  * Determines our rotation animation direction.
	//  */
	// fromRight: boolean;

	random: number;
}

export const DurationBackpackItem = 1_500;
const DurationBackpackEnter = 1_000;
const DurationBackpackOpen = 250;
const DurationBackpackClose = 500;
const DelayBackpackOpen = 375;
</script>

<script lang="ts" setup>
const modal = useModal<boolean>()!;

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	rewards: {
		type: Array as PropType<QuestReward[]>,
		required: true,
	},
	title: {
		type: String,
		default: undefined,
	},
});

const { quest, rewards, title } = toRefs(props);

const backpackEnter = ref<HTMLElement>();
const backpackOpen = ref<HTMLElement>();

const rewardElements = ref<QuestRewardData[]>([]);
const isClosing = ref(false);

let itemAnimationOffset = 500;

onMounted(() => afterMount());

async function afterMount() {
	await nextTick();
	if (rewards.value.length > 0) {
		await startBackpackFlow();
	} else {
		await startAvatarFlow();
	}

	await closeBackpack();
	modal.dismiss();
}

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBackpackFlow() {
	openBackpack();
	await sleep(DurationBackpackItem + DurationBackpackOpen);

	let id = 0;
	for (const { amount, img_url } of rewards.value) {
		for (let i = 0; i < amount; i++) {
			rewardElements.value.push({
				id,
				img_url,
				random: Math.random(),
			});
			++id;

			// Wait to show the next item.
			await sleep(itemAnimationOffset);
			itemAnimationOffset = Math.max(100, itemAnimationOffset - 50);
		}
	}

	// Wait for our last item to finish animating.
	await sleep(DurationBackpackItem - itemAnimationOffset);
}

async function startAvatarFlow() {
	await sleep(3_000);
}

function openBackpack() {
	playAnimation(backpackEnter);
	playAnimation(backpackOpen);
}

async function closeBackpack() {
	backpackEnter.value?.classList.add('-leave');
	playAnimation(backpackEnter, { reverse: true });
	playAnimation(backpackOpen, { reverse: true });
	await sleep(DurationBackpackClose);
	isClosing.value = true;
	await sleep(DurationBackpackClose);
}

function playAnimation(
	element: Ref<HTMLElement | undefined>,
	{ reverse }: { reverse?: boolean } = {}
) {
	if (!element.value) {
		return;
	}

	element.value.style.animationName = 'unset';
	if (reverse) {
		const direction = element.value.style.animationDirection;
		element.value.style.animationDirection = direction !== 'reverse' ? 'reverse' : 'normal';
	}
	// Force a reflow so it animates again.
	element.value.offsetWidth;
	element.value.style.animationName = '';
}

function onAnimationEnd(id: number) {
	const index = rewardElements.value.findIndex(i => i.id === id);
	if (index !== -1) {
		rewardElements.value.splice(index, 1);
	}
}
</script>

<template>
	<AppModal
		class="-quest-rewards-modal anim-fade-in"
		:class="{ '-fade-out': isClosing }"
		:style="{
			animationDuration: (isClosing ? DurationBackpackClose : DurationBackpackOpen) + 'ms',
		}"
	>
		<div class="-quest-container">
			<div class="-quest-title -center-col anim-fade-in-down anim-fade-in-enlarge">
				<div class="-quest-spacer" />
				<template v-if="!!title">
					<span>
						-
						<AppTranslate>{{ 'QUEST STARTED' }}</AppTranslate>
						-
					</span>

					<span class="-quest-title-header">
						{{ title }}
					</span>
				</template>

				<AppSpacer vertical :scale="2" />

				<template v-if="rewards.length > 0">
					<span>
						-
						<AppTranslate>{{ 'YOUR REWARDS' }}</AppTranslate>
						-
					</span>

					<div
						v-for="({ img_url, name, amount }, i) of rewards"
						:key="i"
						class="-quest-title-header"
					>
						<!-- TODO(quests) don't show the 'x' for exp rewards -->
						{{ amount + 'x ' }}

						<template v-if="img_url">
							<img :src="img_url" />
						</template>
						<!-- TODO(quests) present jolticon -->

						<span>{{ ' ' + name }}</span>
					</div>
				</template>
			</div>

			<!-- TODO(quests) reward animations -->
			<template v-if="rewards.length > 0">
				<div class="-backpack">
					<div
						ref="backpackEnter"
						class="-backpack-enter"
						:style="{ animationDuration: DurationBackpackEnter + 'ms' }"
					>
						<AppThemeSvg :src="illBackpackClosed" strict-colors />
						<div
							ref="backpackOpen"
							class="-backpack-open"
							:style="{
								animationDuration: DurationBackpackOpen + 'ms',
								animationDelay: DelayBackpackOpen + 'ms',
							}"
						>
							<AppThemeSvg :src="illBackpackOpen" strict-colors />
						</div>
					</div>
				</div>

				<div class="-rewards">
					<AppQuestRewardItem
						v-for="data in rewardElements"
						:key="data.id"
						:data="data"
						@animationend="() => onAnimationEnd(data.id)"
					/>
				</div>
			</template>
			<div v-else class="-avatar">
				<AppQuestThumbnail :quest="quest" />
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>

.-test
	position: fixed
	left: 0
	top: 0
	width: 100%
	height: 100%

	> path
		stroke-width: 1
		stroke: yellow
		fill: none

.-quest-rewards-modal
	background-color: rgba(black, 0.37)

	&.-fade-out
		animation-name: anim-fade-out
		animation-timing-function: $weak-ease-out

	::v-deep(.modal)
		background-color: transparent !important

.-quest-container
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	color: white
	display: flex
	justify-content: center
	overflow: hidden

	&
	*
		overlay-text-shadow()

.-center-col
	display: flex
	flex-direction: column
	align-items: center

.-quest-spacer
	flex: 0 1 ($shell-top-nav-height + 40px)

.-quest-title
	position: relative
	z-index: 3
	font-size: calc(min(16px, 1.5vh))

.-quest-title-header
	font-size: calc(min(32px, 3vh))
	font-family: 'Germania'

	img
		height: calc(min(32px, 3vh))
		width: @height

.-backpack
	z-index: 1
	position: absolute
	bottom: 0
	pointer-events: none

.-backpack-enter
	animation-name: anim-backpack-enter
	animation-fill-mode: both
	animation-timing-function: $weak-ease-out
	width: 512px
	height: 512px
	max-width: 100vw
	max-height: 100vw
	transform: translateY(25%)

	img
		width: 100%

	&.-leave
		animation-name: anim-backpack-leave

.-backpack-open
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	opacity: 0
	animation-name: anim-backpack-open
	animation-fill-mode: both
	animation-timing-function: $weak-ease-out

	&.-show
		opacity: 1

.-rewards
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	z-index: 2

@keyframes anim-fade-out
	0%
		opacity: 1

	100%
		opacity: 0

@keyframes anim-backpack-enter
	0%
		transform: translateY(37.5%)

	50%
		transform: translateY(12.5%)

@keyframes anim-backpack-leave
	0%
		transform: translateY(75%)

	50%
		transform: translateY(18.75%)

@keyframes anim-backpack-open
	0%
		opacity: 0

	100%
		opacity: 1
</style>
