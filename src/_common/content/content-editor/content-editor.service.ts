import { EditorView } from 'prosemirror-view';
import { MediaUploadTask } from './media-upload-task';
import { ContentEditorSchema } from './schemas/content-editor-schema';

export class ContentEditorService {
	// TODO: Remove all of these static functions and get everything working through scope/capabilities
	// TODO: Remove this last
	public static UploadTaskCache = {} as Record<string, MediaUploadTask>;

	public static isDisabled(view: EditorView<ContentEditorSchema>) {
		return !!view.props.editable && !view.props.editable(view.state);
	}
}
