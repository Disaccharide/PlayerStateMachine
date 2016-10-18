//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private Move(picture:egret.Bitmap,X:number,Y:number):void{
        var SI = egret.Tween.get(picture);
        SI.to({x:X,y:Y}, 500);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private Player:PlayerRole;

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {

        var sky:egret.Bitmap = this.createBitmapByName("map_png");
        this.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        sky.touchEnabled = true;

        /*wolf.width = 1.5*wolf.width;
        wolf.height = 1.5*wolf.height;
        wolf.anchorOffsetX = wolf.width/2;
        wolf.anchorOffsetY = wolf.height*9/10;
        wolf.x = 50;
        wolf.y = 700;*/

        this.Player=new PlayerRole();
        this.Player.x = 150;
        this.Player.y = 700;
        this.addChild(this.Player);
       
        this.Player.IdleAnimation();


        this.touchEnabled=true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.Moveba,this);

        /*function onClick(e:egret.TouchEvent):void{
            if(e.stageY >= 600){
                var targetPoin :egret.Point = sky.globalToLocal(e.stageX,e.stageY);
                wolf.x = targetPoin.x;
                wolf.y = targetPoin.y;
            }
        }*/


        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this)
    }

    private Moveba(evt:egret.TouchEvent):void {   
         this.Player.MoveAnimation(evt.stageX,evt.stageY);   
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result:Array<any>):void {
        var self:any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr:Array<Array<egret.ITextElement>> = [];
        for (var i:number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change:Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            var tw = egret.Tween.get(textfield);
            tw.to({"alpha": 1}, 200);
            tw.wait(2000);
            tw.to({"alpha": 0}, 200);
            tw.call(change, self);
        };

        change();
    }
}

class PlayerRole extends egret.DisplayObjectContainer {
    public Role:egret.Bitmap;
    private PS:StateMachine =new StateMachine;
    public MoveSpeed:number=20;
    public Modle:number=0;
    public Idle:Array<egret.Texture>=new Array<egret.Texture>();
    public Move:Array<egret.Texture>=new Array<egret.Texture>();

    public constructor(){
       super();
       this.Role=this.createBitmapByName("stand_01_png");
       this.addChild(this.Role);
       this.LoadIdel();
       this.width = this.Role.width*2;
       this.height = this.Role.height*2;
       this.anchorOffsetX=this.Role.width*0.9;
       this.anchorOffsetY=this.Role.height*0.9;
   }

    public LoadIdel(){
        var wolf:egret.Texture = RES.getRes("stand_01_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_02_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_03_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_04_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_05_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_06_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_07_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_08_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_09_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("stand_10_png");
        this.Idle.push(wolf);
        wolf = RES.getRes("run_01_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_02_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_03_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_04_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_05_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_06_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_07_png");
        this.Move.push(wolf);
        wolf = RES.getRes("run_08_png");
        this.Move.push(wolf);
    }

    public Play(Array:Array<egret.Texture>){
        var count =0;
        var Picture=this.Role;
        var M=this.Modle;
        var timer:egret.Timer=new egret.Timer(125, 0);
        timer.addEventListener(egret.TimerEvent.TIMER,PlayAnimation,this);
        timer.start();

        function PlayAnimation(){      
            Picture.texture=Array[count];
            if(count<Array.length-1) {
                count++;}
            else{count=0;}
            if(this.Modle!=M){timer.stop();}   
        }  
    }

    public MoveAnimation(x:number,y:number) {
        var MA:PlayerMoveState=new PlayerMoveState(x,y,this);
        this.PS.Reload(MA);  
    }
    
    public IdleAnimation() {
       var IA:PlayerIdelState=new PlayerIdelState(this);
       this.PS.Reload(IA);
    }

    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}

class StateMachine{
    private now:State;
     
    public Reload(S:State):void{
         if(this.now){
            this.now.onExit();
         }  
            this.now=S;
            this.now.onEnter();
     }
}

interface State{
    onEnter();
    onExit();
}

class PlayerIdelState implements State{
    private Player:PlayerRole;
    constructor(Player:PlayerRole){  
        this.Player=Player;
    }  
    onEnter() {
        this.Player.Modle=0;
        this.Player.Play(this.Player.Idle);
      
    }
    onExit() {
    }
}

class PlayerMoveState implements State{
    private _targetX:number;
    private _targetY:number;
    private Player:PlayerRole;
    private timer: egret.Timer;
    private LeastTime:number;

    constructor(x:number,y:number,Player:PlayerRole){
        this._targetY=y;
        this._targetX=x;
        this.Player=Player;

    }

    onEnter() {
        
        this.Player.Modle++;
        var X=this._targetX- this.Player.x;
        var Y=this._targetY- this.Player.y;
        if(X>0){this.Player.scaleX=1;}else{this.Player.scaleX=-1;}
        var Z=Math.pow(X*X+Y*Y,0.5);
        var time:number=Z/this.Player.MoveSpeed;
        this.timer = new egret.Timer(50, time);
        this.LeastTime=time;
        this.timer.addEventListener(egret.TimerEvent.TIMER,()=>{
            this.Player.x+=X/time;
            this.Player.y+=Y/time;
             this.LeastTime--;
            if( this.LeastTime<1) {
                this.timer.stop();
                if(this.LeastTime>-10) {this.Player.IdleAnimation();}
             }
        }, this);
        this.timer.start();
        this.Player.Play(this.Player.Move);
    }
    onExit() {
        this.LeastTime=-10;
    }
}
