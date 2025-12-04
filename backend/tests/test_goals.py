import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Smart Goal Breaker API"
    assert data["status"] == "running"


@pytest.mark.asyncio
async def test_get_goals_empty(client: AsyncClient):
    response = await client.get("/api/goals/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_goal(client: AsyncClient):
    mock_ai_response = {
        "complexity_score": 5,
        "tasks": [
            "Step 1: Research the market",
            "Step 2: Create a business plan",
            "Step 3: Build an MVP",
            "Step 4: Get initial users",
            "Step 5: Iterate and improve"
        ]
    }
    
    with patch("app.routes.goals.break_down_goal", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = mock_ai_response
        
        response = await client.post(
            "/api/goals/",
            json={"title": "Launch a startup"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Launch a startup"
        assert data["complexity_score"] == 5
        assert len(data["tasks"]) == 5


@pytest.mark.asyncio
async def test_get_goal_not_found(client: AsyncClient):
    response = await client.get("/api/goals/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Goal not found"


@pytest.mark.asyncio
async def test_delete_goal(client: AsyncClient):
    mock_ai_response = {
        "complexity_score": 3,
        "tasks": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
    }
    
    with patch("app.routes.goals.break_down_goal", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = mock_ai_response
        
        create_response = await client.post(
            "/api/goals/",
            json={"title": "Test goal to delete"}
        )
        goal_id = create_response.json()["id"]
        
        delete_response = await client.delete(f"/api/goals/{goal_id}")
        assert delete_response.status_code == 200
        
        get_response = await client.get(f"/api/goals/{goal_id}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_goal_not_found(client: AsyncClient):
    response = await client.delete("/api/goals/999")
    assert response.status_code == 404
