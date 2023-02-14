<script lang="ts">
import {
	computed,
	CSSProperties,
	nextTick,
	onMounted,
	onUnmounted,
	PropType,
	ref,
	toRefs,
	unref,
} from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { sleep } from '../../../../utils/utils';
import { MaybeRef } from '../../../../utils/vue';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/AppButton.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import { ImgHelper } from '../../../img/helper/helper-service';
import AppLoading from '../../../loading/AppLoading.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import { illBackpackClosed, illBackpackOpen } from '../../../quest/ill/illustrations';
import { Screen } from '../../../screen/screen-service';
import AppThemeSvg from '../../../theme/svg/AppThemeSvg.vue';
import { $gettext } from '../../../translate/translate.service';
import AppStickerStackItem from '../../stack/AppStickerStackItem.vue';
import { sortStickerCounts, useStickerStore } from '../../sticker-store';
import { Sticker, StickerStack } from '../../sticker.model';
import AppStickerPack from '../AppStickerPack.vue';
import { UserStickerPack } from '../user_pack.model';

const DurationStickerShow = 500;
const DurationStickerStash = 750;

const DurationBackpackOpen = 250;
const DurationBackpackClose = 500;

const DurationModalClose = 250;

const DurationPackFade = 500;
const DurationBackpackFade = 500;

const OffsetSliceTop = 15;
const DurationSliceTop = 1_000;
const DelayPackTrash = DurationSliceTop * 0.75;
const DurationPackTrash = 1_000;

const DurationStickerAnimationOffset = 200;

type PackOpenStage =
	| 'confirm'
	| 'pack-open'
	| 'pack-slice'
	| 'results-show'
	| 'results-stash'
	| 'closing';

/**
 * Returns an error message if we've encountered one.
 *
 * If {@link myPacks} is provided, we'll remove packs matching {@link packId}
 * under certain conditions.
 */
export function checkPackOpenPayloadErrors({
	payload,
	packId,
	myPacks,
}: {
	payload: any;
	packId: number;
	/**
	 * Provide to remove packs matching {@link packId} under certain error
	 * conditions.
	 */
	myPacks: UserStickerPack[];
}) {
	if (payload.success) {
		return null;
	}

	const reason = payload.reason;
	let removeFromCollection = false;
	let errorMessage: string | null = null;

	if (reason === 'already-opened') {
		errorMessage = $gettext(`You've already opened this pack.`);
		removeFromCollection = true;
	} else if (reason === 'pack-expired') {
		errorMessage = $gettext(`This pack has already expired.`);
		removeFromCollection = true;
	}

	if (!errorMessage) {
		errorMessage = packOpenFallbackError;
	}

	if (removeFromCollection) {
		arrayRemove(myPacks, i => i.id === packId);
	}

	return errorMessage;
}

export const packOpenFallbackError = $gettext(
	`Something went wrong opening this pack. Try again later.`
);
</script>

<script lang="ts" setup>
const modal = useModal()!;

const props = defineProps({
	pack: {
		type: Object as PropType<UserStickerPack>,
		required: true,
	},
	/**
	 * Set to `true` if we want to open the pack immediately and display
	 * results, otherwise we'll ask them to confirm the pack opening.
	 */
	openImmediate: {
		type: Boolean,
	},
});

const { pack } = toRefs(props);

const { stickerPacks: myPacks, drawerItems: myStickers } = useStickerStore();

const root = ref<HTMLDivElement>();
const packSlice = ref<HTMLDivElement>();
const packTrash = ref<HTMLDivElement>();

const stage = ref<PackOpenStage>('confirm');
const openedStickers = ref<Sticker[]>([]);
const expandStickers = ref(false);

const shownContainer = ref<'pack' | 'backpack'>('pack');
const shownBackpack = ref<'open' | 'closed'>('closed');

let _isMounted = false;

const stickerAnimationDuration = computed(() =>
	expandStickers.value ? DurationStickerShow : DurationStickerStash
);

const stickerSizing = computed<CSSProperties>(() => {
	let size = 128;
	if (Screen.isXs) {
		size = Math.min(size, Math.max(Screen.width * 0.2, size / 2));
	}
	return { width: `${size}px`, height: `${size}px` };
});

onMounted(() => afterMount());
onUnmounted(() => {
	_isMounted = false;
});

