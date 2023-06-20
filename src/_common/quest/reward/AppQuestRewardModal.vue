<script lang="ts">
import { nextTick, onMounted, onUnmounted, PropType, ref, Ref, toRefs } from 'vue';
import { sleep } from '../../../utils/utils';
import { illBackpackClosed, illBackpackOpen } from '../../img/ill/illustrations';
import AppJolticon, { Jolticon } from '../../jolticon/AppJolticon.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import AppPopcornKettle from '../../popcorn/AppPopcornKettle.vue';
import { createPopcornKettleController } from '../../popcorn/popcorn-kettle-controller';
import { Screen } from '../../screen/screen-service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppThemeSvg from '../../theme/svg/AppThemeSvg.vue';
import AppQuestThumbnail from '../AppQuestThumbnail.vue';
import { Quest } from '../quest-model';

export interface QuestRewardData {
	key: string;

	/**
	 * Count of rewards by this {@link key}.
	 */
	amount: number;

	/**
	 * Readable name of the reward.
	 */
	name: string;

	/**
	 * The image to display, if any. Uses [icon] as a fallback.
	 */
	img_url: string | undefined;

	/**
	 * If [img_url] is empty, displays a fallback Jolticon. Uses `present` as a
	 * fallback.
	 */
	icon: Jolticon;

	/**
	 * If we should show an 'x' character after the reward amount.
	 */
	xAfterCount: boolean;

	/**
	 * Backend will return this along with the quest reward model. Lets us know
	 * if we should only show one kernel for this reward, or if we should add
	 * kernels equal to the total {@link amount}.
	 */
	isCondensed: boolean;
}

export const DurationBackpackItem = 1_500;
const DurationBackpackEnter = 1_000;
const DurationBackpackOpen = 250;
const DurationBackpackClose = 500;
const DelayBackpackOpen = 375;

const DurationThumbnail = 3_000;
</script>

<script lang="ts" setup>
const modal = useModal<boolean>()!;

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	rewards: {
		type: Array as PropType<QuestRewardData[]>,
		required: true,
	},
	title: {
		type: String,
		default: undefined,
	},
});

const { quest, rewards, title } = toRefs(props);

const kettleController = createPopcornKettleController();

const backpackEnter = ref<HTMLElement>();
const backpackOpen = ref<HTMLElement>();

const isClosing = ref(false);

let itemAnimationOffset = 500;
let _isMounted = false;

onMounted(() => afterMount());
onUnmounted(() => (_isMounted = false));

async function afterMount() {
	_isMounted = true;

	await nextTick();
	if (rewards.value.length > 0) {
		await startBackpackFlow();
	} else {
		await startAvatarFlow();
	}

	if (!_isMounted) {
		return;
	}

	await closeBackpack();
	modal.dismiss();
}

async function startBackpackFlow() {
	openBackpack();
	await sleep(DurationBackpackItem + DurationBackpackOpen);

	const opposite = Screen.width / 3;
	const adjacent = Screen.height * 0.7;
	const hypo = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));
	const radians = Math.asin(opposite / hypo);
	const angle = radians / (Math.PI / 180);

	for (const { amount, img_url, icon, isCondensed } of rewards.value) {
		const kernelCount = isCondensed ? 1 : amount;

		for (let i = 0; i < kernelCount; i++) {
			// Stop adding kernels if the modal was closed.
			if (!_isMounted) {
				return;
			}

			kettleController.addKernel({
				kernelImage: img_url,
				kernelComponent: img_url ? undefined : AppJolticon,
				kernelComponentProps: { icon },
				reverse: true,
				baseSize: 80,
				velocity: 40,
				downwardGravityStrength: 1.75,
				popAngleVariance: angle * 2,
				popAngle: 0,
				duration: DurationBackpackItem,
				fadeOutStart: 0.9,
			});

			// Wait to show the next item.
			await sleep(itemAnimationOffset);
			itemAnimationOffset = Math.max(100, itemAnimationOffset - 50);
		}
	}

	// Wait for our last item to finish animating.
	await sleep(DurationBackpackItem - itemAnimationOffset);
}

