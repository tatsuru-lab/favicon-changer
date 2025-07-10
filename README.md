# Favicon Control

Change the favicon of any page on any site so that it can be easily recognized just by browsing tabs. Set up custom rules to automatically apply specific favicons based on URL patterns or keywords.

## Features

- **Automatic Favicon Application**: Set up rules once, and favicons change automatically when you visit matching websites
- **Multiple Icon Sources**: Use external image URLs, upload your own images, or select from bundled icons
- **Flexible Matching Rules**: 
  - **URL Prefix Matching**: Apply favicons to specific domains or paths (e.g., `github.com`, `example.com/docs`)
  - **Keyword Matching**: Apply favicons when URLs contain specific keywords (e.g., `jira`, `staging`)
- **Multi-language Support**: Interface available in English and Japanese
- **Real-time Preview**: See your changes instantly as you configure them

## Installation

### From Source

1. Download or clone this repository to your local machine
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle switch in the top right corner
4. Click the "Load unpacked" button
5. Select the directory where you downloaded or cloned this repository

### From Chrome Web Store

*(Coming soon)*

## How to Use

### Setting Up Favicon Rules

1. Click the Favicon Control extension icon in your browser toolbar
2. This will open the options page where you can configure favicon rules
3. **Add a New Rule**:
   - **Matching Rule**: Enter either:
     - A URL prefix (e.g., `github.com`, `example.com/docs`) for domain/path-specific rules
     - A keyword (e.g., `jira`, `staging`) to match anywhere in the URL
   - **Choose Icon Source**: Select one of three options:
     - **External Image URL**: Provide a direct link to an image file
     - **Bundled Icon**: Choose from pre-included icons
     - **Upload New Icon**: Upload your own image file (PNG, JPG, ICO, SVG)
4. Click "Save Setting" to activate the rule

### Automatic Favicon Changes

Once you've set up rules:
- Navigate to any website that matches your rules
- The favicon will automatically change to your specified icon
- The change happens instantly without requiring any manual action

### Managing Existing Rules

- View all your current rules in the "Current Settings" section
- Click on any existing rule to edit it
- Use the language selector to switch between English and Japanese
- Delete rules by editing them and clearing the form

## Rule Priority

- **Keyword rules** take precedence over prefix rules
- **Longer prefix matches** take precedence over shorter ones
- Rules are evaluated automatically on every page load

## Examples

### URL Prefix Rules
- `github.com` → Applies to all GitHub pages
- `example.com/docs` → Applies only to the docs section
- `jira.company.com` → Applies to your company's Jira instance

### Keyword Rules
- `staging` → Applies to any URL containing "staging"
- `dev` → Applies to any URL containing "dev"
- `admin` → Applies to any URL containing "admin"

## Technical Details

- **Permissions**: Requires `tabs`, `storage`, and `scripting` permissions for automatic favicon replacement
- **Manifest Version**: Uses Manifest V3 for enhanced security
- **Storage**: Settings sync across devices when logged into Chrome
- **Image Processing**: Automatically resizes uploaded images to 16x16 pixels

---

# Favicon Control (日本語)

任意のサイトのファビコンを変更して、タブを見るだけで簡単に識別できるようにします。URLパターンやキーワードに基づいて特定のファビコンを自動適用するカスタムルールを設定できます。

## 機能

- **自動ファビコン適用**: 一度ルールを設定すれば、マッチするウェブサイトにアクセスした際に自動でファビコンが変更される
- **複数のアイコンソース**: 外部画像URL、独自画像のアップロード、バンドルアイコンから選択可能
- **柔軟なマッチングルール**: 
  - **URLプレフィックスマッチング**: 特定のドメインやパスにファビコンを適用（例：`github.com`、`example.com/docs`）
  - **キーワードマッチング**: URLに特定のキーワードが含まれる場合にファビコンを適用（例：`jira`、`staging`）
- **多言語サポート**: 英語と日本語でインターフェースが利用可能
- **リアルタイムプレビュー**: 設定中に変更を即座に確認可能

## インストール

### ソースから

1. このリポジトリをローカルマシンにダウンロードまたはクローン
2. Google Chromeで`chrome://extensions/`にアクセス
3. 右上の「デベロッパーモード」トグルスイッチを有効にする
4. 「パッケージ化されていない拡張機能を読み込む」ボタンをクリック
5. ダウンロード／クローンしたディレクトリを選択

### Chrome Web Storeから

*(近日公開予定)*

## 使用方法

### ファビコンルールの設定

1. ブラウザツールバーのFavicon Control拡張機能アイコンをクリック
2. オプションページが開き、ファビコンルールを設定できます
3. **新しいルールを追加**:
   - **マッチングルール**: 以下のいずれかを入力:
     - URLプレフィックス（例：`github.com`、`example.com/docs`）でドメイン/パス固有のルール
     - キーワード（例：`jira`、`staging`）でURL内の任意の場所でマッチ
   - **アイコンソースを選択**: 3つのオプションから1つを選択:
     - **外部画像URL**: 画像ファイルへの直接リンクを提供
     - **バンドルアイコン**: 事前に含まれているアイコンから選択
     - **新しいアイコンをアップロード**: 独自の画像ファイル（PNG、JPG、ICO、SVG）をアップロード
4. 「設定を保存」をクリックしてルールを有効化

### 自動ファビコン変更

ルールを設定すると:
- ルールにマッチするウェブサイトにアクセスした際
- ファビコンが指定したアイコンに自動変更される
- 手動操作なしで即座に変更が適用される

### 既存ルールの管理

- 「現在の設定」セクションで全ルールを確認
- 既存のルールをクリックして編集
- 言語セレクターで英語と日本語を切り替え
- ルールの編集とフォームのクリアで削除

## ルールの優先度

- **キーワードルール**がプレフィックスルールより優先
- **より長いプレフィックスマッチ**がより短いものより優先
- ルールはページ読み込みごとに自動評価

## 例

### URLプレフィックスルール
- `github.com` → 全GitHubページに適用
- `example.com/docs` → docsセクションのみに適用
- `jira.company.com` → 会社のJiraインスタンスに適用

### キーワードルール
- `staging` → "staging"を含む任意のURLに適用
- `dev` → "dev"を含む任意のURLに適用
- `admin` → "admin"を含む任意のURLに適用

## 技術詳細

- **権限**: 自動ファビコン置換のため`tabs`、`storage`、`scripting`権限が必要
- **マニフェストバージョン**: セキュリティ強化のためManifest V3を使用
- **ストレージ**: Chromeにログイン時にデバイス間で設定が同期
- **画像処理**: アップロード画像を自動的に16x16ピクセルにリサイズ
