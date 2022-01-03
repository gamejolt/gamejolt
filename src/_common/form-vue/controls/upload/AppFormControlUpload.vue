<script lang="ts" setup>
import { computed, ref } from 'vue';
import { formatNumber } from '../../../filters/number';
import AppProgressBar from '../../../progress/bar/bar.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { useForm } from '../../AppForm.vue';
import { createFormControl, defineFormControlProps } from '../../AppFormControl.vue';
import { useFormGroup } from '../../AppFormGroup.vue';
import { FormValidator, validateFileAccept } from '../../validators';
import AppFormControlUploadFile from './AppFormControlUploadFile.vue';

const props = defineProps({
	...defineFormControlProps(),
	multiple: {
		type: Boolean,
	},
	uploadLinkLabel: {
		type: String,
		default: null,
	},
	accept: {
		type: String,
		default: null,
	},
	// 	@Prop(Array) validateOn!: string[];
	// 	@Prop(Number) validateDelay!: number;
});

const validators = computed(() => {
	let _validators: FormValidator[] = [];

	// Push the accept first so it matches before any img geometry checks.
	if (props.accept) {
		_validators.push(validateFileAccept(props.accept));
	}

	// Then push the rest.
	_validators.push(...props.validators);
	return _validators;
});

const form = useForm()!;
const group = useFormGroup()!;
const c = createFormControl([] as File | File[] | null, validators);

const isDropActive = ref(false);

/**
 * Will be an array even if not a `multiple` upload type.
 */
const files = computed(() => {
	if (c.controlVal === null) {
		return [];
	}

	return Array.isArray(c.controlVal) ? c.controlVal : [c.controlVal];
});

const progress = computed(() => {
	const progressEvent = form.formModel._progress as ProgressEvent | null;
	if (!progressEvent) {
		return undefined;
	}

	return progressEvent.loaded / progressEvent.total;
});

function dragOver(e: DragEvent) {
	// Don't do anything if not a file drop.
	if (
		!e.dataTransfer ||
		!e.dataTransfer.items.length ||
		e.dataTransfer.items[0].kind !== 'file'
	) {
		return;
	}

	e.preventDefault();
	isDropActive.value = true;
}

async function dragLeave() {
	isDropActive.value = false;
}

/**
 * File select resulting from a drop onto the input.
 */
async function drop(e: DragEvent) {
	// Don't do anything if not a file drop.
	if (
		!e.dataTransfer ||
		!e.dataTransfer.items.length ||
		e.dataTransfer.items[0].kind !== 'file'
	) {
		return;
	}

	e.preventDefault();
	isDropActive.value = false;

	const files = await getFiles(e);
	setFiles(files);
}

function showFileSelect() {
	// TODO(vue3)
	// this.$refs.input.showFileSelect();
}

// Normal file select.
function onChange(files: File[]) {
	setFiles(files);
}

function clearFile(file: File) {
	if (Array.isArray(c.controlVal)) {
		const index = files.value.indexOf(file);
		if (index !== -1) {
			files.value.splice(index, 1);

			if (!files.value.length) {
				c.applyValue(null);
			} else {
				c.applyValue(c.controlVal);
			}
		}
	} else {
		if (c.controlVal === file) {
			c.applyValue(null);
		}
	}
}

function setFiles(files: File[] | null) {
	if (!files) {
		c.applyValue(null);
	} else if (props.multiple) {
		c.applyValue(files);
	} else {
		c.applyValue(files[0]);
	}
}

function isAscii(str: string) {
	return /^[\000-\177]*$/.test(str);
}

/**
 * Traverses a file tree of webkit file entries. This handles directories as
 * well as multiple file selections in webkit browsers.
 */
