import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

interface CropData {
	x: number;
	y: number;
	x2: number;
	y2: number;
}

@Component({})
export default class AppImgCrop extends Vue {
	@Prop(String)
	src!: string;

	@Prop(Object)
	value?: CropData;

	@Prop(Number)
	aspectRatio?: number;

	@Prop(Number)
	minAspectRatio?: number;

	@Prop(Number)
	maxAspectRatio?: number;

	@Prop(Number)
	minWidth?: number;

	@Prop(Number)
	minHeight?: number;

	@Prop(Number)
	maxWidth?: number;

	@Prop(Number)
	maxHeight?: number;

	@Prop(Boolean)
	disabled?: boolean;

	cropper!: Cropper;

	$refs!: {
		img: HTMLImageElement;
	};

	mounted() {
		const useAspectRatio =
			this.minAspectRatio && this.maxAspectRatio ? undefined : this.aspectRatio;

		this.cropper = new Cropper(this.$refs.img, {
			aspectRatio: useAspectRatio,
			viewMode: 1,
			guides: false,
			rotatable: false,
			zoomable: false,
			autoCropArea: 1,
			checkCrossOrigin: false,
			ready: () => {
				if (this.disabled) {
					this.onDisabledChange();
				}

				if (this.value) {
					this.onValueChange();
				}

				// If the aspect ratio is outside a set min/max aspect ratio, resize the crop box.
				if (this.minAspectRatio && this.maxAspectRatio && !this.aspectRatio) {
					const containerData = this.cropper.getContainerData();
					const cropBoxData = this.cropper.getCropBoxData();
					const aspectRatio = cropBoxData.width / cropBoxData.height;

					if (aspectRatio < this.minAspectRatio || aspectRatio > this.maxAspectRatio) {
						const newCropBoxWidth =
							cropBoxData.height * ((this.minAspectRatio + this.maxAspectRatio) / 2);

						this.cropper.setCropBoxData({
							left: (containerData.width - newCropBoxWidth) / 2,
							width: newCropBoxWidth,
						});
					}
				}
			},
			crop: e => {
				// Have to do it like this since the cropper doesn't allow
				// img-relative minimums.
				if (this.minWidth && this.minHeight) {
					const widthDiff = Math.abs(e.detail.width - this.minWidth);
					const heightDiff = Math.abs(e.detail.height - this.minHeight);

					if (
						(e.detail.width < this.minWidth && widthDiff > 0.5) ||
						(e.detail.height < this.minHeight && heightDiff > 0.5)
					) {
						const targetWidth = e.detail.width < this.minWidth ? this.minWidth : e.detail.width;
						const targetHeight =
							e.detail.height < this.minHeight ? this.minHeight : e.detail.height;
						this.cropper.setData(
							Object.assign({}, e.detail, {
								width: targetWidth,
								height: targetHeight,
							})
						);
						return;
					}
				}

				// Enforce aspect ratios.
				if (this.minAspectRatio && this.maxAspectRatio && !this.aspectRatio) {
					const cropBoxData = this.cropper.getCropBoxData();
					const containerData = this.cropper.getContainerData();
					const aspectRatio = cropBoxData.width / cropBoxData.height;

					if (
						aspectRatio < this.minAspectRatio &&
						Math.abs(aspectRatio - this.minAspectRatio) > 0.01
					) {
						let targetWidth = cropBoxData.height * this.minAspectRatio;
						let targetHeight = cropBoxData.height;
						if (targetWidth > containerData.width) {
							targetWidth = containerData.width;
							targetHeight = targetWidth / this.minAspectRatio;
						}
						this.cropper.setCropBoxData({
							width: targetWidth,
							height: targetHeight,
						});
						return;
					} else if (
						aspectRatio > this.maxAspectRatio &&
						Math.abs(aspectRatio - this.maxAspectRatio) > 0.01
					) {
						this.cropper.setCropBoxData({
							width: cropBoxData.height * this.maxAspectRatio,
						});
						return;
					}
				}
			},
			cropend: () => {
				const crop = this.getCropperDataAsCropData();
				this.$emit('input', crop);
			},
		});
	}

	beforeDestroy() {
		this.cropper.destroy();
	}

	@Watch('aspectRatio')
	onAspectRatioChange() {
		this.cropper.setAspectRatio(this.aspectRatio || 0);
	}

	@Watch('src')
	onSrcChange() {
		this.cropper.replace(this.src);
	}

	@Watch('disabled')
	onDisabledChange() {
		if (this.disabled) {
			this.cropper.disable();
		} else {
			this.cropper.enable();
		}
	}

	/**
	 * This gets called when bootstrapping the component with data, and when
	 * input changes. When this runs, it'll pass through the "crop()" callback
	 * above still for further processing..
	 */
	@Watch('value')
	onValueChange() {
		if (this.value) {
			this.cropper.setData({
				x: this.value.x,
				y: this.value.y,
				width: this.value.x2 - this.value.x,
				height: this.value.y2 - this.value.y,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
			});
		} else {
			this.cropper.clear();
		}
	}

	/**
	 * Returns the cropper data in the format we expect this crop component to
	 * work with.
	 */
	private getCropperDataAsCropData(): CropData {
		const cropperData = this.cropper.getData();

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

		if (this.minWidth && rect.width < this.minWidth) {
			rect.width = this.minWidth;
		}

		if (this.maxWidth && rect.width > this.maxWidth) {
			rect.width = this.maxWidth;
		}

		if (this.minHeight && rect.height < this.minHeight) {
			rect.height = this.minHeight;
		}

		if (this.maxHeight && rect.height > this.maxHeight) {
			rect.height = this.maxHeight;
		}

		const ratio = rect.width / rect.height;
		const imgWidth = this.$refs.img.width;
		const imgHeight = this.$refs.img.height;

		if (this.minAspectRatio && this.maxAspectRatio) {
			let targetWidth = rect.width;
			let targetHeight = rect.height;

			if (ratio < this.minAspectRatio) {
				targetWidth = rect.height * this.minAspectRatio;

				if (targetWidth > imgWidth) {
					targetWidth = imgWidth;
					targetHeight = targetWidth / this.minAspectRatio;

					if (targetHeight > imgHeight) {
						targetHeight = imgHeight;
						targetWidth = targetHeight * this.minAspectRatio;
					}
				}
			} else if (ratio > this.maxAspectRatio) {
				targetHeight = rect.width / this.maxAspectRatio;

				if (targetHeight > imgHeight) {
					targetHeight = rect.height;
					targetWidth = targetHeight * this.maxAspectRatio;

					if (targetWidth > imgWidth) {
						targetWidth = imgWidth;
						targetHeight = targetWidth / this.maxAspectRatio;
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
}
