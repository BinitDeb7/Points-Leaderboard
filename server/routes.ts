import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClaimHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all users with rankings
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  // Claim points for a user
  app.post("/api/users/:id/claim", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Generate random points (1-10)
      const pointsAwarded = Math.floor(Math.random() * 10) + 1;
      
      // Update user points
      const updatedUser = await storage.updateUserPoints(userId, pointsAwarded);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create claim history record
      await storage.createClaimHistory({
        userId,
        pointsAwarded,
      });

      res.json({
        user: updatedUser,
        pointsAwarded,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to claim points" });
    }
  });

  // Get claim history
  app.get("/api/claim-history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getClaimHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claim history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
