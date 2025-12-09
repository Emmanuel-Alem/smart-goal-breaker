from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from ..database import get_db
from ..models import Goal, Task
from ..schemas import GoalCreate, GoalResponse
from ..services.ai_service import break_down_goal, RateLimitExceededError, rate_limiter, get_available_models

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("/models")
async def get_models():
    """Get list of available AI models."""
    return get_available_models()


@router.post("/", response_model=GoalResponse)
async def create_goal(goal_data: GoalCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Get AI breakdown
        ai_result = await break_down_goal(goal_data.title, model_name=goal_data.model)

        # Create goal
        goal = Goal(
            title=goal_data.title,
            complexity_score=ai_result["complexity_score"]
        )
        db.add(goal)
        await db.flush()

        # Create tasks
        for i, task_desc in enumerate(ai_result["tasks"], 1):
            task = Task(
                goal_id=goal.id,
                description=task_desc,
                step_number=i
            )
            db.add(task)

        await db.commit()
        await db.refresh(goal)

        # Reload with tasks
        result = await db.execute(
            select(Goal).options(selectinload(Goal.tasks)).where(Goal.id == goal.id)
        )
        goal = result.scalar_one()

        return goal

    except RateLimitExceededError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[GoalResponse])
async def get_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Goal).options(selectinload(Goal.tasks)).order_by(Goal.created_at.desc())
    )
    goals = result.scalars().all()
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Goal).options(selectinload(Goal.tasks)).where(Goal.id == goal_id)
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: int, goal_data: GoalCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Find existing goal
        result = await db.execute(
            select(Goal).options(selectinload(Goal.tasks)).where(Goal.id == goal_id)
        )
        goal = result.scalar_one_or_none()

        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

        # Get new AI breakdown
        ai_result = await break_down_goal(goal_data.title, model_name=goal_data.model)

        # Update goal
        goal.title = goal_data.title
        goal.complexity_score = ai_result["complexity_score"]

        # Delete old tasks
        for task in goal.tasks:
            await db.delete(task)

        # Create new tasks
        for i, task_desc in enumerate(ai_result["tasks"], 1):
            task = Task(
                goal_id=goal.id,
                description=task_desc,
                step_number=i
            )
            db.add(task)

        await db.commit()

        # Reload with new tasks
        result = await db.execute(
            select(Goal).options(selectinload(Goal.tasks)).where(Goal.id == goal.id)
        )
        goal = result.scalar_one()

        return goal

    except HTTPException:
        raise
    except RateLimitExceededError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{goal_id}")
async def delete_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id)
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()

    return {"message": "Goal deleted successfully"}


@router.delete("/")
async def delete_all_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal))
    goals = result.scalars().all()

    for goal in goals:
        await db.delete(goal)

    await db.commit()

    return {"message": f"Deleted {len(goals)} goals successfully"}


@router.get("/rate-limit/status")
async def get_rate_limit_status():
    """Get current rate limit usage."""
    return rate_limiter.get_usage()