function traverseFileTree(files: File[], entry: any, path = ''): Promise<void> {
	if (entry) {
		if (entry.isDirectory) {
			const dirReader = entry.createReader();
			return new Promise<void>((resolve, reject) => {
				dirReader.readEntries(async (entries: any[]) => {
					const promises = [];
					for (let i = 0; i < entries.length; ++i) {
						promises.push(
							traverseFileTree(
								files,
								entries[i],
								(path ? path : '') + entry.name + '/'
							)
						);
					}

					await Promise.all(promises);
					resolve();
				}, reject);
			});
		} else {
			return new Promise<void>((resolve, reject) => {
				entry.file((file: File) => {
					files.push(file);
					resolve();
				}, reject);
			});
		}
	}

	// If we didn't create a promise above, just resolve.
	return Promise.resolve();
}

/**
 * Pulls out the files from a particular drag/drop event.
 */
async function getFiles(e: DragEvent) {
	// We store the promises that were created from all the file entries and
	// then wait on them at the end of the function. This is because the `items`
	// data list goes away if you don't loop through all the items at once.
	let promises: Promise<any>[] = [];
	let files: File[] = [];

	const items = e.dataTransfer ? e.dataTransfer.items : null;
	if (items && items.length > 0 && items[0].webkitGetAsEntry) {
		const num = items.length;
		for (let i = 0; i < num; ++i) {
			const item = items[i];
			const entry = item.webkitGetAsEntry();
			if (entry) {
				// Fix for chrome bug https://code.google.com/p/chromium/issues/detail?id=149735
				if (isAscii(entry.name)) {
					promises.push(traverseFileTree(files, entry));
				} else if (!entry.isDirectory) {
					const file = item.getAsFile();
					if (file) {
						files.push(file);
					}
				}
			}
		}
	} else {
		const fileList = e.dataTransfer ? e.dataTransfer.files : null;
		if (fileList) {
			for (let i = 0; i < fileList.length; ++i) {
				files.push(fileList.item(i)!);
			}
		}
	}

	// The promises modify the `files` array directly, so we don't need to use
	// their return values.
	await Promise.all(promises);
	return files;
}
</script>

<template>
	<div
		class="form-control-upload"
		:class="{
			'drop-active': isDropActive,
		}"
		@dragover="dragOver"
		@dragleave="dragLeave"
		@drop="drop"
	>
		<div v-show="!c.controlVal">
			<!--
			If we have a label, then we show the upload "button" as a link instead.
			We hide the button and use it to simulate a click on it.
			-->
			<div v-if="!!uploadLinkLabel" class="small">
				<a class="link-muted" @click="showFileSelect()">
					{{ uploadLinkLabel }}
				</a>
			</div>

			<!-- v-validate="{ rules: validationRules }"
				:data-vv-validate-on="validateOn"
				:data-vv-delay="validateDelay" -->
			<AppFormControlUploadFile
				v-show="!uploadLinkLabel"
				:id="c.id!"
				ref="input"
				:name="group.name"
				:multiple="multiple"
				:accept="accept"
				:value="c.controlVal"
				@input="onChange"
			/>
		</div>

		<template v-if="!!c.controlVal">
			<div v-if="progress === undefined" class="form-upload-control-files">
				<p>
					<strong><AppTranslate>Selected files:</AppTranslate></strong>
				</p>
				<div class="list-group list-group-dark">
					<div v-for="(file, i) of files" :key="i" class="list-group-item">
						<a class="card-remove" @click="clearFile(file)">
							<app-jolticon icon="remove" notice />
						</a>
						{{ file.name }}
					</div>
				</div>
			</div>
			<template v-else>
				<app-progress-bar :percent="progress * 100">
					<template v-if="progress < 0.99">
						{{ formatNumber(progress, { style: 'percent' }) }}
					</template>
					<template v-else>
						<AppTranslate>Processing...</AppTranslate>
					</template>
				</app-progress-bar>

				<div v-if="progress >= 0.99" class="alert">
					<p>
						<AppTranslate>
							Upload complete! Please wait while we process your file(s). This may
							take a few minutes, so don't close or refresh the page.
						</AppTranslate>
					</p>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.form-control-upload
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	border-width: 2px
	border-style: dashed
	padding: ($grid-gutter-width / 2)

	&.drop-active
		theme-prop('border-color', 'link')
		border-style: solid

.list-group
	margin-bottom: 0
</style>