async function afterMount() {
	if (_isMounted) {
		return;
	}
	_isMounted = true;

	if (props.openImmediate) {
		setStage('pack-open');
	}
}

async function _openPack() {
	let errorMessage: string | null = null;

	try {
		const packId = pack.value.id;
		const payload = await Api.sendRequest(
			`/web/stickers/open-pack/${packId}`,
			{},
			{ detach: true }
		);

		// See if we got an error message. This will also remove the pack we're
		// opening from our owned packs if we encountered certain errors.
		errorMessage = checkPackOpenPayloadErrors({
			payload,
			packId,
			myPacks: myPacks.value,
		});
		if (errorMessage) {
			throw Error('Got a payload error when opening pack.');
		}

		// Request went through, remove pack from our owned packs.
		arrayRemove(myPacks.value, i => i.id === packId);

		const rawStickers = payload.stickers;
		if (!rawStickers || !Array.isArray(rawStickers) || !rawStickers.length) {
			throw Error('Got no stickers returned when opening pack.');
		}

		const newStickers: Sticker[] = Sticker.populate(rawStickers);
		openedStickers.value = newStickers;
		// Sort our owned stickers, adding our new stickers to the list.
		sortMyStickers(newStickers);

		if (!_isMounted) {
			return;
		}

		// Preload our images so backpack and sticker assets show as soon as we
		// want them to.
		preloadImages();
		setStage('pack-slice');
	} catch (e) {
		console.error('Error while opening pack.', e);
		showErrorGrowl(errorMessage || packOpenFallbackError);
		setStage('closing');
	}
}

async function playSliceAnimations() {
	// Delay by a bit. Helps make the animation more noticeable.
	await sleep(500);

	// Play slice and trash wrapper animations.
	const elements = [packSlice.value, packTrash.value];
	for (const item of elements) {
		if (item) {
			item.style.animationPlayState = 'running';
			// playAnimation(item);
		}
	}
	await sleep(DelayPackTrash + DurationPackTrash * 0.5);
}

function preloadImages() {
	const urls = [
		illBackpackClosed.path,
		illBackpackOpen.path,
		...openedStickers.value.map(i => i.img_url),
	];
	urls.forEach(url => ImgHelper.loaded(url));
}

function sortMyStickers(newStickers: Sticker[]) {
	const allStickers = [...myStickers.value];

	// Increment or add new stickers to our existing list as required.
	for (const sticker of newStickers) {
		const cb = (i: StickerStack) => i.sticker_id === sticker.id;
		const existing = allStickers.find(cb);

		if (existing) {
			++existing.count;
		} else {
			allStickers.push({
				count: 1,
				sticker,
				sticker_id: sticker.id,
			});
		}
	}

	const eventStickers: StickerStack[] = [];
	const generalStickers: StickerStack[] = [];

	for (const item of allStickers) {
		if (item.sticker.is_event) {
			eventStickers.push(item);
		} else {
			generalStickers.push(item);
		}
	}

	const newStickerIds = newStickers.map(i => i.id);
	myStickers.value = sortStickerCounts({
		eventStickers,
		generalStickers,
		newStickerIds,
	}).flat();
}

async function setStage(newStage: PackOpenStage) {
	// Do nothing if we're already on the stage or we've already initiated a
	// modal close.
	if (stage.value === newStage || !_isMounted) {
		return;
	}

	// Ignore other setStage calls if we're already attempting to close.
	if (stage.value === 'closing') {
		return;
	}

	stage.value = newStage;

	if (newStage === 'confirm') {
		// Nothing to do.
		return;
	}

	// Sends a request to open our pack, process new stickers or pack errors.
	if (newStage === 'pack-open') {
		_openPack();
		return;
	}

	if (newStage === 'pack-slice') {
		await playSliceAnimations();
		setStage('results-show');
		return;
	}

	// Displays the results of our pack opening, animating stickers coming out
	// of the pack we just opened.
	if (newStage === 'results-show') {
		// Wait for sticker elements to build.
		await nextTick();

		// Tell the stickers to "expand", causing them to animate out from the pack.
		expandStickers.value = true;

		const stickerElements =
			root.value?.querySelectorAll<HTMLDivElement>(`._anim-sticker`) || [];

		for (let i = 0; i < stickerElements.length; i++) {
			const element = stickerElements[i];

			element.style.animationPlayState = 'running';
			// playAnimation(element);

			if (i === stickerElements.length - 1) {
				const cb = () => {
					if (!_isMounted || stage.value !== 'results-show') {
						element.removeEventListener('animationend', cb);
					}
					onFinalStickerAnimationEnd();
				};

				element.addEventListener('animationend', cb, {
					passive: true,
				});
			}
		}

		return;
	}

	//  Animates stickers from their `results-show` position and animates them
	//  entering the backpack.
	if (newStage === 'results-stash') {
		// Tell the stickers to animate back towards the pack/backpack.
		expandStickers.value = false;

		for (let i = 0; i < openedStickers.value.length; i++) {
			const element = root.value?.querySelector<HTMLDivElement>(`._sticker-${i}`);
			if (!element) {
				continue;
			}

			// Reverse animations, causing stickers to animate towards the
			// backpack.
			playAnimation(element, {
				reverse: true,
			});
		}
		return;
	}

	if (newStage === 'closing') {
		closeModal();
		return;
	}
}

