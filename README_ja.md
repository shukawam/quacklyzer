# Quacklyzer

Kong の宣言的設定ファイル（YAML）を分析するためのツールです。

## Features

- Kong の宣言的設定 YAML ファイルをアップロードして解析します。
- サービス、ルート、コンシューマーの数をカウントします。
- 設定内で使用されているすべてのプラグインを一覧表示します。
- サービス、ルート、プラグイン間の関係を可視化します。
- decK ファイルの差分を可視化します。

## Getting Started

まず、Docker Compose を使って開発サーバーを起動します。

```bash
docker compose up -d
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、結果を確認します。
