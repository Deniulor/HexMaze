cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.TiledSize = 80; //单个地格大小
        this.MapWidth = 18; //地图宽度
        this.MapHeight = 18; //地图高度
        this.TiledOffset = this.TiledSize / 2;
        this.XSpacing = this.TiledSize * 3 / 4;
        this.playerX = 8;
        this.playerY = 8;

        for(var x = 0; x < this.MapWidth; ++x){
            for(var y = 0;y < this.MapHeight; ++y){
                let node = new cc.Node();
                let label = node.addComponent(cc.Label);
                label.fontSize = 12;
                label.lineHeight = 12;
                //label.string = cc.js.formatStr("%s(%s,%s)", x*18+y, x, y);
                label.string = cc.js.formatStr("(%s,%s)", x, y);
                node.position = this.toPixelLoc(x,y);
                label.string = cc.js.formatStr("(%s,%s)\n(%s,%s)", node.position.x, node.position.y, x, y);
                node.rotation = -90;
                this.node.addChild(node);
            }
        }


        this.node.on('touchend',this.move,this);


        var bg = this.node.parent.getChildByName('mask');
        bg.on("touchstart", function(event){
            event.stopPropagation();
        }, bg);
    },

    startGame:function(){
        this.map = [];
        for(var i = 0; i < this.MapWidth * this.MapHeight; ++i){
            this.map.push([]);
        }
        for(var x = 0; x < this.MapWidth; ++x){
            for(var y = 0; y < this.MapHeight; ++y){

            }
        }


        this.node.parent.getChildByName('mask').active = false;
    },

    getLocNum:function(x,  y){
        return x + y * this.MapWidth;
    },

    move:function(event){
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = this.toHexagonLoc(temp);
        cc.log('touchloc:(%s, %s) -> (%s, %s)', temp.x, temp.y, loc.x, loc.y);
        
        var round = this.getRound(this.playerX, this.playerY);
        if(this.search(round, loc.x, loc.y) === null){
            return;
        }
        var target = this.toPixelLoc(loc.x, loc.y);
        var cur = this.toPixelLoc(this.playerX, this.playerY);

        this.node.runAction(cc.moveBy(0.05, cc.p((cur.y - target.y)* 2.5, (target.x - cur.x) * 2.5)));
        this.playerX = parseInt(loc.x + 0.1);
        this.playerY = parseInt(loc.y + 0.1);
    },

    /// 基础函数 - 获取一个点周围的点坐标
    getRound:function (x, y){
        return [cc.p(x + 0, y + 1),// 上
                cc.p(x + 1, y + 1 - x % 2),// 右上
                cc.p(x + 1, y + 0 - x % 2),// 右下
                cc.p(x + 0, y - 1),// 下
                cc.p(x - 1, y + 1 - x % 2),// 左上
                cc.p(x - 1, y + 0 - x % 2)];// 左下
    },

    /// 基础函数 - 查询某个数组里面是否含有 px，py坐标的点
    search:function (arr, px, py) {  
        var i = arr.length;  
        while (i--) {
            if (arr[i].x == px && arr[i].y == py) {  
                return arr[i];
            }  
        }  
        return null;  
    },

    /// 基础函数 - 将一个像素坐标点转为六边形地图坐标
    toHexagonLoc:function(loc){
        var x = parseInt((loc.x + 3 - this.TiledSize / 4) / this.XSpacing);
        var y = parseInt((loc.y + 3 - (x + 1) % 2 * this.TiledOffset + this.TiledOffset) / this.TiledSize);
        return cc.p(x, y);
    },

    /// 基础函数 - 将一个六边形地图坐标转为像素坐标点
    toPixelLoc:function(x, y){
        return cc.p(x * this.XSpacing + this.TiledOffset, y * this.TiledSize + (x + 1) % 2 * this.TiledOffset);
    },
});