/**
 * "Resets" the animation of an element, changing direction as directed.
 */
function playAnimation(
	element: MaybeRef<HTMLElement | null | undefined>,
	{ reverse }: { reverse?: boolean } = {}
) {
	const rawElement = unref(element);
	if (!rawElement) {
		return;
	}

	rawElement.style.animationName = 'unset';
	if (reverse) {
		rawElement.style.animationDirection = 'reverse';
	} else if (rawElement.style.animationDirection === 'reverse') {
		rawElement.style.animationDirection = 'normal';
	}
	// Force a reflow so it animates again.
	rawElement.offsetWidth;
	rawElement.style.animationName = '';
}

function getBottomForRotation(angle: number) {
	const maxAngle = 120 / 2;
	const factor = Math.abs(angle) / maxAngle;
	return Math.max(Screen.height * 0.15, Screen.height * 0.25 * factor);
}

function getRotationForIndex(index: number) {
	const originFromTop = Screen.height * 0.5;
	const stickerLandingFromOrigin = originFromTop * 0.5;
	const stickerLandingHalfWidth = (Screen.width - 64) / 2;
	const coneEdgeLength = Math.sqrt(
		Math.pow(stickerLandingFromOrigin, 2) + Math.pow(stickerLandingHalfWidth, 2)
	);

	const radians = Math.asin(stickerLandingHalfWidth / coneEdgeLength);
	const angle = radians / (Math.PI / 180);

	const maxRange = 120;
	const range = Math.min(angle * 2, maxRange);
	const offset = -range / 2;

	if (index === 0) {
		return offset;
	}

	return (index / (openedStickers.value.length - 1)) * range + offset;
}

async function onFinalStickerAnimationEnd() {
	if (stage.value === 'results-show') {
		await sleep(200);

		// Replace sticker pack with a backpack.
		shownContainer.value = 'backpack';

		// Wait a bit for the backpack to animate in.
		await sleep(DurationBackpackFade);

		// Set the backpack to open, animating it in.
		shownBackpack.value = 'open';

		// Give some breathing room for the animation.
		await sleep(DurationBackpackOpen * 2);
		setStage('results-stash');
		return;
	}

	if (stage.value === 'results-stash') {
		// Close the backpack.
		shownBackpack.value = 'closed';

		// Allow the animation to play for a little bit.
		await sleep(DurationBackpackClose);

		setStage('closing');
		return;
	}
}

function onClickBackdrop() {
	// This stage shows its own "close" button.
	if (stage.value === 'confirm') {
		return;
	}
	setStage('closing');
}

async function closeModal() {
	// Wait for elements to fade out.
	await sleep(DurationModalClose);
	modal.dismiss();
}

function ignoreWhen(condition: boolean): CSSProperties {
	return condition ? { pointerEvents: 'none' } : {};
}

function addMs(value: number) {
	return `${value}ms`;
}
</script>

