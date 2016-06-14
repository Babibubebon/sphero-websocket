# sphero-websocket

## 使い方
### サーバ
#### モジュールをインストール
```
$ npm install --save sphero-websocket
```

#### 設定ファイルを作成
カレントディレクトリに、設定ファイル`sphero-ws-config.js`を作成する。  
例:
```javascript
module.exports = {
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [
        {name: "Miku", port: "/dev/rfcomm0"},
        {name: "Rin", port: "/dev/rfcomm1"}
    ]
};
```
- **wsPort**
  サーバのポート番号
- **allowedOrigin**
  接続を許可するoriginを指定する。`*`ならば全て許可。複数指定はArrayで与える。
- **Sphero**
  サーバに接続するSpheroを列挙する。
  - **name** 識別名(省略可)
  - **port** 接続ポート

#### サーバーを起動する

`sphero-ws-config.js`があるディレクトリにて実行。
```
$ "./node-modules/.bin/sphero-websocket"
```

package.jsonのscriptsを次のようにすると、いい感じになる。

```js
"scripts": {
  "server": "sphero-websocket",
  "server-test": "sphero-websocket --test"
}
```

次のようにできるようになる。

```
$ npm run server

もしくは、--test オプションをつけて実行
$ npm run server-test
```

`--test`オプションを付けると、実際にデバイスには接続せずログ出力のみとなる。

### クライアント
ここから先、ポート番号は、`8080`を使っていることとする。  
sphero-ws-config.js でポート番号を変更することができる。

#### example
[http://localhost:8080/client/](http://localhost:8080/client/)

#### （Client側ライブラリ）sphero-client.js
読み込みは、次のようにしてできる。
```html
<script src="http://localhost:8080/client/sphero-client.js"></script>
```

以下のような感じで、[Sphero.js](https://github.com/orbotix/sphero.js)っぽく使える。
```js
var orb = new sphero();
orb.connect("ws://127.0.0.1:8080", function() {
    orb.color("FF00FF");
    orb.roll(100, 0);
});
```

#### API

Spheroのコマンド(API)については、Sphero.js([JavaScript API Doc](http://sdk.sphero.com/community-apis/javascript-sdk/))を参照。  
  
以下のコマンドが叩けるようになっている。Data Streaming系のコマンドとか、レスポンスを返すのは未実装。  
- sphero.js/lib/devices/sphero.js
- sphero.js/lib/devices/custom.js

##### orb.connect(uri, [successCallback], [errorCallback])
- `uri`は接続先WebSocketサーバのURI
- `successCallback`と`errorCallback`は、それぞれ接続成功、接続失敗時に呼び出される。

##### orb.getList(callback)
サーバに接続されているSpheroの名前のリストを返す。`callback`の引数にSpheroの名前のArrayが渡される。

##### orb.use(name)
使うSpheroを設定する。`name`に使いたいSpheroの名前を指定する。
