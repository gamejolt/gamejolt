import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue';
import { number } from '../../../../vue/filters/number';
import AppProgressBar from '../../../progress/bar/bar.vue';
import BaseFormControl from '../base';
import AppFormControlUploadFileTS from './file';
import AppFormControlUploadFile from './file.vue';

@Component({
	components: {
		AppJolticon,
		AppProgressBar,
		AppFormControlUploadFile,
	},
	filters: {
		number,
	},
})
export default class AppFormControlUpload extends BaseFormControl {
	@Prop(Boolean) multiple?: boolean;
	@Prop(String) uploadLinkLabel?: string;
	@Prop(String) accept?: string;

	@Prop(Array) validateOn!: string[];
	@Prop(Number) validateDelay!: number;

	$refs!: {
		input: AppFormControlUploadFileTS;
	};

	controlVal: File | File[] | null = [];
	isDropActive = false;

	get validationRules() {
		let rules: any = {};

		// Push the accept first so it matches before any img geometry checks.
		if (this.accept) {
			rules.accept = this.accept;
		}

		rules = {
			...rules,
			...this.baseRules,
		};

		return rules;
	}

	/**
	 * Will be an array even if not a `multiple` upload type.
	 */
	get files() {
		return Array.isArray(this.controlVal) ? this.controlVal : [this.controlVal];
	}

	get progress(): number | undefined {
		const progressEvent = this.form.base.formModel._progress as ProgressEvent | null;
		if (!progressEvent) {
			return undefined;
		}

		return progressEvent.loaded / progressEvent.total;
	}

	dragOver(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = true;
	}

	async dragLeave() {
		this.isDropActive = false;
	}

	// File select resulting from a drop onto the input.
	async drop(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = false;

		const files = await getFiles(e);
		this.setFiles(files);
	}

	showFileSelect() {
		this.$refs.input.showFileSelect();
	}

	// Normal file select.
	onChange(files: File[]) {
		this.setFiles(files);
	}

	clearFile(file: File) {
		if (Array.isArray(this.controlVal)) {
			const files = this.files;
			const index = files.indexOf(file);
			if (index !== -1) {
				files.splice(index, 1);
				if (!files.length) {
					this.applyValue(null);
				} else {
					this.applyValue(this.controlVal);
				}
			}
		} else {
			if (this.controlVal === file) {
				this.applyValue(null);
			}
		}
	}

	private setFiles(files: File[] | null) {
		if (!files) {
			this.applyValue(null);
		} else if (this.multiple) {
			this.applyValue(files);
		} else {
			this.applyValue(files[0]);
		}
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