<template>
	<div ref="root">
		<AppModal
			class="anim-fade-in"
			:class="{
				'_anim-modal-fade-out': stage === 'closing',
			}"
		>
			<div
				class="theme-dark"
				:style="{
					position: 'absolute',
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'stretch',
					overflow: 'hidden',
				}"
				@click="onClickBackdrop()"
			>
				<div
					:style="{
						position: 'absolute',
						width: '75vw',
						minWidth: '100px',
						maxWidth: '300px',
						zIndex: 2,
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}"
				>
					<div
						:style="{
							position: 'relative',
						}"
					>
						<!-- Pack container -->
						<div
							class="_strong-ease-out"
							:style="{
								width: '100%',
								pointerEvents: 'none',
								opacity: shownContainer === 'pack' ? 1 : 0,
								transition: `transform ${DurationPackFade}ms, opacity ${DurationPackFade}ms`,
								transform: `scale(${shownContainer === 'pack' ? 1 : 0.8})`,
								transformOrigin: 'center',
							}"
						>
							<div
								:style="{
									position: 'relative',
									display: 'grid',
								}"
							>
								<!-- Pack (bottom wrapper) -->
								<div
									:style="{
										clipPath:
											`polygon(` +
											`0% ${OffsetSliceTop}%,` +
											`0% 100%,` +
											`100% 100%,` +
											`100% ${OffsetSliceTop}%)`,
									}"
								>
									<AppStickerPack :pack="pack.sticker_pack" />
								</div>

								<!-- Pack (top wrapper) -->
								<div
									ref="packTrash"
									class="_anim-pack-trash"
									:style="{
										position: 'absolute',
										width: '100%',
										top: 0,
										left: 0,
										clipPath:
											`polygon(` +
											`0% ${OffsetSliceTop + 1}%,` +
											`100% ${OffsetSliceTop + 1}%,` +
											`100% 0%,` +
											`0% 0%)`,
										animationDelay: `${DelayPackTrash}ms`,
										animationDuration: `${DurationPackTrash}ms`,
									}"
								>
									<AppStickerPack :pack="pack.sticker_pack" />
								</div>

								<AppLoading
									v-if="stage === 'pack-open'"
									:style="{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
									}"
									stationary
									centered
									hide-label
								/>
							</div>

							<!-- Slice animation -->
							<div
								ref="packSlice"
								class="_anim-slice"
								:style="{
									top: `${OffsetSliceTop}%`,
									transform: `translateY(-50%)`,
									animationDuration: `${DurationSliceTop}ms`,
								}"
							/>
						</div>

						<!-- Close button -->
						<AppButton
							class="_strong-ease-out"
							:style="{
								position: 'absolute',
								bottom: '100%',
								left: '100%',
								zIndex: 2,
								transition: `opacity 300ms`,
								opacity: stage === 'confirm' ? 1 : 0,
								...ignoreWhen(stage !== 'confirm'),
							}"
							icon="remove"
							circle
							sparse
							trans
							solid
							@click.capture.stop="setStage('closing')"
						/>

						<!-- Open button -->
						<AppButton
							class="_strong-ease-out"
							:style="{
								position: 'absolute',
								top: 'calc(100% + 16px)',
								opacity: stage === 'confirm' ? 1 : 0,
								transition: 'opacity 200ms',
								...ignoreWhen(stage !== 'confirm'),
							}"
							solid
							primary
							block
							overlay
							@click.capture.stop="setStage('pack-open')"
						>
							{{ $gettext(`Open pack`) }}
						</AppButton>
					</div>
				</div>

				<!-- Opened stickers -->
				<!-- Stickers initial positioning -->
				<div
					v-for="(sticker, index) of openedStickers"
					:key="index"
					class="_weak-ease-in"
					:style="{
						position: 'absolute',
						left: '50%',
						bottom: stage === 'results-stash' ? `64px` : `60%`,
						transition: `bottom`,
						transitionDuration: `${stickerAnimationDuration}ms`,
						transitionDelay: `${index * DurationStickerAnimationOffset}ms`,
						transform: 'translateX(-50%)',
						zIndex: 3 + index,
						pointerEvents: 'none',
						...stickerSizing,
					}"
				>
					<!-- Stickers rotation -->
					<div
						:style="{
							transform: `rotate(${getRotationForIndex(index)}deg)`,
							transformOrigin: `center center`,
						}"
					>
						<!-- Stickers offset -->
						<div
							class="_anim-sticker"
							:class="[
								`_sticker-${index}`,
								{
									'_strong-ease-out': expandStickers,
								},
							]"
							:style="{
								transition: `bottom`,
								transitionDelay: `${index * DurationStickerAnimationOffset}ms`,
								animationDelay: `${index * DurationStickerAnimationOffset}ms`,
								transitionDuration: `${stickerAnimationDuration}ms`,
								animationDuration: `${stickerAnimationDuration}ms`,
								position: 'relative',
								bottom: expandStickers
									? `${getBottomForRotation(getRotationForIndex(index))}px`
									: 0,
							}"
						>
							<!-- Stickers counter-rotation -->
							<div
								:style="{
									transform: `rotate(${-getRotationForIndex(index) * 0.75}deg)`,
								}"
							>
								<!-- Stickers scale -->
								<AppStickerStackItem
									:style="{
										transform:
											stage === 'results-show' ? `scale(1)` : `scale(0.5)`,
										transformOrigin: `center center`,
										transition: `transform`,
										transitionDuration:
											stage === 'results-stash'
												? `${stickerAnimationDuration * 2}ms`
												: `${stickerAnimationDuration}ms`,
										transitionDelay: `${
											index * DurationStickerAnimationOffset
										}ms`,
									}"
									:img-url="sticker.img_url"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Backpacks -->
				<div
					v-if="shownContainer === 'backpack'"
					:style="{
						position: 'absolute',
						bottom: 0,
						left: '50%',
						width: '100vw',
						maxWidth: `${illBackpackClosed.width}px`,
						minWidth: `${illBackpackClosed.width / 2}px`,
						pointerEvents: 'none',
						transform: `translate(-50%, ${stage === 'closing' ? 50 : 25}%)`,
						transition: `transform ${DurationBackpackFade}ms`,
						zIndex: 0,
					}"
				>
					<div
						class="anim-fade-in-up"
						:style="{
							width: '100%',
							transitionDuration: `${DurationBackpackFade}ms`,
						}"
					>
						<!-- Backpack closed -->
						<AppThemeSvg
							:style="{
								width: '100%',
							}"
							:src="illBackpackClosed.path"
							strict-colors
						/>

						<!-- Backpack open -->
						<Transition name="fade">
							<AppThemeSvg
								v-if="shownBackpack === 'open'"
								:style="{
									position: 'absolute',
									left: 0,
									top: 0,
									width: '100%',
									animationDuration: `${
										shownBackpack === 'open'
											? DurationBackpackOpen
											: DurationBackpackClose
									}ms !important`,
								}"
								:src="illBackpackOpen.path"
								strict-colors
							/>
						</Transition>
					</div>
				</div>
			</div>
		</AppModal>
	</div>
