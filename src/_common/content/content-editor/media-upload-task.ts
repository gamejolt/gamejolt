import { ContentEditorController } from './content-editor-controller';

/**
 * Represents a media upload within a content editor. It's mostly a state
 * container so that the app and web can both report upload progress.
 */
export class MediaUploadTask {
	progress = 0;
	file?: File;

	/**
	 * Whether or not we're currently processing the file after it's been fully
	 * uploaded.
	 */
	isProcessing = false;

	constructor(
		public readonly editorController: ContentEditorController,
		public readonly uploadId: string,
		public readonly thumbnail?: string
	) {}

	withFile(file: File) {
		this.file = file;
		return this;
	}

	updateProgress(progress: number) {
		this.progress = progress;
		if (this.progress >= 1) {
			this.progress = 1;
			this.isProcessing = true;
		}
	}
}
