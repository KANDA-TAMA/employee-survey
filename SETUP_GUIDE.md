# 従業員アンケートシステム - セットアップガイド

## 1. Google Cloud設定

このシステムはGoogle Sheetsをデータベースとして使用するため、Google Cloudの設定が必要です。

### 手順
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、新しいプロジェクトを作成します。
2. **APIとサービス** > **ライブラリ** から「Google Sheets API」を検索し、有効化します。
3. **APIとサービス** > **認証情報** > **認証情報を作成** > **サービスアカウント** を選択します。
   - 任意の名前（例: `survey-system`）を入力し、作成・続行をクリックします。
   - ロールは特に設定しなくても大丈夫ですが、「編集者」などを付与しても構いません。
4. 作成されたサービスアカウントをクリックし、**キー** タブを開きます。
   - **鍵を追加** > **新しい鍵を作成** > **JSON** を選択し、ダウンロードします。
   - このJSONファイルは認証に必要なので大切に保管してください。

## 2. スプレッドシートの準備

1. [Google Sheets](https://docs.google.com/spreadsheets/) で新しいスプレッドシートを作成します。
2. スプレッドシートのURLからIDをコピーします。
   - `https://docs.google.com/spreadsheets/d/`**`この部分`**`/edit...`
3. 右上の「共有」ボタンをクリックし、先ほど作成したサービスアカウントのメールアドレス（client_email）を**編集者**として追加します。

## 3. 環境変数の設定

プロジェクトルート（`C:\Users\kanda\.gemini\antigravity\scratch\employee-survey`）に `.env.local` ファイルを作成し、以下の内容を記述します。

```env
# ダウンロードしたJSONファイルの client_email
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com

# ダウンロードしたJSONファイルの private_key（改行コード\nを含む全体）
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# スプレッドシートのID
GOOGLE_SPREADSHEET_ID=あなたのスプレッドシートID
```

> [!NOTE]
> `GOOGLE_PRIVATE_KEY` は `"` で囲み、改行は `\n` として1行で記述してください。

## 4. 起動と初期化

1. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
2. ブラウザで `http://localhost:3000/admin/settings` にアクセスします。
3. 「シート構造を修復/初期化」ボタンをクリックして、スプレッドシートに必要なシートを作成させます。

## 5. 使い方

- **管理者ダッシュボード**: `http://localhost:3000/admin`
  - ここからアンケートを作成・管理できます。
- **回答者トップページ**: `http://localhost:3000`
  - 公開中のアンケート一覧が表示されます。
