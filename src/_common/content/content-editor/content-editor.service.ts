import { EditorView } from 'prosemirror-view';
import { shallowReactive } from 'vue';
import { MediaUploadTask } from './media-upload-task';
import { ContentEditorSchema } from './schemas/content-editor-schema';

export class ContentEditorService {
	public static UploadTaskCache = shallowReactive({}) as Record<string, MediaUploadTask>;

	public static isDisabled(view: EditorView<ContentEditorSchema>) {
		return !!view.props.editable && !view.props.editable(view.state);
	}
}
