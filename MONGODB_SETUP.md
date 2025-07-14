# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up for a free account or log in
3. Create a new project (e.g., "Leaderboard App")

## Step 2: Create a Database Cluster

1. Click "Create a Deployment" or "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "leaderboard-cluster")
5. Click "Create Deployment"

## Step 3: Configure Database Access

1. **Create Database User:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

2. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add only your specific IP addresses
   - Click "Confirm"

## Step 4: Get Your Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Configure Your Application

1. Create a `.env` file in your project root:
   ```bash
   touch .env
   ```

2. Add your MongoDB connection string to the `.env` file:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/leaderboard?retryWrites=true&w=majority
   ```

   **Important:** 
   - Replace `your-username` and `your-password` with your actual credentials
   - Add `/leaderboard` after `.net` to specify the database name
   - Keep your credentials secure and never commit them to version control

## Step 6: Test the Connection

1. Restart your application:
   ```bash
   npm run dev
   ```

2. Look for the connection message in your console:
   ```
   Connected to MongoDB Atlas
   Default users initialized in MongoDB
   ```

3. If you see an error, check:
   - Your connection string format
   - Username and password are correct
   - Your IP address is whitelisted
   - The database name is included in the connection string

## Step 7: Verify Data in MongoDB Atlas

1. Go back to MongoDB Atlas dashboard
2. Click "Browse Collections" on your cluster
3. You should see:
   - Database: `leaderboard`
   - Collections: `users` and `claimHistory`
   - The `users` collection should contain your 10 default users

## Database Structure

Your application will create these collections automatically:

### Users Collection
```javascript
{
  "_id": ObjectId("..."),
  "id": 1,
  "name": "Rahul",
  "points": 2156,
  "avatar": "https://images.unsplash.com/...",
  "createdAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

### ClaimHistory Collection
```javascript
{
  "_id": ObjectId("..."),
  "id": 1,
  "userId": 1,
  "pointsAwarded": 7,
  "claimedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

## Troubleshooting

**Connection Issues:**
- Check your internet connection
- Verify IP address is whitelisted
- Ensure username/password are correct
- Make sure the database name is included in the connection string

**Data Not Showing:**
- Refresh the MongoDB Atlas dashboard
- Check if the collections were created
- Verify your application is connecting to the right database

**Performance:**
- The free tier (M0) has limitations but is perfect for development
- For production, consider upgrading to a paid tier

## Production Deployment

For production deployment on platforms like Netlify, Vercel, or Heroku:

1. Add the `MONGODB_URI` environment variable to your hosting platform
2. Ensure your production IP addresses are whitelisted in Network Access
3. Consider using MongoDB Atlas's connection pooling for better performance

## Security Best Practices

1. Never hardcode credentials in your source code
2. Use environment variables for sensitive data
3. Regularly rotate your database passwords
4. Limit IP access to only necessary addresses
5. Monitor your database access logs

Your leaderboard application is now ready to use MongoDB Atlas for persistent data storage!