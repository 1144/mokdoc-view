!function(){
	var REP = {'  ':'　', '\t':'　　', '\n':'<br/>', '<':'&lt;', '>':'&gt;'};
	var TAG = {'class':'类', 'static':'静态方法', 'private':'私有属性', 'file':'文件注释'};
	var DETAIL = window.location.href;
	DETAIL = DETAIL.slice(0, DETAIL.lastIndexOf('/')+1)+'detail.html?';

	var reg_url = /['"]?https?:\/\/[\w-.\/?=&%#]+/g;
	var renderText = function (text) {
		return String(text).replace(reg_url, function ($0) {
			return $0.charAt(0)==='h' ? '<a href="'+$0+'" target="_blank">'+$0+'</a>' : $0;
		}).replace(/`(.+?)`/g, '<cs>$1</cs>');
	};

	doc.renderComment = function(item, pre){
		var id = item.id || item.f;
		if(pre){
			id = '- '+id.replace(pre, '');
		}
		var html = '<dl><dt><id>'+(item.t&&item.t.indexOf(' class ')>-1?'new ':'')+id+'</id>';
		var j, n, htm = '';
		if(item.p){
			var p, arg = [];
			htm = '<dd class="tit">参数：</dd><dd class="cont"><table>' +
				'<tr class="pth"><td>名称</td><td>类型</td><td>描述</td></tr>';
			for(j = 0, n = item.p.length; j < n; j++){
				p = item.p[j];
				arg.push(p.opt ? '['+p.name+']' : p.name);
				htm += '<tr><td class="pn">' + p.name + '</td><td>' +
					p.type + '</td><td>'+
						(p.opt ? '可选'+(p.val?'，默认值：'+p.val:'')+'。' : '')+
					renderText(p.desc) + '</td></tr>';
			}
			htm += '</table></dd>';
			html += '<arg>('+arg.join(', ')+')</arg>';
		} else if (item.id && !item.nf) { //文件注释没有id
			html += '<arg>()</arg>';
		}
		if(item.t){
			html += '<span>'+item.t.replace(/\w+/g, function(tag){
				return TAG[tag] || '';
			})+'</span>';
		}
		pre || (html += '<span><a title="所在文件" href="code/'+item.f+CONF.version+
			'" target="_blank">'+item.f+'</a></span></dt>');
		html += '<dd class="desc">'+renderText(item.desc)+'</dd>' + htm;
		if(item.note){
			html += '<dd class="tit">提示：</dd><dd class="cont"><ul>';
			for(j = 0, n = item.note.length; j < n; j++){
				html += '<li>▪ '+ renderText(item.note[j]) + '</li>';
			}
			html += '</ul></dd>';
		}
		if(item.rel){
			html += '<dd class="tit">相关：</dd><dd class="cont"><ul>';
			var rel, m, type, rid; //rel的格式：[type,id] 描述
			for(j = 0, n = item.rel.length; j < n; j++){
				rel = item.rel[j];
				m = rel.indexOf(']');
				if(m>0 && rel.charAt(0)==='[' && /\d/.test(rel.charAt(1))){
					type = rel.charAt(1);
					rid = $.trim(rel.slice(3, m));
					html += '<li>▪ <a target="_blank" href="detail.html?'+
						(type==='0' ? '' : 'type='+type+'&')+'id='+encodeURIComponent(rid)+'">'+
						rid +'</a> '+ rel.slice(m+1) +'</li>';
				}else{
					html += '<li>▪ '+ renderText(rel) +'</li>';
				}
			}
			html += '</ul></dd>';
		}
		if(item.r){
			html += '<dd class="tit">返回：</dd><dd class="cont">'+ item.r + '</dd>';
		}
		if(item.eg){
			html += '<dd class="tit">示例：</dd><dd class="eg">'+colorCode(item.eg)+'</dd>';
		}
		htm = ''; //收集作者、版本等次要信息
		if(item.author){
			htm += '<li>▪ 作者：'+ item.author + '</li>';
		}
		if(item.ver){
			htm += '<li>▪ 版本：'+ item.ver + '</li>';
		}
		if(htm){
			html += '<dd class="tit">其他：</dd><dd class="cont"><ul>'+ htm +'</ul></dd>';
		}
		return html+'</dl>';
	};

	doc.renderDict = function(item){
		var id = item.id;
		var html = '<dl><dt>[字典] <id>'+id+'</id><span><a title="所在文件" href="code/'+item.f+CONF.version+
			'" target="_blank">'+item.f+'</a></span></dt><dd class="desc">'+
			renderText(item.desc)+'</dd><dd class="tit">字典值表：</dd><dd class="cont"><table>'+
			'<tr class="pth"><td>值</td><td>描述</td><td>所在文件</td></tr>';
		var j, n, values = DICT_CONTENT[id] || [];
		for(j = 0, n = values.length; j < n; j++){
			html += '<tr><td class="pn">'+ values[j].val +'</td><td>' +
				renderText(values[j].desc) +'</td><td><a href="code/'+
				values[j].f+CONF.version+'" target="_blank">'+ values[j].f +'</a></td></tr>';
		}
		return html+'</table></dd></dl>';
	};

	doc.renderKnow = function(item){
		var j, n, htm = '';
		var html = '<dl><dt><id>'+ item.id +'</id><span><a title="所在文件" href="code/'+item.f+CONF.version+
			'" target="_blank">'+item.f+'</a></span></dt>'+
			'<dd class="desc">'+renderText(item.desc)+'</dd>';
		if(item.note){
			html += '<dd class="tit">提示：</dd><dd class="cont"><ul>';
			for(j = 0, n = item.note.length; j < n; j++){
				html += '<li>▪ '+ renderText(item.note[j]) + '</li>';
			}
			html += '</ul></dd>';
		}
		if(item.rel){
			html += '<dd class="tit">相关：</dd><dd class="cont"><ul>';
			var rel, m, type, rid; //rel的格式：[type,id] 描述
			for(j = 0, n = item.rel.length; j < n; j++){
				rel = item.rel[j];
				m = rel.indexOf(']');
				if(m>0 && rel.charAt(0)==='[' && /\d/.test(rel.charAt(1))){
					type = rel.charAt(1);
					rid = $.trim(rel.slice(3, m));
					html += '<li>▪ <a target="_blank" href="detail.html?'+
						(type==='0' ? '' : 'type='+type+'&')+'id='+encodeURIComponent(rid)+'">'+
						rid +'</a> '+ rel.slice(m+1) +'</li>';
				}else{
					html += '<li>▪ '+ renderText(rel) +'</li>';
				}
			}
			html += '</ul></dd>';
		}
		if(item.eg){
			html += '<dd class="tit">示例：</dd><dd class="eg">'+colorCode(item.eg)+'</dd>';
		}
		htm = ''; //收集作者、版本等次要信息
		if(item.author){
			htm += '<li>▪ 作者：'+ item.author + '</li>';
		}
		if(item.ver){
			htm += '<li>▪ 版本：'+ item.ver + '</li>';
		}
		if(htm){
			html += '<dd class="tit">其他：</dd><dd class="cont"><ul>'+ htm +'</ul></dd>';
		}
		return html+'</dl>';
	};
	
	//展示数据
	//item 单条注释数据。type=0时，item可能是一个id
	//type 0 评论，1 数据字典，2 知识库
	doc.showDetail = function(item, type, f){
		var html;
		if (type===0) {
			var src = ALL_COMMENTS, len = src.length, i, id;
			if (typeof item==='string') {
				id = item, item = '';
				if (id.slice(-3)==='.js') {
					for (i = 0; i < len; i++) {
						if (src[i].f===id) {
							item = src[i];
							break;
						}
					}
				} else {
					for (i = 0; i < len; i++) {
						if (src[i].id===id && src[i].f===f) {
							item = src[i];
							break;
						}
					}
				}
				item || (item = {id:id, desc:'', f:'', nf:true});
			}

			var j = item.id.lastIndexOf('.'), parentItem;
			if (j>0) {
				//有“父级”对象，先查找并渲染父级对象
				id = item.id.slice(0, j);
				for (i = 0; i < len; i++) {
					if (src[i].id===id) {
						parentItem = src[i];
						break;
					}
				}
				html = doc.renderComment(parentItem || {id:id, desc:'', f:'', nf:true});
				html += doc.renderComment(item, id+'.');
			} else {
				html = doc.renderComment(item);
			}

			//展示挂在当前id下的所有属性
			id = item.id+'.';
			for (i = 0; i < len; i++) {
				if ((src[i].id || '').indexOf(id)===0 &&
					src[i].id.slice(id.length).indexOf('.')<0) {
					html += doc.renderComment(src[i], id);
				}
			}
		} else if (type===1) {
			html = doc.renderDict(item);
		} else if (type===2) {
			html = doc.renderKnow(item);
		}
		if (item.id) {
			html += '<p class="addr">文档地址：<input title="可以复制给小伙伴~" '+
				'size="80" type="text" onclick="this.select();" value="'+DETAIL+
				(type===0 ? '' : 'type='+type+'&')+'id='+encodeURIComponent(item.id)+
				(item._rid ? '&f='+encodeURIComponent(item.f) : '')+'" /></p>';
		}
		$('#detail').html(html);

		type<2 && doc.addHistory(item._rid ? item.id+'|'+item.f : item.id, type);
	};

	doc.addHistory = function (id, type) {
		if (!id) {return}
		id = String(type)+id;
		var hist = Cookie.get('hist');
		if (hist) {
			hist = hist.split(',');
			var i = hist.length;
			while (i--) {
				if (id===hist[i]) {
					hist.splice(i, 1);
					break;
				}
			}
		} else {
			hist = [];
		}
		hist.push(id);
		hist.length>50 && hist.shift(0);
		Cookie.set('hist', hist.join(','));
	};
	
}();
