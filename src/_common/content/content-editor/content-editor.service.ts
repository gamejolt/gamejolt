import { EditorView } from 'prosemirror-view';
import { shallowReactive } from 'vue';

import { MediaUploadTask } from '~common/content/content-editor/media-upload-task';
import { ContentEditorSchema } from '~common/content/content-editor/schemas/content-editor-schema';

class ContentEditorServiceImpl {
	public UploadTaskCache = shallowReactive({}) as Record<string, MediaUploadTask>;

	public isDisabled(view: EditorView<ContentEditorSchema>) {
		return !!view.props.editable && !view.props.editable(view.state);
	}
}

export const ContentEditorService = /** @__PURE__ */ new ContentEditorServiceImpl();
