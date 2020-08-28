// Examples...
// https://m.youtube.com/watch?v=oHg5SJYRHA0
// https://www.youtube.com/watch?v=DSvQAx5-PXU
// http://www.youtube.com/watch?v=DSvQAx5-PXU
// http://www.youtube.com/watch?v=DSvQAx5-PXU&bdfglkhdfg
// www.youtube.com/watch?v=DSvQAx5-PXU
// http://youtube.com/watch?v=DSvQAx5-PXU
// youtube.com/watch?v=DSvQAx5-PXU
// http://youtu.be/Y6lUVz1kdOk
// http://youtu.be/Y6lUVz1kdOk?testing
// http://vimeo.com/98hfg98dhfg
export const REGEX_VIDEO = /^(https?:\/\/)?((www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)\S*$/i;
export const REGEX_YOUTUBE = /^(https?:\/\/)?((www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)\S*$/i;
export const REGEX_VIMEO = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)(?<videoId>[a-zA-Z0-9_-]+)\S*$/i;