</template>

<style lang="stylus" scoped>
::v-deep(.modal)
	change-bg-rgba('0, 0, 0', 0.87, true)

._anim-modal-fade-out
	animation-name: anim-fade-out
	animation-duration: v-bind('addMs(DurationModalClose)')
	animation-timing-function: $weak-ease-out !important
	animation-fill-mode: both

._ease-out-back
	transition-timing-function: $ease-out-back !important

._weak-ease-in
	transition-timing-function: $weak-ease-in !important

._weak-ease-in-out
	transition-timing-function: $weak-ease-in-out !important

._anim-weak-ease-in-out
	animation-timing-function: $weak-ease-in-out !important

._strong-ease-out
	transition-timing-function: $strong-ease-out !important

._anim-sticker
	animation-name: anim-sticker
	animation-fill-mode: both
	animation-play-state: paused

._anim-slice
	animation-name: anim-slice
	animation-fill-mode: both
	animation-play-state: paused
	animation-timing-function: $weak-ease-in-out
	height: 3px
	border-radius: 50%
	background-image: linear-gradient(to right, transparent, white, white, transparent)
	background-size: 200% 100%
	background-repeat: no-repeat
	position: absolute
	left: -25%
	right: -25%

._anim-pack-trash
	animation-name: anim-pack-trash
	animation-fill-mode: both
	animation-play-state: paused
	animation-timing-function: $strong-ease-out

.fade-enter-active
.fade-leave-active
	z-index: 0
	transition: opacity 300ms, transform 300ms

.fade-enter-from
.fade-leave-to
	position: absolute
	opacity: 0
	z-index: -1

@keyframes anim-fade-out
	0%
		opacity: 1

	100%
		opacity: 0

@keyframes anim-sticker
	0%
		opacity: 0

	50%
		opacity: 1

@keyframes anim-slice
	0%
		background-position: 200% 0%

	100%
		background-position: -200% 0%

@keyframes anim-pack-trash
	0%
		transform: translate(0px, 0px) rotate(0deg) scale(1)
		opacity: 1

	100%
		transform: translate(-24px, -48px) rotate(-15deg) scale(0.8)
		opacity: 0
</style>
