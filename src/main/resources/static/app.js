var app = (function () {

    let nameTo;

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    function addPolygonCanvas(points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        console.log(points[0].x, points[0].y);
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(function (point) {
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.lineTo(point.x, point.y);
        })
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
    }

    var connectAndSubscribe = function (name) {
        nameTo = name;
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+nameTo.toString(), function (eventbody) {
                alert(eventbody);
                var theObject = JSON.parse(eventbody.body)
                addPointToCanvas(theObject);
            });

            stompClient.subscribe('/topic/newpolygon.'+nameTo.toString(), function (eventbody) {
                var theObject = JSON.parse(eventbody.body)
                addPolygonCanvas(theObject);
            });
        });

    };

    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/app/newpoint."+nameTo.toString(), {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connectionButton: function (num) {
            connectAndSubscribe(num);
        }
    };

})();