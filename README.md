# sphero-websocket


## 使い方
ライブラリをインストール。

    $ npm install

設定ファイル`config.js`を適宜書き換える。
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
  接続を許可するoriginを指定する。`*`ならば全て許可。
- **Sphero**
  サーバに接続するSpheroを列挙する。
  - **name** 識別名(省略可)
  - **port** 接続ポート

サーバーを起動する。

    $ node server.js
