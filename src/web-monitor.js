/**
 * Created by Veket on 2017/11/30.
 * 前端性能监控系统
 */
(function (window) {
    var s = window.webmonitor = {};//全局变量
    var doc = window.document;
    var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance || {};
    performance.now = (function() {
        return performance.now        ||
            performance.webkitNow     ||
            performance.msNow         ||
            performance.oNow          ||
            performance.mozNow        ||
            function() { return new Date().getTime(); };
    })();



    /**当前时间,可以用来标记时间**/
    s.now = function() {
        return performance.now()
    };

    /** 请求时间统计（在window.onload中调用）***/
    s.getTimes = function () {
        var timing = performance.timing;
        var msg = {};
        if (timing){
            //白屏时间，也就是开始解析DOM耗时
            var firstPaint = 0;
            if (window.chrome && window.chrome.loadTimes) {// Chrome
                firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
                msg.firstPaintTime = firstPaint - (window.chrome.loadTimes().startLoadTime * 1000);
            }else if (typeof timing.msFirstPaint === 'number') {// IE
                firstPaint = timing.msFirstPaint;
                msg.firstPaintTime = firstPaint - timing.navigationStart;
            }else {
                msg.firstPaintTime = currentTime - timing.navigationStart;
            }
            //加载总时间
            msg.loadTime = timing.loadEventEnd - timing.navigationStart;
            //Unload事件耗时
            msg.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
            //执行 onload 回调函数的时间
            msg.loadEventTime = timing.loadEventEnd - timing.loadEventStart;
            //用户可操作时间
            msg.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            //解析 DOM 树结构的时间
            msg.parseDomTime = timing.domComplete - timing.domInteractive;
            //重定向的时间;拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
            msg.redirectTime = timing.redirectEnd - timing.redirectStart;
            //DNS缓存耗时
            msg.appcacheTime = timing.domainLookupStart - timing.fetchStart;
            //DNS查询耗时
            msg.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
            //TCP连接耗时
            msg.connectTime = timing.connectEnd - timing.connectStart;
            //内容加载完成的时间(页面内容经过压缩了么，静态资源 css/js 等压缩了么？)
            msg.requestTime = timing.responseEnd - timing.requestStart;
            //请求文档(开始请求文档到开始接收文档)
            msg.requestDocumentTime = timing.responseStart - timing.requestStart;
            //接收文档(始接收文档到文档接收完成)
            msg.responseDocumentTime = timing.responseEnd - timing.responseStart;
            //读取页面第一个字节的时间（TTFB 即 Time To First Byte）
            msg.TTFB = timing.responseStart - timing.navigationStart;
        }
        return msg
    };

    /**
     * 资源请求列表
     * 支持ie9+,chrome,firefox
     * Safari以及很多移动浏览器不支持
     * **/
    s.getEntries =function () {
        var res = performance.getEntriesByType('resource') || [];
        var rtn = [];
        res.forEach(function(it, index) {
            var temp = {
                name:it.name,
                fileName:it.name.split("/").pop(),
                duration:it.duration
            };

            if (it.requestStart) {
                temp.requestStartDelay = it.requestStart - it.startTime;
                // DNS 查询时间
                temp.lookupDomainTime = it.domainLookupEnd - it.domainLookupStart;
                // TCP 建立连接完成握手的时间
                temp.connectTime = it.connectEnd - it.connectStart;
                // TTFB
                temp.TTFB = it.responseStart - it.startTime;
                // 内容加载完成的时间
                temp.requestTime = it.responseEnd - it.requestStart;
                // 请求区间
                temp.requestDuration = it.responseStart - it.requestStart;
                // 重定向的时间
                temp.redirectTime = it.redirectEnd - it.redirectStart;
            }

            if (it.secureConnectionStart) {
                temp.ssl = it.connectEnd - it.secureConnectionStart;
            }

            rtn.push(temp);
        });

        return rtn;
    };

    window.addEventListener('load', function() {
        setTimeout(function() {
            var time = s.getTimes();
            console.log('time',time);
            var entries = s.getEntries();
            console.log('entries',entries);
        }, 500);
    });

})(this);