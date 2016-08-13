!function () {
	window.doc || (doc = {});

	var TYPE2SRC = [ALL_COMMENTS, DICT_LIST, KNOW];
	
	var id = Url.getQuery('id'),
		type = parseInt(Url.getQuery('type')) || 0,
		f = Url.getQuery('f');
	if (!id) {return}

	var src = TYPE2SRC[type] || [],
		j = src.length,
		item;
	if (f) {
		while (j--) {
			if (src[j].id===id && src[j].f===f) {
				item = src[j];
				break;
			}
		}
	} else {
		while (j--) {
			if (src[j].id===id) {
				item = src[j];
				break;
			}
		}
	}

	item || (item = {id: id, desc: '', f:'', nf: true});
	doc.showDetail(item, type);
	document.title = id+(f ? ' | '+f : '')+' - '+document.title;

	ALL_COMMENTS = null;
	DICT_LIST = null;
	DICT_CONTENT = null;
	KNOW = null;

}();
