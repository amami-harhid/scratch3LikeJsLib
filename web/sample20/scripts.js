/**
 * Sample20
 * メッセージを送信受信し、フキダシ(SAY,THINK)を制御する
 * メッセージはEventEmitterを使い実装している。
 * EventEmitterは同一IDの受信(on)の定義は10個までの制限があるが、
 * 『whenBroadcastReceived』を使うことで、同一IDの受信登録数について
 * 実装上の上限はない（ただし受信登録数が極端に多いときは動きが遅くなるかも）
 */
const [Libs,P,Pool] = [likeScratchLib.libs, likeScratchLib.process, likeScratchLib.pool];
import {
    bubbleTextArr, 
    bubbleTextArr2, 
    MessageCat1Say, 
    MessageCat2Say,
    MessageCat2Think,
    MessageByeBye,
    MessageTAIJYO} from './bubble.js';

P.preload = async function preload() {
    this.loadImage('../assets/backdrop.png','BackDrop');
    this.loadImage('../assets/cat.svg','Cat1');
    this.loadImage('../assets/cat2.svg','Cat2');
}
P.prepare = async function prepare() {
    Pool.stage = new Libs.Stage("stage");
    Pool.stage.addImage( P.images.BackDrop );

    Pool.cat = new Libs.Sprite("Cat");
    Pool.cat.setRotationStyle( Libs.RotationStyle.LEFT_RIGHT );
    Pool.cat.addImage( P.images.Cat1 );
    Pool.cat.addImage( P.images.Cat2 );
    Pool.cat.position = {x: -150, y: 0}
    Pool.cat.direction = 90;
    Pool.cat2 = new Libs.Sprite("Cat2");
    Pool.cat2.setRotationStyle( Libs.RotationStyle.LEFT_RIGHT );
    Pool.cat2.addImage( P.images.Cat1 );
    Pool.cat2.addImage( P.images.Cat2 );
    Pool.cat2.direction = -90;
    Pool.cat2.position = {x: 150, y: 0}
}

P.setting = async function setting() {

    const BubbleScale = {scale:{x:100,y:100}};
    Pool.stage.whenFlag( async function() {
        // 1秒待つ
        await Libs.wait(1000);
        
        // (↓)順番にメッセージを送って待つ

        //(左) "こんにちは。良い天気ですね"
        await this.broadcastAndWait(MessageCat1Say, bubbleTextArr[0], 3); // 3 
        //(右) "💚こんにちは💚青空がよい感じですね"
        await this.broadcastAndWait(MessageCat2Say, bubbleTextArr2[0], 1); // 1
        //(右) "どこにおでかけですか"
        await this.broadcastAndWait(MessageCat2Say, bubbleTextArr2[1], 2); // 2
        //(左) "ちょっと近くのスーパーに買い物にいくんですよ"
        await this.broadcastAndWait(MessageCat1Say, bubbleTextArr[1], 1); // 1
        //(右) "あらあらそれはいいですね"
        await this.broadcastAndWait(MessageCat2Think, bubbleTextArr2[2], 4); // 4
        // お互いに退場
        await this.broadcastAndWait(MessageByeBye, "それでは、また！", 2); // 4
        this.broadcast(MessageTAIJYO);

    });
    Pool.cat.whenBroadcastReceived(MessageCat1Say, async function() {
        const me = this;
        // 上下に揺らす。
        await me.repeat(10, _=>{
            me.setXY(me.position.x, me.position.y+2);
        });
        await me.repeat(10, _=>{
            me.setXY(me.position.x, me.position.y-2);
        });
    });
    Pool.cat.whenBroadcastReceived(MessageCat1Say, async function(text,time) {
        // Cat の フキダシ を出す
        //console.log('CAT フキダシ time='+time + " text="+text);
        if(time>0) {
            await this.sayForSecs(text, time, BubbleScale);
        }else{
            this.say(text);
        }
    });
    Pool.cat.whenBroadcastReceived(MessageTAIJYO, async function() {
        // Cat 退場
        //console.log('Cat 退場');
        this.say('');
        this.direction *= -1;
        await this.while(true, _=>{
            this.moveSteps(5);
            if(this.isTouchingEdge()) {
                Libs.Loop.break();
            }
        });
        this.visible = false; 
    });
    Pool.cat2.whenBroadcastReceived(MessageTAIJYO, async function() {
        // Cat2 退場
        //console.log('Cat2 退場');
        this.say('');
        this.direction *= -1;
        await this.while(true, _=>{
            this.moveSteps(5);
            if(this.isTouchingEdge()) {
                Libs.Loop.break();
            }
        });
        this.visible = false;         
    });
    Pool.cat2.whenBroadcastReceived(MessageCat2Say, async function() {
        const me = this;
        // 上下に揺らす。
        await me.repeat(10, _=>{
            me.setXY(me.position.x, me.position.y+2);
        });
        await me.repeat(10, _=>{
            me.setXY(me.position.x, me.position.y-2);
        });    
    });
    Pool.cat2.whenBroadcastReceived(MessageCat2Say, async function(text="", time=-1) {
        // Cat2 の フキダシ を出す
        //console.log('CAT2 フキダシ time='+time + " text="+text);
        if(time>0) {
            await this.sayForSecs(text, time, BubbleScale);
        }else{
            this.say(text);
        }    
    });
    Pool.cat2.whenBroadcastReceived(MessageCat2Think, async function(text="", time=-1) {
        // Cat2 の フキダシ を出す
        //console.log('CAT2 フキダシ time='+time + " text="+text);
        if(time>0) {
            await this.thinkForSecs(text, time);
        }else{
            this.think(text);
        }    
    });
    Pool.cat.whenBroadcastReceived(MessageByeBye, async function(text="", time=-1) {
        // それでは、という
        //console.log('CAT フキダシ time='+time + " text="+text);
        await this.thinkForSecs(text, time);
    });
    Pool.cat2.whenBroadcastReceived(MessageByeBye, async function(text="", time=-1) {
        // それでは、という
        //console.log('CAT2 フキダシ time='+time + " text="+text);
        await this.sayForSecs(text, time);
    });

}