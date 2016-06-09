# sphero-websocket

## 使い方
### サーバ

```
$ npm install --save sphero-websocket
```

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

サーバーを起動する。

#### グローバルインストールした場合:

`sphero-ws-config.js`があるディレクトリにて実行。
```
$ sphero-websocket
```

### そうでないとき

`sphero-ws-config.js`があるディレクトリにて実行。
```
$ "./node-modules/.bin/sphero-websocket"
```

package.jsonのscriptsを次のようにすると、いい感じになる。

```js
"scripts": {
  "server": "sphero-websocket"
}
```

次のようにできるようになる。

```
$ npm run server
```

`--test`オプションを付けると、実際にデバイスには接続せずログ出力のみとなる。

### クライアント
example: [client/index.html](client/index.html)  
上の手順でサーバーを起動しているときは、  
http://localhost:8080/example/ でも確認できる。  
（ポート番号は sphero-ws-config.js で変更している場合は、それにする）  
  
以下のような感じで、[Sphero.js](https://github.com/orbotix/sphero.js)っぽく使える。  
```html
<script src="sphero-client.js"></script>
<script>
var orb = new sphero();
orb.connect("ws://127.0.0.1:8080", function() {
    orb.color("FF00FF");
    orb.roll(100, 0);
});
</script>
```

Spheroのコマンド(API)については、Sphero.js([JavaScript API Doc](http://sdk.sphero.com/community-apis/javascript-sdk/))を参照。  
  
以下のコマンドが叩けるようになっている。Data Streaming系のコマンドとか、レスポンスを返すのは未実装。  
- sphero.js/lib/devices/sphero.js
- sphero.js/lib/devices/custom.js

#### orb.connect(uri, [successCallback], [errorCallback])
- `uri`は接続先WebSocketサーバのURI
- `successCallback`と`errorCallback`は、それぞれ接続成功、接続失敗時に呼び出される。

#### orb.getList(callback)
サーバに接続されているSpheroの名前のリストを返す。`callback`の引数にSpheroの名前のArrayが渡される。

#### orb.use(name)
使うSpheroを設定する。`name`に使いたいSpheroの名前を指定する。
