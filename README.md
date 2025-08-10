# DineSpot - 外食記録アプリ

外食体験を地図上で記録・共有できるソーシャルプラットフォーム

## 機能

- 🗺️ **地図機能**: Mapboxを使用したインタラクティブな地図
- 📍 **投稿機能**: お店での食事体験を写真と共に記録
- 👤 **認証機能**: Supabase認証（Google OAuth対応）
- ❤️ **ソーシャル機能**: いいね機能
- 📱 **レスポンシブUI**: Instagram風のモダンなデザイン

## 技術スタック

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase, Prisma ORM
- **Map**: Mapbox GL JS
- **Forms**: Conform + Zod + Server Actions
- **State**: Zustand
- **Testing**: Vitest, React Testing Library, Playwright

## 環境設定

1. 必要な環境変数を設定してください：

```bash
cp .env.example .env.local
```

2. `.env.local`に以下の値を設定：

```env
# Database (Supabase)
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-access-token"
```

3. Prismaデータベースの初期化：

```bash
npx prisma migrate dev
npx prisma generate
```

## 開発

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# リント
npm run lint

# テスト
npm run test
npm run test:e2e
```

## セットアップ手順

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)でプロジェクト作成
2. Google OAuth設定
3. データベースURL取得

### 2. Mapbox設定

1. [Mapbox](https://mapbox.com)でアカウント作成
2. アクセストークン取得

### 3. データベース初期化

```bash
npx prisma db push
```

アプリが http://localhost:3000 で起動します。
