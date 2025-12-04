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

export async function createGoal(title: string): Promise<Goal> {
  const response = await fetch(`${API_URL}/api/goals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
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

export async function updateGoal(id: number, title: string): Promise<Goal> {
  const response = await fetch(`${API_URL}/api/goals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update goal");
  }

  return response.json();
}
