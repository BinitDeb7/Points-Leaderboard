import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Crown, Medal, Coins, Gift, ArrowLeft, UserPlus, Plus } from "lucide-react";
import type { User, InsertUser } from "@shared/schema";

export default function Leaderboard() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserAvatar, setNewUserAvatar] = useState("");
  const [activeTab, setActiveTab] = useState("live");
  const [settlementTime, setSettlementTime] = useState("2 days 01:45:32");
  const [lastClaimResult, setLastClaimResult] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => api.users.getAll(),
  });

  // Fetch claim history
  const { data: claimHistory = [] } = useQuery({
    queryKey: ["/api/claim-history"],
    queryFn: () => api.claimHistory.getAll(10),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: InsertUser) => api.users.create(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddUserModalOpen(false);
      setNewUserName("");
      setNewUserAvatar("");
      toast({
        title: "User added successfully",
        description: `${newUser.name} has been added to the leaderboard.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Claim points mutation
  const claimPointsMutation = useMutation({
    mutationFn: (userId: number) => api.users.claimPoints(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/claim-history"] });
      setLastClaimResult(`${response.user.name} earned ${response.pointsAwarded} points!`);
      setTimeout(() => setLastClaimResult(null), 3000);
      toast({
        title: "Points claimed!",
        description: `${response.user.name} earned ${response.pointsAwarded} points.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to claim points. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Settlement timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      // Mock countdown - in real app, this would be calculated from server time
      setSettlementTime("2 days 01:45:32");
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaimPoints = () => {
    if (!selectedUserId) return;
    const userId = parseInt(selectedUserId);
    claimPointsMutation.mutate(userId);
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    
    createUserMutation.mutate({
      name: newUserName.trim(),
      avatar: newUserAvatar.trim() || undefined,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const topThree = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500 w-5 h-5" />;
      case 2: return <Medal className="text-gray-400 w-5 h-5" />;
      case 3: return <Medal className="text-amber-600 w-5 h-5" />;
      default: return null;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600 border-yellow-500";
      case 2: return "from-gray-400 to-gray-600 border-gray-500";
      case 3: return "from-amber-500 to-orange-600 border-amber-500";
      default: return "from-gray-400 to-gray-600 border-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Points Leaderboard</h1>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg"
            >
              <Gift className="w-4 h-4 mr-1" />
              Rewards
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
            {["live", "hourly", "party", "family"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Ranking
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Management */}
      <div className="max-w-md mx-auto px-4 py-4">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Claim Points</h2>
            
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700 mb-2">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 mb-4">
              <Button
                onClick={handleClaimPoints}
                disabled={!selectedUserId || claimPointsMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Coins className="w-4 h-4 mr-2" />
                {claimPointsMutation.isPending ? "Claiming..." : "Claim Points"}
              </Button>
              <Button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {lastClaimResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {lastClaimResult}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settlement Timer */}
      <div className="max-w-md mx-auto px-4 mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 rounded-lg text-center shadow-lg">
          <div className="text-sm font-medium">Settlement Time</div>
          <div className="text-lg font-bold">{settlementTime}</div>
        </div>
      </div>

      {/* Main Leaderboard */}
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full transform rotate-45"></div>
            <div className="absolute top-12 right-8 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-6 h-6 bg-white rounded-full transform rotate-12"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full transform -rotate-12"></div>
          </div>
          
          <div className="text-center mb-4 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-2">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Live Ranking</h2>
          </div>
        </div>

        {/* Top Three Podium */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center items-end space-x-4">
              {topThree.map((user, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                const size = isFirst ? "w-20 h-20" : "w-16 h-16";
                const avatarSize = isFirst ? "w-14 h-14" : "w-12 h-12";
                
                return (
                  <div key={user.id} className="text-center">
                    <div className="relative mb-2">
                      <div className={`${size} bg-gradient-to-r ${getRankColors(rank)} rounded-full flex items-center justify-center text-white font-bold ${isFirst ? 'text-2xl' : 'text-xl'} shadow-lg border-2`}>
                        {rank}
                      </div>
                      {rank === 1 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Crown className="text-yellow-500 w-5 h-5" />
                        </div>
                      )}
                      {rank > 1 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                          <Medal className="text-white w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={`${user.name} profile`}
                      className={`${avatarSize} rounded-full mx-auto mb-1 border-2 ${rank === 1 ? 'border-yellow-500' : rank === 2 ? 'border-gray-400' : 'border-amber-500'}`}
                    />
                    <div className="text-sm font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-600 flex items-center justify-center">
                      <Coins className="text-yellow-500 w-3 h-3 mr-1" />
                      {user.points.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Remaining Users */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Rankings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {remainingUsers.map((user, index) => {
                const rank = index + 4;
                return (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {rank}
                      </div>
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={`${user.name} profile`}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">Active user</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-gray-800">{user.points.toLocaleString()}</div>
                      <Coins className="text-yellow-500 w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Claim History */}
        <Card className="shadow-lg mt-6">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Claims</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {claimHistory.map((claim) => (
                <div key={claim.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={claim.user.avatar || `https://ui-avatars.com/api/?name=${claim.user.name}&background=random`}
                      alt={`${claim.user.name} profile`}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{claim.user.name}</div>
                      <div className="text-xs text-gray-500">{formatTimeAgo(new Date(claim.claimedAt))}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-600 font-bold">+{claim.pointsAwarded}</div>
                    <Coins className="text-yellow-500 w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New User</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">User Name</Label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Profile Picture URL (optional)</Label>
              <Input
                value={newUserAvatar}
                onChange={(e) => setNewUserAvatar(e.target.value)}
                placeholder="Enter image URL"
                className="w-full"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddUserModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                disabled={!newUserName.trim() || createUserMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createUserMutation.isPending ? "Adding..." : "Add User"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
