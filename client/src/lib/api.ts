import { apiRequest } from "./queryClient";
import type { User, InsertUser, ClaimHistory } from "@shared/schema";

export interface ClaimResponse {
  user: User;
  pointsAwarded: number;
}

export const api = {
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
    create: async (userData: InsertUser): Promise<User> => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    claimPoints: async (userId: number): Promise<ClaimResponse> => {
      const response = await apiRequest("POST", `/api/users/${userId}/claim`);
      return response.json();
    },
  },
  claimHistory: {
    getAll: async (limit?: number): Promise<(ClaimHistory & { user: User })[]> => {
      const url = limit ? `/api/claim-history?limit=${limit}` : "/api/claim-history";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  },
};
