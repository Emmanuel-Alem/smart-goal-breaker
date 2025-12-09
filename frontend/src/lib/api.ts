const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Task {
  id: number;
  description: string;
  step_number: number;
}

export interface Goal {
  id: number;
  title: string;
  complexity_score: number;
  created_at: string;
  tasks: Task[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface RateLimitStatus {
  requests_this_minute: number;
  requests_today: number;
  max_per_minute: number;
  max_per_day: number;
}

export async function createGoal(title: string, model?: string): Promise<Goal> {
  const response = await fetch(`${API_URL}/api/goals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create goal");
  }

  return response.json();
}

export async function getGoals(): Promise<Goal[]> {
  const response = await fetch(`${API_URL}/api/goals/`);

  if (!response.ok) {
    throw new Error("Failed to fetch goals");
  }

  return response.json();
}

export async function getGoal(id: number): Promise<Goal> {
  const response = await fetch(`${API_URL}/api/goals/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch goal");
  }

  return response.json();
}

export async function deleteGoal(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/goals/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete goal");
  }
}

export async function deleteAllGoals(): Promise<void> {
  const response = await fetch(`${API_URL}/api/goals/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete all goals");
  }
}

export async function updateGoal(id: number, title: string, model?: string): Promise<Goal> {
  const response = await fetch(`${API_URL}/api/goals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update goal");
  }

  return response.json();
}

export async function getModels(): Promise<AIModel[]> {
  const response = await fetch(`${API_URL}/api/goals/models`);

  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }

  return response.json();
}

export async function getRateLimitStatus(): Promise<RateLimitStatus> {
  const response = await fetch(`${API_URL}/api/goals/rate-limit/status`);

  if (!response.ok) {
    throw new Error("Failed to fetch rate limit status");
  }

  return response.json();
}
