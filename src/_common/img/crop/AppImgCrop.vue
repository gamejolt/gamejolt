<script lang="ts" setup>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { PropType, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue';

interface CropData {
	x: number;
	y: number;
	x2: number;
	y2: number;
}

const props = defineProps({
	src: {
		type: String,
		required: true,
	},
	cropValue: {
		type: Object as PropType<CropData>,
		default: undefined,
	},
	aspectRatio: {
		type: Number,
		default: undefined,
	},
	minAspectRatio: {
		type: Number,
		default: undefined,
	},
	maxAspectRatio: {
		type: Number,
		default: undefined,
	},
	minWidth: {
		type: Number,
		default: undefined,
	},
	minHeight: {
		type: Number,
		default: undefined,
	},
	maxWidth: {
		type: Number,
		default: undefined,
	},
	maxHeight: {
		type: Number,
		default: undefined,
	},
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	input: (_cop: CropData) => true,
});

const {
	src,
	cropValue,
	aspectRatio,
	minAspectRatio,
	maxAspectRatio,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	disabled,
} = toRefs(props);

let cropper: Cropper;
const refImg = ref<HTMLImageElement>();

onMounted(() => {
	const useAspectRatio =
		minAspectRatio?.value && maxAspectRatio?.value ? undefined : maxAspectRatio?.value;

	cropper = new Cropper(refImg.value!, {
		aspectRatio: useAspectRatio,
		viewMode: 1,
		guides: false,
		rotatable: false,
		zoomable: false,
		autoCropArea: 1,
		checkCrossOrigin: false,
		ready: () => {
			if (disabled.value) {
				onDisabledChange();
			}

			if (cropValue?.value) {
				onCropValueChange();
			}

			// If the aspect ratio is outside a set min/max aspect ratio, resize the crop box.
			if (minAspectRatio?.value && maxAspectRatio?.value && !aspectRatio?.value) {
				const containerData = cropper!.getContainerData();
				const cropBoxData = cropper!.getCropBoxData();
				const aspectRatio = cropBoxData.width / cropBoxData.height;

				if (aspectRatio < minAspectRatio.value || aspectRatio > maxAspectRatio.value) {
					const newCropBoxWidth =
						cropBoxData.height * ((minAspectRatio.value + maxAspectRatio.value) / 2);

					cropper!.setCropBoxData({
						left: (containerData.width - newCropBoxWidth) / 2,
						width: newCropBoxWidth,
					});
				}
			}
		},
		crop: e => {
			// Have to do it like this since the cropper doesn't allow
			// img-relative minimums.
			if (minWidth?.value && minHeight?.value) {
				const widthDiff = Math.abs(e.detail.width - minWidth.value);
				const heightDiff = Math.abs(e.detail.height - minHeight.value);

				if (
					(e.detail.width < minWidth.value && widthDiff > 0.5) ||
					(e.detail.height < minHeight.value && heightDiff > 0.5)
				) {
					const targetWidth =
						e.detail.width < minWidth.value ? minWidth.value : e.detail.width;
					const targetHeight =
						e.detail.height < minHeight.value ? minHeight.value : e.detail.height;
					cropper!.setData(
						Object.assign({}, e.detail, {
							width: targetWidth,
							height: targetHeight,
						})
					);
					return;
				}
			}

			// Enforce aspect ratios.
			if (minAspectRatio?.value && maxAspectRatio?.value && !aspectRatio?.value) {
				const cropBoxData = cropper!.getCropBoxData();
				const containerData = cropper!.getContainerData();
				const aspectRatio = cropBoxData.width / cropBoxData.height;

				if (
					aspectRatio < minAspectRatio.value &&
					Math.abs(aspectRatio - minAspectRatio.value) > 0.01
				) {
					let targetWidth = cropBoxData.height * minAspectRatio.value;
					let targetHeight = cropBoxData.height;
					if (targetWidth > containerData.width) {
						targetWidth = containerData.width;
						targetHeight = targetWidth / minAspectRatio.value;
					}
					cropper!.setCropBoxData({
						width: targetWidth,
						height: targetHeight,
					});
					return;
				} else if (
					aspectRatio > maxAspectRatio.value &&
					Math.abs(aspectRatio - maxAspectRatio.value) > 0.01
				) {
					cropper!.setCropBoxData({
						width: cropBoxData.height * maxAspectRatio.value,
					});
					return;
				}
			}
		},
		cropend: () => {
			if (refImg.value) {
				const crop = getCropperDataAsCropData();
				emit('input', crop);
			}
		},
	});
});

onBeforeUnmount(() => {
	cropper!.destroy();
});

watch(
	() => aspectRatio?.value,
	() => {
		cropper!.setAspectRatio(maxAspectRatio?.value || 0);
	}
);

watch(src, () => {
	cropper!.replace(src.value);
});

watch(disabled, () => {
	onDisabledChange();
});

/**
 * This gets called when bootstrapping the component with data, and when
 * input changes. When this runs, it'll pass through the "crop()" callback
 * above still for further processing..
 */
watch(
	() => cropValue?.value,
	() => onCropValueChange()
);

/**
 * Returns the cropper data in the format we expect this crop component to
 * work with.
 */
function getCropperDataAsCropData(): CropData {
	const cropperData = cropper!.getData();

	// Due to rounding errors introduced by scaling down the image in the
	// cropper, the crop needs to be rounded to full pixels and consider
	// min/max width/height before returning the data.
	const crop = {
		x: Math.round(cropperData.x),
		y: Math.round(cropperData.y),
		x2: Math.round(cropperData.x + cropperData.width),
		y2: Math.round(cropperData.y + cropperData.height),
	};

	const rect = {
		x: crop.x,
		y: crop.y,
		width: Math.abs(crop.x - crop.x2),
		height: Math.abs(crop.y - crop.y2),
	};

	if (minWidth?.value && rect.width < minWidth.value) {
		rect.width = minWidth.value;
	}

	if (maxWidth?.value && rect.width > maxWidth.value) {
		rect.width = maxWidth.value;
	}

	if (minHeight?.value && rect.height < minHeight.value) {
		rect.height = minHeight.value;
	}

	if (maxHeight?.value && rect.height > maxHeight.value) {
		rect.height = maxHeight.value;
	}

	const ratio = rect.width / rect.height;
	const imgWidth = refImg.value!.width;
	const imgHeight = refImg.value!.height;

	if (minAspectRatio?.value && maxAspectRatio?.value) {
		let targetWidth = rect.width;
		let targetHeight = rect.height;

		if (ratio < minAspectRatio.value) {
			targetWidth = rect.height * minAspectRatio.value;

			if (targetWidth > imgWidth) {
				targetWidth = imgWidth;
				targetHeight = targetWidth / minAspectRatio.value;

				if (targetHeight > imgHeight) {
					targetHeight = imgHeight;
					targetWidth = targetHeight * minAspectRatio.value;
				}
			}
		} else if (ratio > maxAspectRatio.value) {
			targetHeight = rect.width / maxAspectRatio.value;

			if (targetHeight > imgHeight) {
				targetHeight = rect.height;
				targetWidth = targetHeight * maxAspectRatio.value;

				if (targetWidth > imgWidth) {
					targetWidth = imgWidth;
					targetHeight = targetWidth / maxAspectRatio.value;
				}
			}
		}

		if (rect.x + targetWidth > imgWidth) {
			rect.x = imgWidth - targetWidth;
		}

		if (rect.y + targetHeight > imgHeight) {
			rect.y = imgHeight - targetHeight;
		}
		rect.width = targetWidth;
		rect.height = targetHeight;
	}

	crop.x = rect.x;
	crop.y = rect.y;
	crop.x2 = rect.x + rect.width;
	crop.y2 = rect.y + rect.height;

	return crop;
}

function onDisabledChange() {
	if (!cropper) {
		return;
	}
	if (disabled.value) {
		cropper.disable();
	} else {
		cropper.enable();
	}
}

function onCropValueChange() {
	if (cropValue?.value) {
		cropper!.setData({
			x: cropValue.value.x,
			y: cropValue.value.y,
			width: cropValue.value.x2 - cropValue.value.x,
			height: cropValue.value.y2 - cropValue.value.y,
			rotate: 0,
			scaleX: 1,
			scaleY: 1,
		});
	} else {
		cropper!.clear();
	}
}
</script>

<template>
	<div class="img-crop">
		<img ref="refImg" :style="{ maxWidth: `100%` }" :src="src" alt="" />
	</div>
</template>
