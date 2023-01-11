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
import { run, sleep } from '../../../../utils/utils';
import { MaybeRef } from '../../../../utils/vue';
import { Api } from '../../../api/api.service';
import AppAspectRatio from '../../../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../button/AppButton.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import { ImgHelper } from '../../../img/helper/helper-service';
import AppLoadingFade from '../../../loading/AppLoadingFade.vue';
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

const DurationStickerShow = 2_000;
const DurationStickerStash = 1_500;

const DurationBackpackEnter = 1_000;
const DurationBackpackOpen = 250;
const DurationBackpackClose = 500;

const DurationModalClose = 250;

type PackOpenStage = 'confirm' | 'pack-open' | 'results-show' | 'results-stash' | 'closing';

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

const packContainer = ref<HTMLDivElement>();

const stage = ref<PackOpenStage>('confirm');
const openedStickers = ref<Sticker[]>([]);
const shownContainer = ref<'pack' | 'backpack'>('pack');
const shownBackpack = ref<'open' | 'closed'>('closed');

let _isMounted = false;

const stickerAnimationDuration = computed(() =>
	stage.value === 'results-show' ? DurationStickerShow : DurationStickerStash
);
const stickerAnimationOffset = computed(() => (stage.value === 'results-show' ? 400 : 200));
const stickerSizing = computed<CSSProperties>(() => {
	let size = 64;
	if (Screen.isXs) {
		size = Math.min(64, Math.max(Screen.width * 0.2, 32));
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
			`/web/stickers/open_pack/${packId}`,
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

		// Show results of our pack opening.
		setStage('results-show');
	} catch (e) {
		console.error('Error while opening pack.', e);
		showErrorGrowl(errorMessage || packOpenFallbackError);
		setStage('closing');
	}
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

function setStage(newStage: PackOpenStage) {
	// Do nothing if we're already on the stage or we've already initiated a
	// modal close.
	if (stage.value === newStage || stage.value === 'closing') {
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

	// Displays the results of our pack opening, animating stickers coming out
	// of the pack we just opened.
	if (newStage === 'results-show') {
		run(async () => {
			// Wait for sticker elements to build.
			await nextTick();
			// Find the last sticker (last to animate).
			const element = packContainer.value?.querySelector<HTMLDivElement>(
				`._sticker-${openedStickers.value.length - 1}`
			);
			if (!element) {
				return;
			}
			const cb = () => {
				if (!_isMounted || stage.value === 'results-stash') {
					element.removeEventListener('animationend', cb);
				}
				onFinalStickerAnimationEnd();
			};
			element.addEventListener('animationend', cb, {
				passive: true,
			});
		});
		return;
	}

	//  Animates stickers from their `results-show` position and animates them
	//  entering the backpack.
	if (newStage === 'results-stash') {
		for (let i = 0; i < openedStickers.value.length; i++) {
			const element = packContainer.value?.querySelector<HTMLDivElement>(`._sticker-${i}`);
			if (element) {
				// Reverse animations, causing stickers to animate towards the
				// backpack.
				playAnimation(element, {
					reverse: true,
				});
			}
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
	element: MaybeRef<HTMLElement | undefined>,
	{ reverse }: { reverse?: boolean } = {}
) {
	const rawElement = unref(element);
	if (!rawElement) {
		return;
	}

	rawElement.style.animationName = 'unset';
	if (reverse) {
		const direction = rawElement.style.animationDirection;
		rawElement.style.animationDirection = direction !== 'reverse' ? 'reverse' : 'normal';
	}
	// Force a reflow so it animates again.
	rawElement.offsetWidth;
	rawElement.style.animationName = '';
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
		// Replace sticker pack with a backpack.
		shownContainer.value = 'backpack';
		// Wait for new element to load in.
		await nextTick();
		// Set the backpack to open, animating it in.
		shownBackpack.value = 'open';
		// Wait for animation to complete.
		await sleep(1_000);
		// Continue to next stage, animating stickers into the opened backpack.
		setStage('results-stash');
		return;
	}

	if (stage.value === 'results-stash') {
		// Close the backpack.
		shownBackpack.value = 'closed';
		// Allow the animation to play for a little bit.
		await sleep(DurationBackpackClose / 2);
		// Fade the modal out before closing it.
		setStage('closing');
		return;
	}
}

async function closeModal() {
	// Wait for elements to fade out.
	await sleep(DurationModalClose);
	modal.dismiss();
}
</script>

<template>
	<AppModal
		class="anim-fade-in"
		:class="{ '_fade-out': stage === 'closing' }"
		:style="{
			backgroundColor: `rgba(black, 0.37)`,
			transitionDuration: `${DurationModalClose}ms`,
		}"
	>
		<!-- TODO: Dismiss modal on tap here as well? -->
		<div
			:style="{
				position: 'absolute',
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				overflow: 'hidden',
			}"
		>
			<div
				:style="{
					position: 'relative',
					width: '40%',
					maxWidth: '160px',
					minWidth: '80px',
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'column',
				}"
			>
				<!-- "Close" button -->
				<Transition name="fade">
					<AppButton
						class="_strong-ease-out"
						:style="{
							position: 'absolute',
							bottom: '100%',
							left: '100%',
							zIndex: 2,
						}"
						icon="remove"
						circle
						sparse
						trans
						solid
						@click="modal.dismiss()"
					/>
				</Transition>

				<!-- Opened stickers, Pack/Backpack, "Open" button -->
				<AppAspectRatio
					:style="{
						position: 'relative',
						width: '100%',
						zIndex: 2,
					}"
					:ratio="1"
					show-overflow
				>
					<div ref="packContainer">
						<!-- Opened stickers -->
						<template v-if="stage === 'results-show' || stage === 'results-stash'">
							<!-- Initial positioning -->
							<div
								v-for="(sticker, index) of openedStickers"
								:key="index"
								:style="{
									position: 'absolute',
									left: '50%',
									top: '25%',
									transform: 'translate(-50%, -50%)',
									zIndex: index - openedStickers.length,
									pointerEvents: 'none',
									...stickerSizing,
								}"
							>
								<!-- Rotation -->
								<div
									:style="{
										transform: `rotate(${getRotationForIndex(index)}deg)`,
										transformOrigin: 'bottom center',
									}"
								>
									<!-- Offset -->
									<div
										class="_sticker-anim"
										:class="[`_sticker-${index}`]"
										:style="{
											animationDuration: `${stickerAnimationDuration}ms`,
											animationDelay: `${index * stickerAnimationOffset}ms`,
											animationFillMode:
												stage === 'results-stash' ? 'both' : 'backwards',
										}"
									>
										<!-- Counter-rotation -->
										<AppStickerStackItem
											:style="{
												transform: `rotate(${
													-getRotationForIndex(index) * 0.75
												}deg)`,
											}"
											:img-url="sticker.img_url"
										/>
									</div>
								</div>
							</div>
						</template>

						<!-- Pack/Backpacks, "Open" button -->
						<div
							class="anim-fade-in-up"
							:style="{
								position: 'relative',
								zIndex:
									shownContainer === 'pack' ? 1 : -(openedStickers.length + 1),
							}"
						>
							<Transition name="fade">
								<AppLoadingFade
									v-if="stage !== 'closing'"
									:key="shownContainer"
									:is-loading="stage === 'pack-open'"
									:style="{
										width: '100%',
									}"
								>
									<!-- Pack -->
									<AppStickerPack
										v-if="shownContainer === 'pack'"
										:pack="pack.sticker_pack"
										:style="{
											pointerEvents: 'none',
										}"
									/>

									<!-- Backpacks -->
									<AppAspectRatio
										v-else-if="shownContainer === 'backpack'"
										:style="{
											pointerEvents: 'none',
										}"
										:ratio="illBackpackClosed.width / illBackpackClosed.height"
										show-overflow
									>
										<div
											:style="{
												position: 'absolute',
												animationDuration: `${DurationBackpackEnter}ms`,
												left: '50%',
												top: '50%',
												transform: 'translate(-50%, -50%)',
												// Backpack has a lot of empty space.
												// Make it bigger to closer match the size of the sticker pack.
												width: '200%',
												height: '200%',
											}"
										>
											<!-- Backpack closed -->
											<AppThemeSvg
												:style="{
													width: '100%',
													height: '100%',
													animationDuration: `${DurationBackpackClose}ms`,
												}"
												:src="illBackpackClosed.path"
												strict-colors
											/>

											<!-- Backpack open -->
											<Transition name="fade-stationary">
												<AppThemeSvg
													v-if="shownBackpack === 'open'"
													:style="{
														position: 'absolute',
														left: 0,
														top: 0,
														width: '100%',
														height: '100%',
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
									</AppAspectRatio>

									<!-- "Open" button -->
									<AppButton
										class="_strong-ease-out"
										:style="{
											position: 'absolute',
											top: 'calc(100% + 16px)',
											opacity: stage === 'confirm' ? 1 : 0,
											transition: 'opacity 200ms',
											...(stage === 'confirm'
												? {}
												: { pointerEvents: 'none' }),
										}"
										solid
										primary
										block
										overlay
										@click="setStage('pack-open')"
									>
										{{ $gettext(`Open pack`) }}
									</AppButton>
								</AppLoadingFade>
							</Transition>
						</div>
					</div>
				</AppAspectRatio>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
::v-deep(.modal)
	background-color: transparent !important

._fade-out
	animation-name: anim-fade-out
	animation-duration: 200ms
	animation-timing-function: $weak-ease-out
	animation-fill-mode: both

._sticker-anim
	animation-name: anim-sticker
	animation-timing-function: $weak-ease-in-out
	transform: translateY(-25vh)

._strong-ease-out
	transition-timing-function: $strong-ease-out

.fade-enter-active
.fade-leave-active
.fade-stationary-enter-active
.fade-stationary-leave-active
	z-index: 0
	transition: opacity 300ms, transform 300ms

.fade-enter-from
.fade-leave-to
.fade-stationary-enter-from
.fade-stationary-leave-to
	position: absolute
	opacity: 0
	z-index: -1

.fade-enter-from
.fade-leave-to
	transform: translateY(25%) !important

@keyframes anim-sticker
	0%
		transform: translateY(0)
		opacity: 0
	50%
		opacity: 1
	100%
		transform: translateY(-25vh)

@keyframes anim-fade-out
	0%
		opacity: 1
	100%
		opacity: 0
</style>