async function startAvatarFlow() {
	await sleep(DurationThumbnail);
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
</script>

<template>
	<AppModal
		class="-quest-rewards-modal anim-fade-in"
		:class="{ '-fade-out': isClosing }"
		:style="{
			animationDuration: (isClosing ? DurationBackpackClose : DurationBackpackOpen) + 'ms',
		}"
	>
		<div class="-quest-container" @click="modal.dismiss()">
			<div class="-quest-title -center-col anim-fade-in-down anim-fade-in-enlarge">
				<div class="-quest-spacer" />
				<template v-if="!!title">
					<span>
						-
						{{ $gettext(`QUEST STARTED`) }}
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
						{{ $gettext(`YOUR REWARDS`) }}
						-
					</span>

					<div
						v-for="({ img_url, name, amount, icon, xAfterCount }, i) of rewards"
						:key="i"
						class="-quest-title-header"
					>
						{{ amount + (xAfterCount ? 'x ' : ' ') }}

						<img v-if="img_url" class="-reward-img" :src="img_url" alt="" />
						<AppJolticon v-else :icon="icon" />

						<span>{{ ' ' + name }}</span>
					</div>
				</template>
			</div>

			<template v-if="rewards.length > 0">
				<div class="-backpack">
					<div
						ref="backpackEnter"
						class="-backpack-enter"
						:style="{
							animationDuration: `${DurationBackpackEnter}ms`,
							width: '${illBackpackClosed.width}px',
							height: '${illBackpackClosed.height}px',
						}"
					>
						<AppThemeSvg :src="illBackpackClosed.path" strict-colors />
						<div
							ref="backpackOpen"
							class="-backpack-open"
							:style="{
								animationDuration: `${DurationBackpackOpen}ms`,
								animationDelay: `${DelayBackpackOpen}ms`,
							}"
						>
							<AppThemeSvg :src="illBackpackOpen.path" strict-colors />
						</div>
						<AppPopcornKettle class="-kettle" :controller="kettleController" />
					</div>
				</div>
			</template>
			<div
				v-else
				class="-thumbnail"
				:style="{
					animationDuration: DurationThumbnail + 'ms',
				}"
			>
				<AppQuestThumbnail class="-thumbnail-inner" :quest="quest" active />
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
$-z-title = 3
$-z-rewards = 2
$-z-backpack = 1

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
	z-index: $-z-title
	font-size: calc(min(16px, 1.5vh))

.-quest-title-header
	font-size: calc(min(32px, 3vh))
	font-family: 'Germania'

	img
		height: calc(min(32px, 3vh))
		width: @height

.-reward-img
	rounded-corners()

.-kettle
	position: absolute
	z-index: $-z-rewards
	top: 0

.-backpack
	z-index: $-z-backpack
	position: absolute
	bottom: 0
	pointer-events: none

.-backpack-enter
	animation-name: anim-backpack-enter
	animation-fill-mode: both
	animation-timing-function: $weak-ease-out
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

.-thumbnail
	width: calc(min(300px, 60vw, 40vh))
	z-index: $-z-backpack
	height: @width
	position: absolute
	bottom: calc(40px + 25vh)
	animation-name: anim-thumbnail-wiggle
	animation-timing-function: ease-in-out
	animation-iteration-count: infinite

.-thumbnail-inner
	animation-name: anim-thumbnail-scale
	animation-timing-function: ease-in-out
	animation-duration: 1200ms
	animation-iteration-count: infinite

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

@keyframes anim-thumbnail-wiggle
	0%
		transform: rotateZ(-15deg)
	50%
		transform: rotateZ(15deg)
	100%
		transform: rotateZ(-15deg)

@keyframes anim-thumbnail-scale
	0%
		transform: scale(0.95)
	50%
		transform: scale(1.05)
	100%
		transform: scale(0.95)
</style>
