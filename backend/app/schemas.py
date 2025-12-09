from pydantic import BaseModel
from datetime import datetime
from typing import List


class TaskBase(BaseModel):
    description: str
    step_number: int


class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True


class GoalCreate(BaseModel):
    title: str
    model: str | None = None


class GoalResponse(BaseModel):
    id: int
    title: str
    complexity_score: int
    created_at: datetime
    tasks: List[TaskResponse]

    class Config:
        from_attributes = True


class AIBreakdownResponse(BaseModel):
    complexity_score: int
    tasks: List[str]
