import { InjectionKey, inject, markRaw, provide, ref, watch, type Component } from 'vue';
import { ComponentProps } from '../component-helpers';

const PopcornKettleControllerKey: InjectionKey<PopcornKettleController> = Symbol('popcorn-kettle');

export type PopcornKettleController = ReturnType<typeof createPopcornKettleController>;

export interface KernelRecipeBase {
	/** Default: `1_000` */
	duration: number;
	/** Default: `0` */
	popAngle: number;
	/** Default: `2.0` */
	downwardGravityStrength: number;
	/** Default: `20.0` */
	velocity: number;
	/** Default: `32.0` */
	baseSize: number;
	/** Default: `false` */
	reverse: boolean;
	/** Default: `false` */
	zIndexInvert: boolean;
	/** Default: `true` */
	fadeOut: boolean;
	/** Default: `0.3` when {@link reverse}, `0` otherwise */
	fadeInStop: number;
	/** Default: `0.8` when {@link fadeOut}, `0` otherwise */
	fadeOutStart: number;
	/** Default: `false` */
	useClassFadeIn: boolean;
}

export type PopcornKernelData<C extends Component = any> = KernelRecipeBase & {
	key: any;
	kernelImage?: string;
	kernelComponent?: C;
	kernelComponentProps?: ComponentProps<C>;
	rotationVelocity: number;
};

export type KernelRecipe<C extends Component = any> = KernelRecipeBase & {
	kernelImage?: string;
	kernelComponent?: C;
	kernelComponentProps?: ComponentProps<C>;

	/** Default: `45.0` */
	popAngleVariance: number;
	/** Default: `10.0` */
	rotationVelocityVariance: number;
	/** Called when the kernel is finished animating and gets removed. */
	onDispose?: () => void;
};

export function createPopcornKettleController() {
	const kernels = ref<PopcornKernelData[]>([]);
	const kernelFrameCallbacks = ref<(() => void)[]>([]);

	let _isSchedulingFrames = false;

	watch(
		kernelFrameCallbacks,
		val => {
			if (val.length === 0 || _isSchedulingFrames) {
				return;
			}
			_scheduleFrames();
		},
		{ deep: true }
	);

	function addKernel<C extends Component>({
		kernelImage,
		kernelComponent,
		kernelComponentProps,
		duration = 1_000,
		popAngle = 0,
		downwardGravityStrength = 2.0,
		velocity = 20.0,
		baseSize = 32.0,
		reverse = false,
		zIndexInvert = false,
		fadeOut = true,
		useClassFadeIn = false,
		fadeInStop = reverse ? 0.3 : 0,
		fadeOutStart = fadeOut ? 0.8 : 0,
		rotationVelocityVariance = 10.0,
		popAngleVariance = 45.0,
		onDispose,
	}: Partial<KernelRecipe<C>> = {}) {
		if (import.meta.env.SSR) {
			return;
		}

		if (!kernelImage && !kernelComponent) {
			throw Error(
				'Popcorn kernels require either a kernelImage or kernelComponent to display.'
			);
		}

		const _kernelData: PopcornKernelData = markRaw({
			key: Date.now(),
			kernelImage,
			kernelComponent,
			kernelComponentProps,
			duration,
			popAngle: _randomizePopAngle(popAngle, { range: popAngleVariance }),
			downwardGravityStrength,
			velocity,
			baseSize,
			reverse,
			zIndexInvert,
			fadeOut,
			useClassFadeIn,
			fadeInStop,
			fadeOutStart,
			rotationVelocity: _randomizeRotation({ range: rotationVelocityVariance }),
		});

		// Layer the stickers based on kernel recipe
		const shouldInvertIndex = reverse ? !zIndexInvert : zIndexInvert;
		if (shouldInvertIndex) {
			kernels.value.unshift(_kernelData);
		} else {
			kernels.value.push(_kernelData);
		}

		setTimeout(() => {
			const index = kernels.value.indexOf(_kernelData);

			if (index !== -1) {
				kernels.value.splice(index, 1);
				onDispose?.();
			}
		}, duration);
	}

	function _scheduleFrames() {
		if (import.meta.env.SSR) {
			_isSchedulingFrames = false;
			return;
		}

		_isSchedulingFrames = true;
		window.requestAnimationFrame(() => {
			if (kernelFrameCallbacks.value.length > 0) {
				kernelFrameCallbacks.value.forEach(cb => cb());
				_scheduleFrames();
			} else {
				_isSchedulingFrames = false;
			}
		});
	}

	function _randomizePopAngle(preferredAngle: number, { range }: { range: number }) {
		preferredAngle = preferredAngle - 90;
		const _randomRange = Math.random() * range;
		return preferredAngle + range / 2 - _randomRange;
	}

	function _randomizeRotation({ range }: { range: number }) {
		const _randomRange = Math.random() * range;
		return range / 2 - _randomRange;
	}

	return {
		kernels,
		kernelFrameCallbacks,
		addKernel,
	};
}

export function providePopcornKettleController(controller: PopcornKettleController) {
	provide(PopcornKettleControllerKey, controller);
}

export function usePopcornKettleController() {
	return inject(PopcornKettleControllerKey);
}
