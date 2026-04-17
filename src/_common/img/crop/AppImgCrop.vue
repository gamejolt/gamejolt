<script lang="ts" setup>
import 'cropperjs/dist/cropper.css';

import Cropper from 'cropperjs';
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';

interface CropData {
	x: number;
	y: number;
	x2: number;
	y2: number;
}

type Props = {
	src: string;
	cropValue?: CropData;
	aspectRatio?: number;
	minAspectRatio?: number;
	maxAspectRatio?: number;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	disabled?: boolean;
};
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
} = defineProps<Props>();

const emit = defineEmits<{
	input: [cop: CropData];
}>();

let cropper: Cropper;
const refImg = useTemplateRef('refImg');

onMounted(() => {
	const useAspectRatio = minAspectRatio && maxAspectRatio ? undefined : aspectRatio;

	cropper = new Cropper(refImg.value!, {
		aspectRatio: useAspectRatio,
		viewMode: 1,
		guides: false,
		rotatable: false,
		zoomable: false,
		autoCropArea: 1,
		checkCrossOrigin: false,
		ready: () => {
			if (disabled) {
				onDisabledChange();
			}

			if (cropValue) {
				onCropValueChange();
			}

			// If the aspect ratio is outside a set min/max aspect ratio, resize the crop box.
			if (minAspectRatio && maxAspectRatio && !aspectRatio) {
				const containerData = cropper!.getContainerData();
				const cropBoxData = cropper!.getCropBoxData();
				const aspectRatio = cropBoxData.width / cropBoxData.height;

				if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
					const newCropBoxWidth =
						cropBoxData.height * ((minAspectRatio + maxAspectRatio) / 2);

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
			if (minWidth && minHeight) {
				const widthDiff = Math.abs(e.detail.width - minWidth);
				const heightDiff = Math.abs(e.detail.height - minHeight);

				if (
					(e.detail.width < minWidth && widthDiff > 0.5) ||
					(e.detail.height < minHeight && heightDiff > 0.5)
				) {
					const targetWidth = e.detail.width < minWidth ? minWidth : e.detail.width;
					const targetHeight = e.detail.height < minHeight ? minHeight : e.detail.height;
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
			if (minAspectRatio && maxAspectRatio && !aspectRatio) {
				const cropBoxData = cropper!.getCropBoxData();
				const containerData = cropper!.getContainerData();
				const aspectRatio = cropBoxData.width / cropBoxData.height;

				if (aspectRatio < minAspectRatio && Math.abs(aspectRatio - minAspectRatio) > 0.01) {
					let targetWidth = cropBoxData.height * minAspectRatio;
					let targetHeight = cropBoxData.height;
					if (targetWidth > containerData.width) {
						targetWidth = containerData.width;
						targetHeight = targetWidth / minAspectRatio;
					}
					cropper!.setCropBoxData({
						width: targetWidth,
						height: targetHeight,
					});
					return;
				} else if (
					aspectRatio > maxAspectRatio &&
					Math.abs(aspectRatio - maxAspectRatio) > 0.01
				) {
					cropper!.setCropBoxData({
						width: cropBoxData.height * maxAspectRatio,
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
	() => aspectRatio,
	aspectRatio => {
		cropper?.setAspectRatio(aspectRatio || 0);
	}
);

watch(
	() => src,
	() => {
		cropper?.replace(src);
	}
);

watch(
	() => disabled,
	() => {
		onDisabledChange();
	}
);

/**
 * This gets called when bootstrapping the component with data, and when
 * input changes. When this runs, it'll pass through the "crop()" callback
 * above still for further processing..
 */
watch(
	() => cropValue,
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

	if (minWidth && rect.width < minWidth) {
		rect.width = minWidth;
	}

	if (maxWidth && rect.width > maxWidth) {
		rect.width = maxWidth;
	}

	if (minHeight && rect.height < minHeight) {
		rect.height = minHeight;
	}

	if (maxHeight && rect.height > maxHeight) {
		rect.height = maxHeight;
	}

	const ratio = rect.width / rect.height;
	const imgWidth = refImg.value!.width;
	const imgHeight = refImg.value!.height;

	if (minAspectRatio && maxAspectRatio) {
		let targetWidth = rect.width;
		let targetHeight = rect.height;

		if (ratio < minAspectRatio) {
			targetWidth = rect.height * minAspectRatio;

			if (targetWidth > imgWidth) {
				targetWidth = imgWidth;
				targetHeight = targetWidth / minAspectRatio;

				if (targetHeight > imgHeight) {
					targetHeight = imgHeight;
					targetWidth = targetHeight * minAspectRatio;
				}
			}
		} else if (ratio > maxAspectRatio) {
			targetHeight = rect.width / maxAspectRatio;

			if (targetHeight > imgHeight) {
				targetHeight = rect.height;
				targetWidth = targetHeight * maxAspectRatio;

				if (targetWidth > imgWidth) {
					targetWidth = imgWidth;
					targetHeight = targetWidth / maxAspectRatio;
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

	if (disabled) {
		cropper.disable();
	} else {
		cropper.enable();
	}
}

function onCropValueChange() {
	if (!cropper) {
		return;
	}

	if (cropValue) {
		cropper.setData({
			x: cropValue.x,
			y: cropValue.y,
			width: cropValue.x2 - cropValue.x,
			height: cropValue.y2 - cropValue.y,
			rotate: 0,
			scaleX: 1,
			scaleY: 1,
		});
	} else {
		cropper.clear();
	}
}
</script>

<template>
	<div class="img-crop">
		<img ref="refImg" :style="{ maxWidth: `100%` }" :src="src" alt="" />
	</div>
</template>
