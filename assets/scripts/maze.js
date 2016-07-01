cc.Class({
    extends: cc.Component,

    properties: {
        ground:{
            default:null,
            type:cc.TiledLayer
        }
    },

    // use this for initialization
    onLoad: function () {
        this.TiledSize = 80; //单个地格大小
        this.MapWidth = 17; //地图宽度
        this.MapHeight = 17; //地图高度
        this.TiledOffset = this.TiledSize / 2;
        this.XSpacing = this.TiledSize * 3 / 4;
        this.playerX = 8;
        this.playerY = 8;

        // for(var x = 0; x < this.MapWidth; ++x){
        //     for(var y = 0;y < this.MapHeight; ++y){
        //         let node = new cc.Node();
        //         let label = node.addComponent(cc.Label);
        //         label.fontSize = 12;
        //         label.lineHeight = 12;
        //         //label.string = cc.js.formatStr("%s(%s,%s)", x*18+y, x, y);
        //         label.string = cc.js.formatStr("(%s,%s)", x, y);
        //         node.position = this.toPixelLoc(x,y);
        //         label.string = cc.js.formatStr("(%s,%s)\n(%s,%s)", node.position.x, node.position.y, x, y);
        //         node.rotation = -90;
        //         this.node.addChild(node);
        //     }
        // }


        this.node.on('touchend',this.move,this);


        var bg = this.node.parent.getChildByName('mask');
        bg.on("touchstart", function(event){
            event.stopPropagation();
        }, bg);
    },

    startGame:function(){
        var cur = this.toPixelLoc(this.playerX, this.playerY);
        var target = this.toPixelLoc(8, 8);
        this.clearShow();

        this.node.runAction(cc.moveBy(0.01, cc.p((cur.y - target.y)* 2.5, (target.x - cur.x) * 2.5)));
        this.playerX = 8;
        this.playerY = 8;

        this.map = [];
        for(var i = 0; i < this.MapWidth * this.MapHeight; ++i){
            this.map.push([]);
        }

        // 起点设置联通图
        var round = this.getRound(8,8);
        for(var i = 0;i < round.length; ++i){
            this.setPassable(cc.p(8,8), round[i], true);
            this.setTileGID(3, round[i]);
        }

        for(var x = 0; x < this.MapWidth; ++x){
            for(var y = 0; y < this.MapHeight; ++y){
                var gid = this.ground.getTileGIDAt(cc.p(x, y));
                if(gid != 2){ // 可以行走的地方
                    continue;
                }
                var cur = cc.p(x, y);
                var round = this.getRound(x, y);
                for(var i = 0;i < round.length; ++i){
                    if(this.getPassable(cur, round[i]) !== undefined){
                        continue;
                    }
                    this.setPassable(cur, round[i], Math.random() < 0.3);
                }
            }
        }
        this.node.parent.getChildByName('mask').active = false;
    },

    getPassable:function(loca, locb){
        var numa = parseInt(this.getLocNum(loca.x, loca.y) + 1e-3);
        var numb = parseInt(this.getLocNum(locb.x, locb.y) + 1e-3);
        if(numa < numb){
            return this.map[numa][numb];
        } else {
            return this.map[numb][numa];
        }
    },

    setPassable:function(loca, locb, value){
        var numa = parseInt(this.getLocNum(loca.x, loca.y) + 1e-3);
        var numb = parseInt(this.getLocNum(locb.x, locb.y) + 1e-3);
        if(numa < numb){
            return this.map[numa][numb] = value;
        } else {
            return this.map[numb][numa] = value;
        }
    },

    getLocNum:function(x,  y){
        return x + y * this.MapWidth;
    },

    move:function(event){
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = this.toHexagonLoc(temp);
        if(this.getTileGIDAt(loc) < 3){
            return;
        }
        
        // this.ground.setTileGID(3, cc.p(loc.x, this.MapHeight - loc.y - 1));
        var round = this.getRound(this.playerX, this.playerY);
        if(this.search(round, loc.x, loc.y) === null){
            return;
        }
        var target = this.toPixelLoc(loc.x, loc.y);
        var cur = this.toPixelLoc(this.playerX, this.playerY);

        var self = this; 
        this.node.runAction(cc.sequence(
            cc.moveBy(0.3, cc.p((cur.y - target.y)* 2.5, (target.x - cur.x) * 2.5)), 
            cc.callFunc(function(){
                self.clearShow();
                self.playerX = parseInt(loc.x + 0.1);
                self.playerY = parseInt(loc.y + 0.1);
                self.showWinner();
                self.showPassable() 
            })));
    },

    showWinner:function(){
        if(this.playerX !=8 && this.playerY != 8 && this.getTileGIDAt(cc.p(this.playerX, this.playerY)) == 4){
            this.node.parent.getChildByName('mask').active = true;
            this.node.parent.getChildByName('mask').getChildByName('winner').active = true;
            this.node.parent.getChildByName('mask').getChildByName('restart').getComponent(cc.Label).string = "重新开始";
        }
    },

    setTileGID:function(gid, loc){
        this.ground.setTileGID(gid, cc.p(loc.x, this.MapHeight - loc.y - 1));
    },

    getTileGIDAt:function(loc){
        return this.ground.getTileGIDAt(cc.p(loc.x, this.MapHeight - loc.y - 1));
    },

    clearShow:function(){
        var cur = cc.p(this.playerX, this.playerY);
        var round = this.getRound(this.playerX, this.playerY);
        for(var i = 0;i < round.length; ++i){
            if(!this.isLocValid(round[i])){
                continue;
            }
            if(this.getTileGIDAt(round[i]) == 4 || this.getTileGIDAt(round[i]) == 0){
                continue;
            }
            //cc.log("clear: (%s,%s)", round[i].x, round[i].y);
            this.setTileGID(2, round[i]);
        }
    },

    showPassable:function(){
        var cur = cc.p(this.playerX, this.playerY);
        var round = this.getRound(this.playerX, this.playerY);
        for(var i = 0;i < round.length; ++i){
            if(!this.isLocValid(round[i])){
                continue;
            }
            if(this.getTileGIDAt(round[i]) == 4 || this.getTileGIDAt(round[i]) == 0){
                continue;
            }
            //cc.log("passable: (%s,%s) %s ", round[i].x, round[i].y, this.getTileGIDAt(round[i]));
            if(this.getPassable(cur, round[i])){
                this.setTileGID(3, round[i]);
            }
        }
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

    /// 基础函数 - 获取一个点周围的点坐标
    isLocValid:function (r){
        return r.x >= 0 && r.x < this.MapWidth && r.y >= 0 && r.y < this.MapHeight;
    },
});
