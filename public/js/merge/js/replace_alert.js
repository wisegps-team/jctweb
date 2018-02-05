
;window.alert = function() {
	resetHtml(arguments[0]);
	drawToast(arguments[0]);
	// document.write(arguments[0]);
};

var intervalCounter = 0;
var toastHTML = "";
var timeout_handle;

function hideToast()
{
	clearTimeout(timeout_handle);
	var alert = document.getElementById("toast");
	alert.style.opacity = 0;
	alert.style.display = 'none';
};

function drawToast(message, timeout)
{
	resetHtml(message);
	var alert = document.getElementById("toast");
	if (alert == null) {
        toastHTML = '<div id="toast"><span id="message">' + message + '</span></div>';
        // document.body.insertAdjacentHTML('')
        // document.body.insertAdjacentHTML('beforeEnd', toastHTML);
		$('#alerting').append(toastHTML);

	}
	else{
		alert.style.opacity = .6;
		alert.style.display = 'block';
	}

	if (timeout_handle) {
		clearTimeout(timeout_handle);
	}

	timeout = timeout ? timeout : 3000;
	timeout_handle = setTimeout("hideToast()", timeout);
};

function resetHtml(message){
	$("#message").html(message);
};

/*case_banner*/
$(function() {
	jQuery.focus = function(slid) {
		var sWidth = $(slid).width(); //获取焦点图的宽度（显示面积）
		var len = $(slid).find("ul li").length; //获取焦点图个数
		var index = 0;
		var picTimer;
		
		//以下代码添加数字按钮和按钮后的半透明条，还有上一页、下一页两个按钮
		var btn = "<div class='btnBg'></div><div class='btn'>";
		for(var i=0; i < len; i++) {
			var ii = i+1;
			btn += "<span>"+ii+"</span>";
		}
		btn += "</div><div class='preNext pre'></div><div class='preNext next'></div>";
		$(slid).append(btn);
		$(slid).find("div.btnBg").css("opacity",0.5);
	
		//为小按钮添加鼠标滑入事件，以显示相应的内容
		$(slid+" div.btn span").css("opacity",0.4).mouseenter(function() {
			index = $(slid+" .btn span").index(this);
			showPics(index);
		}).eq(0).trigger("mouseenter");
	
		//上一页、下一页按钮透明度处理
		$(slid+" .preNext").css("opacity",0.2).hover(function() {
			$(this).stop(true,false).animate({"opacity":"0.5"},300);
		},function() {
			$(this).stop(true,false).animate({"opacity":"0.2"},300);
		});
	
		//上一页按钮
		$(slid+" .pre").click(function() {
			index -= 1;
			if(index == -1) {index = len - 1;}
			showPics(index);
		});
	
		//下一页按钮
		$(slid+" .next").click(function() {
			index += 1;
			if(index == len) {index = 0;}
			showPics(index);
		});
	
		//本例为左右滚动，即所有li元素都是在同一排向左浮动，所以这里需要计算出外围ul元素的宽度
		$(slid+" ul").css("width",sWidth * (len));
		
		//鼠标滑上焦点图时停止自动播放，滑出时开始自动播放
		$(slid).hover(function() {
			clearInterval(picTimer);
		},function() {
			picTimer = setInterval(function() {
				showPics(index);
				index++;
				if(index == len) {index = 0;}
			},3000); //此3000代表自动播放的间隔，单位：毫秒
		}).trigger("mouseleave");
		
		//显示图片函数，根据接收的index值显示相应的内容
		function showPics(index) { //普通切换
			var nowLeft = -index*sWidth; //根据index值计算ul元素的left值
			$(slid+" ul").stop(true,false).animate({"left":nowLeft},300); //通过animate()调整ul元素滚动到计算出的position
			$(slid+" .btn span").removeClass("on").eq(index).addClass("on"); //为当前的按钮切换到选中的效果
			$(slid+" .btn span").stop(true,false).animate({"opacity":"0.4"},300).eq(index).stop(true,false).animate({"opacity":"1"},300); //为当前的按钮切换到选中的效果
		}
	
	};
	
});