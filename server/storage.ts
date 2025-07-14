import { users, claimHistory, type User, type InsertUser, type ClaimHistory, type InsertClaimHistory } from "@shared/schema";
import { MongoClient, Db, Collection } from "mongodb";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User | undefined>;
  
  // Claim history operations
  createClaimHistory(claim: InsertClaimHistory): Promise<ClaimHistory>;
  getClaimHistory(limit?: number): Promise<(ClaimHistory & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private claimHistory: Map<number, ClaimHistory>;
  private currentUserId: number;
  private currentClaimId: number;

  constructor() {
    this.users = new Map();
    this.claimHistory = new Map();
    this.currentUserId = 1;
    this.currentClaimId = 1;
    
    // Initialize with 10 default users
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const defaultUsers = [
      { name: "Rahul", points: 2156, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Kamal", points: 1814, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Sanak", points: 1642, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Priya", points: 1285, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Amit", points: 1156, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Neha", points: 1024, avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Rajesh", points: 892, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Sunita", points: 756, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Vikram", points: 634, avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Meera", points: 428, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
    ];

    for (const userData of defaultUsers) {
      const user: User = {
        id: this.currentUserId++,
        ...userData,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => b.points - a.points);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      name: insertUser.name,
      avatar: insertUser.avatar || null,
      points: 0,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      points: user.points + points,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createClaimHistory(insertClaim: InsertClaimHistory): Promise<ClaimHistory> {
    const claim: ClaimHistory = {
      id: this.currentClaimId++,
      ...insertClaim,
      claimedAt: new Date(),
    };
    this.claimHistory.set(claim.id, claim);
    return claim;
  }

  async getClaimHistory(limit: number = 10): Promise<(ClaimHistory & { user: User })[]> {
    const claims = Array.from(this.claimHistory.values())
      .sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime())
      .slice(0, limit);
    
    return claims.map(claim => ({
      ...claim,
      user: this.users.get(claim.userId)!,
    }));
  }
}

// MongoDB Atlas Storage Implementation
export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private usersCollection: Collection<User>;
  private claimHistoryCollection: Collection<ClaimHistory>;
  private isConnected = false;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
    this.db = this.client.db("leaderboard");
    this.usersCollection = this.db.collection<User>("users");
    this.claimHistoryCollection = this.db.collection<ClaimHistory>("claimHistory");
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to MongoDB Atlas");
      
      // Initialize with default users if collection is empty
      const userCount = await this.usersCollection.countDocuments();
      if (userCount === 0) {
        await this.initializeDefaultUsers();
      }
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
    }
  }

  private async initializeDefaultUsers(): Promise<void> {
    const defaultUsers = [
      { name: "Rahul", points: 2156, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Kamal", points: 1814, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Sanak", points: 1642, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Priya", points: 1285, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Amit", points: 1156, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Neha", points: 1024, avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Rajesh", points: 892, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Sunita", points: 756, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Vikram", points: 634, avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Meera", points: 428, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
    ];

    const usersToInsert = defaultUsers.map((userData, index) => ({
      id: index + 1,
      ...userData,
      createdAt: new Date(),
    }));

    await this.usersCollection.insertMany(usersToInsert);
    console.log("Default users initialized in MongoDB");
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = await this.usersCollection.findOne({ id });
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.usersCollection.find({}).sort({ points: -1 }).toArray();
    return users;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Get the next ID by finding the highest existing ID
    const lastUser = await this.usersCollection.findOne({}, { sort: { id: -1 } });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const user: User = {
      id: nextId,
      name: insertUser.name,
      avatar: insertUser.avatar || null,
      points: 0,
      createdAt: new Date(),
    };

    await this.usersCollection.insertOne(user);
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<User | undefined> {
    const result = await this.usersCollection.findOneAndUpdate(
      { id },
      { $inc: { points } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async createClaimHistory(insertClaim: InsertClaimHistory): Promise<ClaimHistory> {
    // Get the next ID by finding the highest existing ID
    const lastClaim = await this.claimHistoryCollection.findOne({}, { sort: { id: -1 } });
    const nextId = lastClaim ? lastClaim.id + 1 : 1;

    const claim: ClaimHistory = {
      id: nextId,
      userId: insertClaim.userId,
      pointsAwarded: insertClaim.pointsAwarded,
      claimedAt: new Date(),
    };

    await this.claimHistoryCollection.insertOne(claim);
    return claim;
  }

  async getClaimHistory(limit: number = 10): Promise<(ClaimHistory & { user: User })[]> {
    const pipeline = [
      { $sort: { claimedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ];

    const claims = await this.claimHistoryCollection.aggregate(pipeline).toArray();
    return claims as (ClaimHistory & { user: User })[];
  }
}

// Create storage instance based on environment
let storage: IStorage;

if (process.env.MONGODB_URI) {
  storage = new MongoStorage(process.env.MONGODB_URI);
  
  // Connect to MongoDB on startup
  (async () => {
    try {
      await (storage as MongoStorage).connect();
    } catch (error) {
      console.error("Failed to connect to MongoDB, falling back to memory storage:", error);
      storage = new MemStorage();
    }
  })();
} else {
  console.log("No MongoDB connection string found, using memory storage");
  storage = new MemStorage();
}

export { storage };
