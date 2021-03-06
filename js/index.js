!function(){
	var src = ALL_COMMENTS; //缓存到局部
	var $idlist = $('#idlist'), $dragbar = $('.dragbar'), $detailWrap = $('.detail-wrap');

	var openFolder = function (folder) {
		var hasParent = !!folder;
		var parentFoler = folder + '/';
		var x = parentFoler.length;
		var i, len, j, item, filepath;
		var folderList = [], folderMap = {},
			fileList = [], id2desc = {};
		var html = '';
		//普通注释
		for (i = 0, len = src.length; i<len; i++) {
			item = src[i]; //按文件夹分
			filepath = item.f; //按文件夹分
			if (hasParent) {
				if (filepath.slice(0, x)!==parentFoler) {
					continue;
				}
				filepath = filepath.slice(x);
			}
			j = filepath.indexOf('/');
			if (j>0) {
				filepath = filepath.slice(0, j);
				if(!folderMap[filepath]){
					folderList.push(filepath);
					folderMap[filepath] = true;
				}
			} else {
				if (item.id) {
					filepath = item.id;
					j = filepath.lastIndexOf('.');
					j>0 && (filepath = filepath.slice(0, j));
				}
				filepath += '|'+item.f;
				if (!id2desc.hasOwnProperty(filepath)) {
					// fileList.push(item._rid ? filepath+'|'+item.f : filepath);
					fileList.push(filepath);
					id2desc[filepath] = clip(item.desc.replace(/<.*?>/g, ''), 80);
				}
			}
		}
		if (!hasParent) {parentFoler = ''}
		folderList.sort(function (a, b) {
			return a.toLowerCase()>b.toLowerCase() ? 1 : -1;
		});
		var deepth = parentFoler.split('/').length,
			blank = new Array(deepth).join('<i></i>');
		for (i = 0, len = folderList.length; i<len; i++) { //生成html
			item = folderList[i];
			html += '<li folder="'+folder+'">'+blank+
				'<i class="tree-node" cpo-name="open-tree-node">+</i>' +
				'<a href="javascript:;" data-folder="'+parentFoler+item+
				'" cpo-name="open-folder" class="j-deepth-'+deepth+'">'+item+'</a></li>';
		}
		fileList.sort(function (a, b) {
			return a.toLowerCase()>b.toLowerCase() ? 1 : -1;
		});
		
		for (i = 0, len = fileList.length; i<len; i++) { //生成html
			item = fileList[i];
			x = item.split('|');
			html += '<li folder="'+folder+'"><i></i>'+blank+
				'<a class="id" href="javascript:;" data-f="'+x[1]+'" title="'+
				id2desc[item]+'" cpo-name="show-detail">'+x[0]+'</a></li>';
		}
		dragbarHeight();
		return html;
	};
	
	$idlist.html(openFolder(''));

	Cpo.on('open-tree-node', function (ctar) {
		Cpo.emit('open-folder', ctar.nextSibling);
	});
	Cpo.on('open-folder', function (ctar) {
		var folder = ctar.getAttribute('data-folder');
		var $label = $(ctar).prev('i');
		if($label.html()==='+'){
			$label.html('─');
			var html = openFolder(folder);
			//$ctar.parent().after(html); //jQuery2.1插入不了有bug
			ctar.parentNode.insertAdjacentHTML('AfterEnd', html);
		}else{
			$label.html('+');
			var fp = folder + '/', fpl = fp.length;
			var $lis = $idlist.find('li'), i = $lis.length, f;
			while(i--){
				f = $lis[i].getAttribute('folder');
				if(f===folder || f.slice(0,fpl)===fp){
					$lis[i].parentNode.removeChild($lis[i]);
				}
			}
			dragbarHeight();
		}
	});

	var detail = $('#detail')[0], $doc = $(document);
	var idlistTop = $idlist.offset().top;
	Cpo.on('show-detail', function (ctar) {
		detail.style.visibility = 'hidden';
		detail.style.marginTop = '0px';
		var id = ctar.innerHTML;
		if (id.slice(-3)==='.js') {
			id = ctar.parentNode.getAttribute('folder') + '/' + id;
		}
		doc.showDetail(id, 0, ctar.getAttribute('data-f'));
		setTimeout(function(){
			$dragbar.css('height', Math.max(350, $idlist.height(), $detailWrap.height()));
			var top = $doc.scrollTop();
			detail.style.marginTop = top>idlistTop ? (top-idlistTop+5)+'px' : '0px';
			detail.style.visibility = 'visible';
		}, 15);
		//dragbarHeight();
	});

	var barTimer = 0;
	function dragbarHeight(){
		clearTimeout(barTimer);
		barTimer = setTimeout(function(){
			$dragbar.css('height', Math.max(350, $idlist.height(), $detailWrap.height()));
		}, 15);
	}

	~function () { //左右拖拽
		var MIN_X = 234, MAX_X = 600;
		var offsetLeft = 0; //拖拽条的left值减去鼠标起始x
		var $doc = $(window.document.documentElement);
		var idlist = $idlist.parent()[0], dragbar = $dragbar[0],
			detailWrap = $detailWrap[0];

		var mouseMove = function(e){
			var x = e.pageX + offsetLeft; //鼠标移动时，offsetLeft+鼠标x便是新的left值
			if(x>MAX_X){
				x = MAX_X;
			}else if(x<MIN_X){
				x = MIN_X;
			}
			var y = String(x + 6) + 'px';
			idlist.style.width = y; //相差6，看样式表算出来的
			dragbar.style.marginLeft = x + 'px';
			detailWrap.style.marginLeft = '-' + y;
			detail.style.marginLeft = y;
		};
		var mouseUp = function(){
			$doc.off('mousemove', mouseMove);
			$doc.off('mouseup', mouseUp);
			document.onselectstart = function(){return true};
		};

		$dragbar.on('mousedown', function(e){
			document.onselectstart = function(){return false};
			e.preventDefault();
			offsetLeft = parseInt($dragbar.css('marginLeft')) - e.pageX;

			$doc.on('mousemove', mouseMove);
			$doc.on('mouseup', mouseUp);
		});
	}();

	function unfoldFolder(deepth) {
		var folders = $('.j-deepth-' + deepth),
			i = 0, len = folders.length;
		for (; i < len; i++) {
			Cpo.emit('open-folder', folders[i]);
		}
	}

	unfoldFolder('1');

	//渲染主内容区的列表
	~function () {
		var tpl = '<tr><td><a href="detail.html?id={0}{2}">{0}</a></td><td>{1}</td></tr>';
		var reg_id = /^[\w$]+$/, reg_htmltag = /<.*?>/g;
		var ids = [], id2desc = {}, html = '',
			i, len, item, id;
		for (i = 0, len = src.length; i<len; i++) {
			item = src[i];
			id = item.id;
			if (id && reg_id.test(id)) { // && !id2desc[id]
				item._rid && (id += '|'+item.f);
				ids.push(id);
				id2desc[id] = clip(item.desc.replace(reg_htmltag, ''), 80);
			}
		}
		ids.sort(function (a, b) {
			return a.toLowerCase()<b.toLowerCase() ? -1 : 1;
		});
		for (i = 0, len = ids.length; i<len; i++) {
			id = ids[i];
			if (id.indexOf('|')>0) {
				item = id.split('|');
				item = [item[0], id2desc[id], '&f='+encodeURIComponent(item[1])];
			} else {
				item = [id, id2desc[id], ''];
			}
			html += Tpl.simple(tpl, item);
		}
		$('#mainlist').html(html);
	}();

}();
