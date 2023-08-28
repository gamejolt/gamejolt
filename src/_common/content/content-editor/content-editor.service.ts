import { EditorView } from 'prosemirror-view';
import { shallowReactive } from 'vue';
import { MediaUploadTask } from './media-upload-task';
import { ContentEditorSchema } from './schemas/content-editor-schema';

class ContentEditorServiceImpl {
	public UploadTaskCache = shallowReactive({}) as Record<string, MediaUploadTask>;

	public isDisabled(view: EditorView<ContentEditorSchema>) {
		return !!view.props.editable && !view.props.editable(view.state);
	}
}

export const ContentEditorService = /** @__PURE__ */ new ContentEditorServiceImpl();
