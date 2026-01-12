# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/your_database

# S3 Storage Configuration
S3_ENDPOINT=https://hel1.your-objectstorage.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
```

## S3 Bucket Configuration

The S3 bucket name is hardcoded to `"onboarding"` in `src/lib/s3.ts`.

If you need to use a different bucket name, edit line 16 in `src/lib/s3.ts`:

```typescript
export const S3_BUCKET = "your-bucket-name"; // Change this
```

## Next Steps

1. Create a `.env.local` file in the project root
2. Add your environment variables
3. Run database migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

- All calls to `base44.entities.*` now go through API routes to your PostgreSQL database
- All calls to `base44.Core.UploadFile()` now upload to your S3 storage
- No changes to frontend code were needed

